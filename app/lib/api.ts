import type { DayData } from "../types";
import { getDayFromSupabase, getTasksForDayOfWeekFromDb } from "./db";

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
  const fromSupabase = await getDayFromSupabase(date);
  if (fromSupabase !== null) return fromSupabase;

  const skipCache = options?.revalidate === 0;
  const res = await fetch(url("getDay", { date }), skipCache
    ? { cache: "no-store" }
    : { next: { revalidate: DAY_CACHE_SECONDS } });
  if (!res.ok) throw new Error("Could not load tasks");
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as DayData;
}

/** Tasks for a day of week only (no date, no status). For "other days" view. Uses Supabase only. */
export async function getDayByDow(
  dow: string
): Promise<{ tasks: { taskId: string; text: string }[] }> {
  const tasks = await getTasksForDayOfWeekFromDb(dow);
  return { tasks: tasks ?? [] };
}

export async function toggleTask(
  date: string,
  taskId: string,
  completed: boolean
): Promise<void> {
  const params = new URLSearchParams({
    date,
    taskId,
    completed: String(completed),
  });
  const apiUrl = `/api/toggle?${params.toString()}`;
  const doFetch = () => fetch(apiUrl, { cache: "no-store" });
  let res = await doFetch();
  if (!res.ok) {
    await new Promise((r) => setTimeout(r, 1000));
    res = await doFetch();
  }
  if (!res.ok) throw new Error("Could not update task");
  const data = await res.json();
  if (data?.error) throw new Error(data.error);
}
