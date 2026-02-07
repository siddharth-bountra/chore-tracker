"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallButton() {
  const [showButton, setShowButton] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const isStandalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true);

    if (isStandalone) {
      setShowButton(false);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    setShowButton(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setShowButton(false);
      setDeferredPrompt(null);
    } else {
      setShowInstructions(true);
    }
  }

  if (!showButton) return null;

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={buttonStyle}
        aria-label="Install Chore Tracker app"
      >
        Download
      </button>
      {showInstructions && (
        <div style={overlayStyle} onClick={() => setShowInstructions(false)} role="dialog" aria-label="Install instructions">
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <p style={modalTitleStyle}>Add to Home screen</p>
            <p style={modalTextStyle}>
              Open the browser menu (⋮) and tap <strong>Install app</strong> or{" "}
              <strong>Add to Home screen</strong> to install Chore Tracker.
            </p>
            <button type="button" onClick={() => setShowInstructions(false)} style={dismissStyle}>
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const buttonStyle: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#fff",
  background: "#1a1a1a",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  flexShrink: 0,
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 20,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: 12,
  padding: 24,
  maxWidth: 320,
  boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
};

const modalTitleStyle: React.CSSProperties = {
  margin: "0 0 12px",
  fontSize: "1.15rem",
  fontWeight: 700,
};

const modalTextStyle: React.CSSProperties = {
  margin: "0 0 20px",
  fontSize: "1rem",
  lineHeight: 1.5,
  color: "#333",
};

const dismissStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 16px",
  fontSize: "1rem",
  fontWeight: 600,
  color: "#fff",
  background: "#1a1a1a",
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
};
