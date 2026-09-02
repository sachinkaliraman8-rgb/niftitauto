"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function parseFeatures(raw: string): string[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function createPlan(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.from("plans").insert({
    name: String(formData.get("name")),
    price_inr: Number(formData.get("price_inr")),
    billing_interval: String(formData.get("billing_interval")),
    duration_days: Number(formData.get("duration_days")),
    features: parseFeatures(String(formData.get("features") ?? "")),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    sort_order: Number(formData.get("sort_order") ?? 0),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
  revalidatePath("/");
}

export async function updatePlan(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase
    .from("plans")
    .update({
      name: String(formData.get("name")),
      price_inr: Number(formData.get("price_inr")),
      billing_interval: String(formData.get("billing_interval")),
      duration_days: Number(formData.get("duration_days")),
      features: parseFeatures(String(formData.get("features") ?? "")),
      is_active: formData.get("is_active") === "on",
      is_featured: formData.get("is_featured") === "on",
      sort_order: Number(formData.get("sort_order") ?? 0),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
  revalidatePath("/");
}

export async function deletePlan(formData: FormData) {
  const supabase = await createClient();
  const id = String(formData.get("id"));

  const { error } = await supabase.from("plans").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/plans");
  revalidatePath("/");
}
