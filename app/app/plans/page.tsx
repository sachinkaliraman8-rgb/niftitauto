import type { Metadata } from "next";
import Link from "next/link";
import styles from "../app.module.css";
import { getActivePlans } from "@/lib/plans";

export const metadata: Metadata = { title: "Choose a plan" };

export default async function AppPlansPage() {
  const plans = await getActivePlans();

  return (
    <div className={styles.shell}>
      <div className={styles.app}>
        <div className={styles.topbar}>
          <Link href="/app" className={styles.mark} style={{ fontSize: 15 }}>
            ← Back
          </Link>
        </div>

        <div style={{ padding: "8px 20px 4px" }}>
          <h2 style={{ fontSize: 21, fontWeight: 700, margin: "0 0 4px" }}>Choose a plan</h2>
          <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 20px" }}>
            Renew or pick a new plan to keep getting signals.
          </p>
        </div>

        {plans.length === 0 ? (
          <div className={styles.feedEmpty}>No plans available right now.</div>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                margin: "0 20px 14px",
                padding: "18px 18px",
                borderRadius: 16,
                background: "var(--paper2)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: 700, fontSize: 15.5 }}>{plan.name}</span>
                <span style={{ fontWeight: 700, fontSize: 15.5 }}>
                  ₹{plan.price_inr.toLocaleString("en-IN")}
                  <span style={{ fontWeight: 450, fontSize: 12.5, color: "var(--muted)" }}>
                    {" "}
                    /{plan.billing_interval}
                  </span>
                </span>
              </div>
              <Link
                href={`/checkout/${plan.id}`}
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 11,
                  fontWeight: 600,
                  fontSize: 14.5,
                  background: "var(--ink)",
                  color: "#fff",
                }}
              >
                Select
              </Link>
            </div>
          ))
        )}

        <div className={styles.legalFine}>
          Niftit is a technical charting tool. It does not give investment advice, trade
          recommendations, or any guarantee of profit. Trading involves real risk of loss.
        </div>
      </div>
    </div>
  );
}
