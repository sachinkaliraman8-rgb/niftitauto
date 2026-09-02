import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentProvider } from "@/lib/payment";

/**
 * Wire a real gateway's webhook here once one is connected: point the
 * provider's dashboard at this URL, then have getPaymentProvider() return
 * that provider instead of the mock one. verifyWebhook() is expected to
 * check the signature and return which purchase to activate.
 */
export async function POST(request: Request) {
  const provider = getPaymentProvider();
  const payload = await request.json().catch(() => null);

  try {
    const result = await provider.verifyWebhook(payload, request.headers);

    if (result.status === "active") {
      const admin = createAdminClient();
      await admin
        .from("purchases")
        .update({
          status: "active",
          purchased_at: new Date().toISOString(),
          payment_reference: result.paymentReference,
        })
        .eq("id", result.purchaseId)
        .eq("status", "pending");
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "webhook not supported" },
      { status: 400 }
    );
  }
}
