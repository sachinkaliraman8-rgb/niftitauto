import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for trusted server-only code (payment webhook,
 * mock-confirm route) that needs to write purchase state outside the
 * calling user's RLS policies. Never import this into client components.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
