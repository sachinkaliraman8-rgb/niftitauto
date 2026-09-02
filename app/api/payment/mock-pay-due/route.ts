import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { payOutstanding } from "@/lib/purchases";
import { isCheckoutEnabled } from "@/lib/payment/config";

export async function POST(request: Request) {
  if (!isCheckoutEnabled()) {
    return NextResponse.json({ error: "Checkout isn't live yet" }, { status: 403 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const form = await request.formData();
  const purchaseId = String(form.get("purchaseId") ?? "");

  await payOutstanding(purchaseId, user.id);

  return NextResponse.redirect(new URL("/app/billing", request.url));
}
