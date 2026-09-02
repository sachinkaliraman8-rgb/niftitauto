import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export type Purchase = {
  id: string;
  user_id: string;
  plan_id: string;
  status: "pending" | "active" | "expired" | "cancelled";
  total_amount: number;
  amount_paid: number;
  payment_provider: string;
  payment_reference: string | null;
  notes: string | null;
  purchased_at: string | null;
  expires_at: string | null;
  created_at: string;
  plans?: { name: string; price_inr: number; duration_days: number } | null;
  profiles?: { email: string; full_name: string | null } | null;
};

export function getDisplayStatus(purchase: Purchase): Purchase["status"] {
  if (purchase.status === "active" && purchase.expires_at && new Date(purchase.expires_at) < new Date()) {
    return "expired";
  }
  return purchase.status;
}

export function getOutstanding(purchase: Purchase): number {
  return Math.max(0, Number(purchase.total_amount) - Number(purchase.amount_paid));
}

export function getDaysRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (24 * 60 * 60 * 1000)));
}

export type SubscriptionState = "active" | "warn" | "expired";

/** "warn" = active with 5 or fewer days left, per the app's subscription card spec. */
export function getSubscriptionState(current: Purchase | undefined): SubscriptionState {
  if (!current) return "expired";
  const remaining = getDaysRemaining(current.expires_at);
  return remaining <= 5 ? "warn" : "active";
}

export async function getUserPurchases(userId: string): Promise<Purchase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, plans(name, price_inr, duration_days)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserPurchases failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAllPurchases(): Promise<Purchase[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .select("*, plans(name, price_inr, duration_days), profiles(email, full_name)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllPurchases failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPurchaseById(id: string, userId: string): Promise<Purchase | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("purchases")
    .select("*, plans(name, price_inr, duration_days)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
  return data;
}

export async function createPendingPurchase(userId: string, planId: string, amount: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchases")
    .insert({
      user_id: userId,
      plan_id: planId,
      status: "pending",
      total_amount: amount,
      amount_paid: 0,
      payment_provider: "mock",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Settles the outstanding balance on an already-active purchase (e.g. one
 * an admin granted with a partial payment). Doesn't touch status/expiry —
 * only what's owed changes. Uses the service-role client because a user
 * has no RLS grant to update their own purchase rows.
 */
export async function payOutstanding(purchaseId: string, userId: string) {
  const admin = createAdminClient();

  const { data: purchase, error: fetchError } = await admin
    .from("purchases")
    .select("total_amount")
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .single();
  if (fetchError || !purchase) throw new Error("Purchase not found");

  const { data, error } = await admin
    .from("purchases")
    .update({
      amount_paid: purchase.total_amount,
      payment_reference: `mock_due_${purchaseId.slice(0, 8)}`,
    })
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Trusted server-only transition (pending -> active) that stamps the
 * expiry. Uses the service-role client because computing expires_at is a
 * server decision, not something a user's own RLS grant should allow.
 */
export async function activatePurchase(purchaseId: string, userId: string, durationDays: number) {
  const admin = createAdminClient();
  const now = new Date();
  const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const { data: pending, error: fetchError } = await admin
    .from("purchases")
    .select("total_amount")
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .single();
  if (fetchError) throw fetchError;

  const { data, error } = await admin
    .from("purchases")
    .update({
      status: "active",
      amount_paid: pending.total_amount,
      purchased_at: now.toISOString(),
      expires_at: expires.toISOString(),
      payment_reference: `mock_${purchaseId.slice(0, 8)}`,
    })
    .eq("id", purchaseId)
    .eq("user_id", userId)
    .eq("status", "pending")
    .select()
    .single();

  if (error) throw error;
  return data;
}
