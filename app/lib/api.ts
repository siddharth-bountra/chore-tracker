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

const DAY_CACHE_SECONDS = 900;

export async function getDay(
  date: string,
  options?: { revalidate?: number }
): Promise<DayData> {
  const revalidate = options?.revalidate ?? DAY_CACHE_SECONDS;
  const res = await fetch(url("getDay", { date }), {
    next: { revalidate },
  });
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
  const doFetch = () =>
    fetch(url("toggle", { date, taskId, completed: String(completed) }), {
      cache: "no-store",
    });
  let res = await doFetch();
  if (!res.ok) {
    await new Promise((r) => setTimeout(r, 1000));
    res = await doFetch();
  }
  if (!res.ok) throw new Error("Could not update task");
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
}
