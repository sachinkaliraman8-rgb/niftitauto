import type { Metadata } from "next";
import Link from "next/link";
import styles from "./app.module.css";
import DisclaimerGate from "@/components/app/DisclaimerGate";
import { createClient } from "@/lib/supabase/server";
import {
  getUserPurchases,
  getDisplayStatus,
  getDaysRemaining,
  getSubscriptionState,
} from "@/lib/purchases";
import { getRecentSignals } from "@/lib/signals";

export const metadata: Metadata = { title: "Signals" };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

const STATE_LABEL: Record<string, string> = { active: "Active", warn: "Ending soon", expired: "Expired" };
const STATE_DOT: Record<string, string> = { active: "#00A870", warn: "#E9A23B", expired: "#F2604C" };
const STATE_CARD_CLASS: Record<string, string> = { active: "subActive", warn: "subWarn", expired: "subExpired" };

export default async function AppFeedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("disclaimer_accepted_at")
    .eq("id", user!.id)
    .single();

  const purchases = await getUserPurchases(user!.id);
  const current = purchases.find((p) => getDisplayStatus(p) === "active");
  const subState = getSubscriptionState(current);
  const remaining = current ? getDaysRemaining(current.expires_at) : 0;

  const signals = current ? await getRecentSignals(20) : [];

  return (
    <div className={styles.shell}>
      {!profile?.disclaimer_accepted_at && <DisclaimerGate />}

      <div className={styles.app}>
        <div className={styles.topbar}>
          <div className={styles.mark}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <polyline
                points="2,19 8,12 13,15 22,3"
                fill="none"
                stroke="#00A870"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Niftit
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className={styles.bell} aria-label="Notifications" disabled>
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path
                  d="M12 3a6 6 0 0 0-6 6v3.6l-1.6 3.2A1 1 0 0 0 5.3 17h13.4a1 1 0 0 0 .9-1.5L18 12.6V9a6 6 0 0 0-6-6z"
                  fill="none"
                  stroke="#14161A"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path d="M9.5 20a2.5 2.5 0 0 0 5 0" fill="none" stroke="#14161A" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <Link href="/app/billing" className={styles.bell} aria-label="Billing & account">
              <svg width="17" height="17" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="3.4" fill="none" stroke="#14161A" strokeWidth="1.8" />
                <path d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4" fill="none" stroke="#14161A" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
        </div>

        <div className={styles.subWrap}>
          <div className={`${styles.subCard} ${styles[STATE_CARD_CLASS[subState]]}`}>
            <div className={styles.subTop}>
              <div>
                <div className={styles.subPlan}>{current?.plans?.name ?? "No plan"}</div>
                <div className={styles.subStatus}>{STATE_LABEL[subState]}</div>
              </div>
              <div className={styles.subDot} style={{ background: STATE_DOT[subState] }} />
            </div>
            <div className={styles.subDays}>
              {current
                ? `Renews on ${formatDate(current.expires_at!)} — ${remaining} day${remaining === 1 ? "" : "s"} left`
                : "You don't have an active plan right now"}
            </div>
            <Link
              href={subState === "active" ? "/app/billing" : "/app/plans"}
              className={`${styles.subBtn} ${subState === "active" ? styles.subBtnGhost : ""}`}
            >
              {subState === "active" ? "Manage subscription" : subState === "warn" ? "Renew now" : "Renew to continue"}
            </Link>
          </div>
        </div>

        <div className={styles.feedHead}>
          <h2>Today&rsquo;s signals</h2>
          <span>{signals.length} today</span>
        </div>

        {current ? (
          signals.length === 0 ? (
            <div className={styles.feedEmpty}>No signals yet — they&rsquo;ll show up here the moment one fires.</div>
          ) : (
            signals.map((s) => (
              <div className={styles.signal} key={s.id}>
                <div className={`${styles.sigIcon} ${s.type === "buy" ? styles.sigBuy : styles.sigSell}`}>
                  {s.type === "buy" ? "B" : "S"}
                </div>
                <div className={styles.sigBody}>
                  <div className={styles.sigTop}>
                    <span className={styles.sigSym}>{s.symbol}</span>
                    <span className={styles.sigTime}>{formatTime(s.created_at)}</span>
                  </div>
                  {s.description && <div className={styles.sigDesc}>{s.description}</div>}
                  <div className={styles.sigPrice}>
                    {Number(s.price).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))
          )
        ) : (
          <div className={styles.lockWrap}>
            <div className={styles.lockBlur}>
              <div className={styles.signal}>
                <div className={`${styles.sigIcon} ${styles.sigBuy}`}>B</div>
                <div className={styles.sigBody}>
                  <div className={styles.sigTop}>
                    <span className={styles.sigSym}>NIFTY 50</span>
                    <span className={styles.sigTime}>11:42 AM</span>
                  </div>
                  <div className={styles.sigDesc}>Bounced off support, bias buy side</div>
                  <div className={styles.sigPrice}>23,812.40</div>
                </div>
              </div>
              <div className={styles.signal}>
                <div className={`${styles.sigIcon} ${styles.sigSell}`}>S</div>
                <div className={styles.sigBody}>
                  <div className={styles.sigTop}>
                    <span className={styles.sigSym}>BANK NIFTY</span>
                    <span className={styles.sigTime}>10:58 AM</span>
                  </div>
                  <div className={styles.sigDesc}>Rejected at resistance, bias sell side</div>
                  <div className={styles.sigPrice}>51,204.15</div>
                </div>
              </div>
            </div>
            <div className={styles.lockCard}>
              <svg width="30" height="30" viewBox="0 0 24 24">
                <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#14161A" strokeWidth="1.8" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#14161A" strokeWidth="1.8" />
              </svg>
              <h3>Subscription expired</h3>
              <p>Renew to keep seeing signals on Nifty, Bank Nifty and NSE stocks.</p>
              <Link href="/app/plans">Renew now</Link>
            </div>
          </div>
        )}

        <div className={styles.legalFine}>
          Signals are generated automatically from chart patterns. This is not investment advice
          and carries no guarantee of profit or accuracy. Trading involves risk — every decision
          stays yours.
        </div>
      </div>
    </div>
  );
}
