import { NextRequest, NextResponse } from "next/server";
import { getDayFromSupabase } from "@/app/lib/db";
import { getSupabase } from "@/app/lib/supabase-server";

const REPORT_TOKEN = process.env.REPORT_API_TOKEN ?? "";

const REPORT_TIMEZONE = "Asia/Kolkata";

function todayDateStr(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: REPORT_TIMEZONE });
}

function timeFromIso(iso: string | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const h = d.getHours();
    const min = d.getMinutes();
    return `${h}:${min < 10 ? "0" : ""}${min}`;
  } catch {
    return "";
  }
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!REPORT_TOKEN || token !== REPORT_TOKEN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!getSupabase()) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 }
    );
  }

  // Use date from query if provided (GAS passes its date so report matches app timezone)
  let dateStr = request.nextUrl.searchParams.get("date")?.trim() || "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) dateStr = todayDateStr();
  const dayData = await getDayFromSupabase(dateStr);
  if (!dayData) {
    return NextResponse.json(
      { date: dateStr, done: [], notDone: [] },
      { status: 200 }
    );
  }

  const done: { text: string; time: string }[] = [];
  const notDone: string[] = [];
  for (const t of dayData.tasks) {
    if (t.completed) {
      done.push({ text: t.text, time: timeFromIso(t.timestamp) });
    } else {
      notDone.push(t.text);
    }
  }

  return NextResponse.json({
    date: dateStr,
    done,
    notDone,
  });
}
