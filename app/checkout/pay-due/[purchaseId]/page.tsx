import { notFound, redirect } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { getPurchaseById, getOutstanding } from "@/lib/purchases";
import { isCheckoutEnabled } from "@/lib/payment/config";

export default async function PayDuePage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const purchase = await getPurchaseById(purchaseId, user!.id);
  if (!purchase) notFound();

  const due = getOutstanding(purchase);
  if (due <= 0) redirect("/app/billing");

  return (
    <div className="app-shell">
      <AppHeader email={user!.email ?? ""} />
      <main className="app-main" style={{ maxWidth: 480 }}>
        <div className="card center">
          <h2 style={{ fontSize: 24, marginBottom: 10 }}>
            {purchase.plans?.name} — ₹{due.toLocaleString("en-IN")} due
          </h2>

          {isCheckoutEnabled() ? (
            <>
              <p style={{ color: "var(--muted)", marginBottom: 26 }}>
                No real payment gateway is connected yet. Click below to simulate paying off the
                remaining balance on this plan.
              </p>
              <form action="/api/payment/mock-pay-due" method="post">
                <input type="hidden" name="purchaseId" value={purchase.id} />
                <button type="submit" className="btn btn-fill" style={{ width: "100%" }}>
                  Simulate payment success
                </button>
              </form>
            </>
          ) : (
            <div className="setup-notice" style={{ margin: 0, maxWidth: "none" }}>
              Online payments aren&rsquo;t live yet. Contact us and we&rsquo;ll record this
              payment for you directly.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
