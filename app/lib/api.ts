import type { DayData } from "../types";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL ?? "";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? "";

function url(path: string, params?: Record<string, string>): string {
  const base = GAS_URL.replace(/\/$/, "");
  const u = new URL(base);
  u.searchParams.set("action", path);
  if (TOKEN) u.searchParams.set("token", TOKEN);
  if (params) {
    for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  }
  return u.toString();
}

export async function getDay(date: string): Promise<DayData> {
  const res = await fetch(url("getDay", { date }), { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load tasks");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as DayData;
}

export async function toggleTask(
  date: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const res = await fetch(url("toggle"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date, taskId, completed }),
  });
  if (!res.ok) throw new Error("Could not update task");
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
}
