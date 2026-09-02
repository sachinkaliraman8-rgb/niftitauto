import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPurchaseById, activatePurchase } from "@/lib/purchases";
import { getPlanById } from "@/lib/plans";
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

  const purchase = await getPurchaseById(purchaseId, user.id);
  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  const plan = await getPlanById(purchase.plan_id);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  await activatePurchase(purchase.id, user.id, plan.duration_days);

  return NextResponse.redirect(new URL("/app", request.url));
}
