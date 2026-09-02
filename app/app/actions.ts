"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function acceptDisclaimer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("profiles")
    .update({ disclaimer_accepted_at: new Date().toISOString() })
    .eq("id", user.id);

  revalidatePath("/app");
}
