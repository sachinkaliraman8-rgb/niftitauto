import { notFound } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import { createClient } from "@/lib/supabase/server";
import { getPurchaseById } from "@/lib/purchases";

export default async function ConfirmPaymentPage({
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

  if (purchase.status !== "pending") {
    return (
      <div className="app-shell">
        <AppHeader email={user!.email ?? ""} />
        <main className="app-main" style={{ maxWidth: 480 }}>
          <div className="card center">
            <p>This purchase is already {purchase.status}.</p>
            <a href="/app" className="btn btn-line" style={{ marginTop: 16 }}>
              Go to app
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <AppHeader email={user!.email ?? ""} />
      <main className="app-main" style={{ maxWidth: 480 }}>
        <div className="card center">
          <p style={{ color: "var(--muted)", fontSize: 13.5, marginBottom: 6 }}>
            Standing in for a real payment gateway
          </p>
          <h2 style={{ fontSize: 24, marginBottom: 10 }}>
            {purchase.plans?.name} — ₹{purchase.total_amount.toLocaleString("en-IN")}
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 26 }}>
            No real payment gateway is connected yet. Click below to simulate a successful
            payment and activate this plan on your account.
          </p>
          <form action="/api/payment/mock-confirm" method="post">
            <input type="hidden" name="purchaseId" value={purchase.id} />
            <button type="submit" className="btn btn-fill" style={{ width: "100%" }}>
              Simulate payment success
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
