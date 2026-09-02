"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  if (isStandalone) return null;
  if (!deferredPrompt && !isIOS) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSHint(true);
    }
  }

  return (
    <>
      <button type="button" onClick={handleClick} className="navlink install-btn">
        <svg width="14" height="14" viewBox="0 0 24 24">
          <path
            d="M12 3v12m0 0-4.5-4.5M12 15l4.5-4.5M4 18v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Install app
      </button>

      {showIOSHint && (
        <div className="ios-hint-backdrop" onClick={() => setShowIOSHint(false)}>
          <div className="ios-hint-card" onClick={(e) => e.stopPropagation()}>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>Install Niftit on iPhone</p>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 4 }}>
              Tap the Share icon <ShareGlyph /> in Safari&rsquo;s toolbar, then choose{" "}
              <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
            </p>
            <button type="button" className="btn btn-line btn-sm" style={{ marginTop: 14 }} onClick={() => setShowIOSHint(false)}>
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
