"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Not an admin");

  return user;
}

async function findOrCreateUserByEmail(email: string, fullName: string) {
  const admin = createAdminClient();

  const { data: existing } = await admin.from("profiles").select("id").eq("email", email).single();
  if (existing) return existing.id;

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: randomUUID(),
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  });
  if (error) throw new Error(error.message);
  return data.user.id;
}

export async function createManualPurchase(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const email = String(formData.get("email")).trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const planId = String(formData.get("planId"));
  const totalAmount = Number(formData.get("totalAmount"));
  const amountPaid = Number(formData.get("amountPaid"));
  const paymentProvider = String(formData.get("paymentProvider") || "manual");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { data: plan, error: planError } = await admin
    .from("plans")
    .select("duration_days")
    .eq("id", planId)
    .single();
  if (planError || !plan) throw new Error("Plan not found");

  const userId = await findOrCreateUserByEmail(email, fullName);

  const now = new Date();
  const expires = new Date(now.getTime() + plan.duration_days * 24 * 60 * 60 * 1000);

  const { error } = await admin.from("purchases").insert({
    user_id: userId,
    plan_id: planId,
    status: "active",
    total_amount: totalAmount,
    amount_paid: amountPaid,
    payment_provider: paymentProvider,
    notes,
    purchased_at: now.toISOString(),
    expires_at: expires.toISOString(),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/purchases");
}

export async function recordPayment(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();

  const purchaseId = String(formData.get("purchaseId"));
  const amount = Number(formData.get("amount"));
  const note = String(formData.get("note") ?? "").trim();

  const { data: purchase, error: fetchError } = await admin
    .from("purchases")
    .select("amount_paid, notes")
    .eq("id", purchaseId)
    .single();
  if (fetchError || !purchase) throw new Error("Purchase not found");

  const combinedNotes = [purchase.notes, note].filter(Boolean).join(" | ") || null;

  const { error } = await admin
    .from("purchases")
    .update({
      amount_paid: Number(purchase.amount_paid) + amount,
      notes: combinedNotes,
    })
    .eq("id", purchaseId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/purchases");
}
