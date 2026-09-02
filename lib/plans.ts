import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

export type Plan = {
  id: string;
  name: string;
  price_inr: number;
  billing_interval: "monthly" | "yearly" | "custom";
  duration_days: number;
  features: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
};

export async function getActivePlans(): Promise<Plan[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getActivePlans failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getAllPlans(): Promise<Plan[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllPlans failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getPlanById(id: string): Promise<Plan | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("plans").select("*").eq("id", id).single();
  return data;
}
