import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { getPlanById } from "@/lib/plans";
import { isCheckoutEnabled } from "@/lib/payment/config";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const plan = await getPlanById(planId);
  if (!plan) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="app-shell">
      <AppHeader email={user!.email ?? ""} />
      <main className="app-main" style={{ maxWidth: 480 }}>
        <h2 style={{ fontSize: 26, marginBottom: 24 }}>Confirm your plan</h2>
        <div className="card">
          <div className="plan-top">
            <span className="plan-name">{plan.name}</span>
          </div>
          <div className="price">
            ₹{plan.price_inr.toLocaleString("en-IN")}
            <em> /{plan.billing_interval}</em>
          </div>
          <p className="plan-sub">
            Access for {plan.duration_days} days from the moment payment is confirmed.
          </p>

          {isCheckoutEnabled() ? (
            <form action="/api/checkout" method="post">
              <input type="hidden" name="planId" value={plan.id} />
              <button type="submit" className="btn btn-fill" style={{ width: "100%" }}>
                Proceed to pay
              </button>
            </form>
          ) : (
            <div className="setup-notice" style={{ margin: 0, maxWidth: "none" }}>
              Online payments aren&rsquo;t live yet. Contact us and we&rsquo;ll set this plan up
              for you directly.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
