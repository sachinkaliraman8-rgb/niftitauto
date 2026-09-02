"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Platform = "ios-safari" | "ios-other-browser" | "android-or-other";

export default function InstallAppButton({ compact = false }: { compact?: boolean }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<Platform>("android-or-other");
  const [isStandalone, setIsStandalone] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent;
    const isIOSDevice = /iphone|ipad|ipod/i.test(ua);
    const isIOSOtherBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
    setPlatform(isIOSDevice ? (isIOSOtherBrowser ? "ios-other-browser" : "ios-safari") : "android-or-other");

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  // Once actually installed and running standalone, there's nothing to offer.
  if (isStandalone) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }
    // Chrome hasn't fired beforeinstallprompt yet (or won't on this device/
    // browser) — fall back to manual, platform-specific instructions rather
    // than hiding the button entirely.
    setShowHint(true);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — the link is still shown as plain text below
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={compact ? "install-btn-compact" : "navlink install-btn"}>
        <svg width={compact ? 15 : 14} height={compact ? 15 : 14} viewBox="0 0 24 24">
          <path
            d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 18v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {!compact && "Install app"}
      </button>

      {showHint && (
        <div className="ios-hint-backdrop" onClick={() => setShowHint(false)}>
          <div className="ios-hint-card" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Install Niftit</p>

            {platform === "ios-safari" && (
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 4 }}>
                Tap the Share icon <ShareGlyph /> in Safari&rsquo;s toolbar, then choose{" "}
                <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
              </p>
            )}

            {platform === "ios-other-browser" && (
              <>
                <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 12 }}>
                  On iPhone, apps can only be installed from <strong>Safari</strong> — Apple
                  doesn&rsquo;t allow other browsers to do this. Open this link in Safari, then
                  tap the Share icon <ShareGlyph /> → <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                    background: "var(--paper2)",
                    borderRadius: 10,
                    padding: "8px 10px",
                  }}
                >
                  <span style={{ fontSize: 13, color: "var(--muted)", flex: 1, wordBreak: "break-all" }}>
                    {typeof window !== "undefined" ? window.location.origin : ""}
                  </span>
                  <button type="button" onClick={copyLink} className="btn btn-line btn-sm" style={{ flexShrink: 0 }}>
                    {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
              </>
            )}

            {platform === "android-or-other" && (
              <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 4 }}>
                Open the browser menu (⋮ top-right) and choose{" "}
                <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
              </p>
            )}

            <button type="button" className="btn btn-line btn-sm" style={{ marginTop: 14 }} onClick={() => setShowHint(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function ShareGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" style={{ display: "inline", verticalAlign: "-3px", margin: "0 2px" }}>
      <path
        d="M12 3v12m0-12-3.5 3.5M12 3l3.5 3.5M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
