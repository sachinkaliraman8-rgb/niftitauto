"use client";

import { useState, useTransition } from "react";
import styles from "@/app/app/app.module.css";
import { acceptDisclaimer } from "@/app/app/actions";

export default function DisclaimerGate() {
  const [agreed, setAgreed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (dismissed) return null;

  return (
    <div className={styles.gate}>
      <svg width="34" height="34" viewBox="0 0 24 24" style={{ marginBottom: 18 }}>
        <rect x="5" y="11" width="14" height="9" rx="2" fill="none" stroke="#14161A" strokeWidth="1.8" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="#14161A" strokeWidth="1.8" />
      </svg>
      <h2>Before you start</h2>
      <p>
        Niftit is a technical charting tool. It highlights price patterns automatically — it is
        not investment advice, gives no recommendation to buy or sell, and promises no profit.
        Trading carries real risk of loss. Every decision stays yours.
      </p>
      <label className={styles.gateLabel}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
        I understand this is not investment advice.
      </label>
      <button
        type="button"
        disabled={!agreed || isPending}
        className={`${styles.gateBtn} ${agreed ? styles.gateBtnReady : ""}`}
        onClick={() => {
          setDismissed(true);
          startTransition(() => {
            acceptDisclaimer();
          });
        }}
      >
        Continue
      </button>
    </div>
  );
}
