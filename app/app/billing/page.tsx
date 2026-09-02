import type { Metadata } from "next";
import Link from "next/link";
import styles from "../app.module.css";
import { createClient } from "@/lib/supabase/server";
import {
  getUserPurchases,
  getDisplayStatus,
  getOutstanding,
  getDaysRemaining,
  type Purchase,
} from "@/lib/purchases";

export const metadata: Metadata = { title: "Billing" };

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BillingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const purchases = await getUserPurchases(user!.id);
  const current: Purchase | undefined = purchases.find((p) => getDisplayStatus(p) === "active");
  const currentDue = current ? getOutstanding(current) : 0;
  const totalSpent = purchases
    .filter((p) => getDisplayStatus(p) !== "pending")
    .reduce((sum, p) => sum + Number(p.amount_paid), 0);

  const remaining = current ? getDaysRemaining(current.expires_at) : 0;
  const totalDays = current?.plans?.duration_days ?? 1;
  const percentLeft = current ? Math.min(100, Math.max(2, Math.round((remaining / totalDays) * 100))) : 0;

  return (
    <div className={styles.shell}>
      <div className={styles.app}>
        <div className={styles.topbar}>
          <Link href="/app" className={styles.mark} style={{ fontSize: 15 }}>
            ← Back
          </Link>
          <form action="/auth/signout" method="post">
            <button type="submit" className="navlink" style={{ background: "none", border: "none", cursor: "pointer" }}>
              Log out
            </button>
          </form>
        </div>

        <div style={{ padding: "8px 20px 4px" }}>
          <h2 style={{ fontSize: 21, fontWeight: 700, margin: "0 0 4px" }}>Billing</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 20px" }}>{user!.email}</p>
        </div>

        <div style={{ padding: "0 20px" }}>
          {current ? (
            <div className="plan-hero" style={{ marginBottom: 24 }}>
              <div className="plan-hero-row">
                <div>
                  <div className="plan-hero-label">Current plan</div>
                  <div className="plan-hero-name">{current.plans?.name}</div>
                  <div className="plan-hero-sub">
                    Purchased {formatDate(current.purchased_at)} · ₹{current.amount_paid.toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="plan-hero-right">
                  <div className="plan-hero-days">
                    {remaining}
                    <span>day{remaining === 1 ? "" : "s"} left</span>
                  </div>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${percentLeft}%` }} />
              </div>
              {currentDue > 0 && (
                <div style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ color: "#E9A23B", fontSize: 14.5, fontWeight: 600 }}>
                    ₹{currentDue.toLocaleString("en-IN")} still due on this plan
                  </span>
                  <Link href={`/checkout/pay-due/${current!.id}`} className="btn btn-light btn-sm">
                    Pay now
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="setup-notice" style={{ margin: "0 0 24px", maxWidth: "none" }}>
              You don&rsquo;t have an active plan right now.{" "}
              <Link href="/app/plans" style={{ color: "var(--jade)", fontWeight: 600 }}>
                Choose a plan
              </Link>
            </div>
          )}

          <div className="stat-cards" style={{ gridTemplateColumns: "repeat(2, 1fr)" }}>
            <div className="stat-card">
              <div className="stat-card-label">Plans purchased</div>
              <div className="stat-card-value">{purchases.filter((p) => getDisplayStatus(p) !== "pending").length}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Total spent</div>
              <div className="stat-card-value">₹{totalSpent.toLocaleString("en-IN")}</div>
            </div>
          </div>

          <h3 style={{ fontSize: 15, fontWeight: 700, margin: "26px 0 12px" }}>Purchase history</h3>
          {purchases.length === 0 ? (
            <div className="section-card">
              <div className="empty-state">
                You haven&rsquo;t purchased a plan yet. <Link href="/app/plans">See plans</Link>.
              </div>
            </div>
          ) : (
            <div className="section-card">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Amount</th>
                    <th>Due</th>
                    <th>Purchased</th>
                    <th>Expires</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((p) => {
                    const status = getDisplayStatus(p);
                    const due = getOutstanding(p);
                    return (
                      <tr key={p.id}>
                        <td>{p.plans?.name ?? "—"}</td>
                        <td>₹{p.total_amount.toLocaleString("en-IN")}</td>
                        <td>
                          {due > 0 ? (
                            <Link href={`/checkout/pay-due/${p.id}`} style={{ color: "#B5791E", fontWeight: 600 }}>
                              ₹{due.toLocaleString("en-IN")} · Pay
                            </Link>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td>{formatDate(p.purchased_at)}</td>
                        <td>{formatDate(p.expires_at)}</td>
                        <td>
                          <span className={`badge badge-${status}`}>{status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className={styles.legalFine}>
          Niftit is a technical charting tool. It does not give investment advice, trade
          recommendations, or any guarantee of profit. Trading involves real risk of loss.
        </div>
      </div>
    </div>
  );
}
