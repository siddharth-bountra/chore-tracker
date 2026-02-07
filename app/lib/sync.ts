/**
 * Offline-first sync: queue toggles when offline or on failure, flush when online.
 * Last-writer-wins per (date, taskId). Single source of truth remains the cloud (GAS).
 */

const QUEUE_KEY = "chore-tracker-queue";
const LAST_SYNC_KEY = "chore-tracker-last-sync";

export interface QueuedToggle {
  date: string;
  taskId: string;
  completed: boolean;
  ts: number;
}

function getQueue(): QueuedToggle[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setQueue(items: QueuedToggle[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
  } catch {}
}

export function addToQueue(date: string, taskId: string, completed: boolean): void {
  const q = getQueue();
  const next = q.filter((e) => !(e.date === date && e.taskId === taskId));
  next.push({ date, taskId, completed, ts: Date.now() });
  setQueue(next);
}

/** Remove one queued toggle for (date, taskId) after successful API call. */
export function removeFromQueue(date: string, taskId: string): void {
  const q = getQueue();
  const idx = q.findIndex((e) => e.date === date && e.taskId === taskId);
  if (idx === -1) return;
  const next = q.slice(0, idx).concat(q.slice(idx + 1));
  setQueue(next);
}

function lwwReduce(items: QueuedToggle[]): QueuedToggle[] {
  const byKey = new Map<string, QueuedToggle>();
  for (const e of items) {
    const key = `${e.date}:${e.taskId}`;
    const existing = byKey.get(key);
    if (!existing || e.ts > existing.ts) byKey.set(key, e);
  }
  return Array.from(byKey.values());
}

export function getQueueLength(): number {
  return getQueue().length;
}

export function getLastSyncedAt(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LAST_SYNC_KEY);
    return raw ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

export function setLastSyncedAt(ts: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SYNC_KEY, String(ts));
    window.dispatchEvent(
      new CustomEvent("sync-status", { detail: { lastSyncedAt: ts } })
    );
  } catch {}
}

export type FlushCallback = (
  date: string,
  taskId: string,
  completed: boolean
) => Promise<void>;

export async function flushQueue(toggleApi: FlushCallback): Promise<void> {
  const items = lwwReduce(getQueue());
  if (items.length === 0) return;
  window.dispatchEvent(new CustomEvent("sync-start"));
  const remaining: QueuedToggle[] = [];
  for (const e of items) {
    try {
      await toggleApi(e.date, e.taskId, e.completed);
      setLastSyncedAt(Date.now());
    } catch {
      remaining.push(e);
    }
  }
  setQueue(remaining);
  window.dispatchEvent(new CustomEvent("sync-end"));
}
