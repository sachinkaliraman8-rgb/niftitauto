import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans";
import { createPendingPurchase } from "@/lib/purchases";
import { getPaymentProvider } from "@/lib/payment";
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
  const planId = String(form.get("planId") ?? "");
  const plan = await getPlanById(planId);
  if (!plan) {
    return NextResponse.json({ error: "Plan not found" }, { status: 404 });
  }

  const purchase = await createPendingPurchase(user.id, plan.id, plan.price_inr);

  const provider = getPaymentProvider();
  const { redirectUrl } = await provider.createOrder({
    purchaseId: purchase.id,
    amountInPaise: Math.round(plan.price_inr * 100),
    currency: "INR",
    planName: plan.name,
  });

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
