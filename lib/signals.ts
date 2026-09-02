import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/config";

export type Signal = {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  price: number;
  description: string;
  created_at: string;
};

/**
 * RLS restricts this to the last 20 rows for active subscribers only
 * (see has_active_subscription() in supabase/schema.sql) — an expired or
 * never-subscribed user gets an empty array here, not an error.
 */
export async function getRecentSignals(limit = 20): Promise<Signal[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("signals")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getRecentSignals failed:", error.message);
    return [];
  }
  return data ?? [];
}
