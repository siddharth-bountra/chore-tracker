"use client";

import { useState, useEffect } from "react";
import { getLastSyncedAt } from "../lib/sync";

function formatLastSynced(ts: number): string {
  const sec = Math.floor((Date.now() - ts) / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min === 1) return "1 min ago";
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr === 1) return "1 hr ago";
  return `${hr} hr ago`;
}

export function SyncStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  useEffect(() => {
    setLastSyncedAt(getLastSyncedAt());
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onSyncStart = () => setIsSyncing(true);
    const onSyncEnd = () => {
      setIsSyncing(false);
      setLastSyncedAt(getLastSyncedAt());
    };
    const onSyncStatus = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (d?.lastSyncedAt) setLastSyncedAt(d.lastSyncedAt);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("sync-start", onSyncStart);
    window.addEventListener("sync-end", onSyncEnd);
    window.addEventListener("sync-status", onSyncStatus);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("sync-start", onSyncStart);
      window.removeEventListener("sync-end", onSyncEnd);
      window.removeEventListener("sync-status", onSyncStatus);
    };
  }, []);

  if (!isOnline) {
    return (
      <p style={statusStyle} role="status">
        Offline. Changes will sync when you’re back online.
      </p>
    );
  }
  if (isSyncing) {
    return (
      <p style={{ ...statusStyle, color: "#666" }} role="status">
        Syncing…
      </p>
    );
  }
  if (lastSyncedAt !== null) {
    return (
      <p style={statusStyle} role="status">
        Synced {formatLastSynced(lastSyncedAt)}
      </p>
    );
  }
  return null;
}

const statusStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "#555",
  margin: "0 0 8px",
  textAlign: "right",
};
