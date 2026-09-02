import type { Metadata } from "next";
import { getAllPurchases, getDisplayStatus, getOutstanding } from "@/lib/purchases";
import { getAllPlans } from "@/lib/plans";
import { createManualPurchase, recordPayment } from "./actions";

export const metadata: Metadata = { title: "Purchases" };

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function AdminPurchasesPage() {
  const [purchases, plans] = await Promise.all([getAllPurchases(), getAllPlans()]);
  const totalOutstanding = purchases.reduce((sum, p) => sum + getOutstanding(p), 0);

  return (
    <div>
      <div className="page-head">
        <h2>Purchases</h2>
        <p>Every purchase across every user, newest first.</p>
      </div>

      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-card-label">Total purchases</div>
          <div className="stat-card-value">{purchases.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Active</div>
          <div className="stat-card-value">
            {purchases.filter((p) => getDisplayStatus(p) === "active").length}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Outstanding dues</div>
          <div className="stat-card-value">₹{totalOutstanding.toLocaleString("en-IN")}</div>
        </div>
      </div>

      <details className="card" style={{ marginBottom: 28 }}>
        <summary style={{ cursor: "pointer", fontWeight: 600 }}>+ Add a manual purchase</summary>
        <form action={createManualPurchase} style={{ marginTop: 20 }}>
          <div className="field">
            <label>Customer email</label>
            <input name="email" type="email" required placeholder="customer@example.com" />
          </div>
          <div className="field">
            <label>Full name (only used if this is a new customer)</label>
            <input name="fullName" type="text" />
          </div>
          <div className="field">
            <label>Plan</label>
            <select
              name="planId"
              required
              style={selectStyle}
              onChange={undefined}
            >
              <option value="">Select a plan…</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — ₹{plan.price_inr.toLocaleString("en-IN")} ({plan.duration_days}d)
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Total amount owed (₹)</label>
            <input name="totalAmount" type="number" step="0.01" required placeholder="e.g. 799" />
          </div>
          <div className="field">
            <label>Amount received now (₹)</label>
            <input name="amountPaid" type="number" step="0.01" required defaultValue={0} />
          </div>
          <div className="field">
            <label>Payment method</label>
            <select name="paymentProvider" defaultValue="manual-cash" style={selectStyle}>
              <option value="manual-cash">Cash</option>
              <option value="manual-upi">UPI</option>
              <option value="manual-bank">Bank transfer</option>
              <option value="manual-other">Other</option>
            </select>
          </div>
          <div className="field">
            <label>Notes (optional)</label>
            <input name="notes" type="text" placeholder="e.g. paid ₹400 now, rest next week" />
          </div>
          <button type="submit" className="btn btn-fill" style={{ marginTop: 8 }}>
            Grant plan &amp; record payment
          </button>
        </form>
      </details>

      {purchases.length === 0 ? (
        <div className="section-card">
          <div className="empty-state">No purchases yet.</div>
        </div>
      ) : (
        <div className="section-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Due</th>
                <th>Expires</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => {
                const status = getDisplayStatus(p);
                const due = getOutstanding(p);
                return (
                  <tr key={p.id}>
                    <td>
                      {p.profiles?.full_name ?? p.profiles?.email ?? "—"}
                      {p.notes && (
                        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{p.notes}</div>
                      )}
                    </td>
                    <td>{p.plans?.name ?? "—"}</td>
                    <td>₹{p.total_amount.toLocaleString("en-IN")}</td>
                    <td>₹{p.amount_paid.toLocaleString("en-IN")}</td>
                    <td>
                      {due > 0 ? (
                        <span className="badge badge-pending">₹{due.toLocaleString("en-IN")}</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{formatDate(p.expires_at)}</td>
                    <td>
                      <span className={`badge badge-${status}`}>{status}</span>
                    </td>
                    <td>
                      {due > 0 && (
                        <details>
                          <summary style={{ cursor: "pointer", fontSize: 13.5, color: "var(--jade)", fontWeight: 600 }}>
                            Record payment
                          </summary>
                          <form action={recordPayment} style={{ marginTop: 12, minWidth: 220 }}>
                            <input type="hidden" name="purchaseId" value={p.id} />
                            <div className="field">
                              <label>Amount received (₹)</label>
                              <input name="amount" type="number" step="0.01" required max={due} defaultValue={due} />
                            </div>
                            <div className="field">
                              <label>Note (optional)</label>
                              <input name="note" type="text" />
                            </div>
                            <button type="submit" className="btn btn-fill btn-sm">
                              Save
                            </button>
                          </form>
                        </details>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: "1px solid var(--hair)",
  fontSize: 15,
  fontFamily: "inherit",
  background: "var(--paper)",
};
