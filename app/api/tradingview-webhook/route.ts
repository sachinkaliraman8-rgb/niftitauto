import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Point the TradingView alert at:
 *   https://<your-domain>/api/tradingview-webhook?token=<TRADINGVIEW_WEBHOOK_SECRET>
 * Alert message body (JSON):
 *   { "symbol": "NIFTY 50", "type": "buy", "price": 23812.40, "description": "Bounced off support, bias buy side" }
 *
 * Push notification fan-out to active subscribers is added once Web Push
 * is wired up — for now this only stores the signal, which active
 * subscribers already see live on /app.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? request.headers.get("x-webhook-secret");

  const expected = process.env.TRADINGVIEW_WEBHOOK_SECRET;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || !body.symbol || (body.type !== "buy" && body.type !== "sell") || !body.price) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("signals").insert({
    symbol: String(body.symbol),
    type: body.type,
    price: Number(body.price),
    description: String(body.description ?? ""),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
