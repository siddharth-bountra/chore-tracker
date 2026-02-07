import { NextRequest, NextResponse } from "next/server";
import { toggleInSupabase } from "@/app/lib/db";
import { getSupabase } from "@/app/lib/supabase-server";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL ?? "";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? "";

export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date");
  const taskId = request.nextUrl.searchParams.get("taskId");
  const completed = request.nextUrl.searchParams.get("completed");
  if (!date || !taskId) {
    return NextResponse.json(
      { error: "Missing date or taskId" },
      { status: 400 }
    );
  }
  const completedBool = completed === "true";

  if (getSupabase()) {
    try {
      await toggleInSupabase(date, taskId, completedBool);
      return NextResponse.json({ ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Toggle failed";
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  if (!GAS_URL || !TOKEN) {
    return NextResponse.json(
      {
        error:
          "Server misconfigured: set Supabase (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY) or GAS (NEXT_PUBLIC_GAS_URL, NEXT_PUBLIC_API_TOKEN).",
      },
      { status: 503 }
    );
  }
  const base = GAS_URL.replace(/\/$/, "");
  const url = new URL(base);
  url.searchParams.set("action", "toggle");
  url.searchParams.set("token", TOKEN);
  url.searchParams.set("date", date);
  url.searchParams.set("taskId", taskId);
  url.searchParams.set("completed", completedBool ? "true" : "false");
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = (data && data.error) || "Request failed";
      return NextResponse.json(
        typeof msg === "string" ? { error: msg } : data,
        { status: res.status >= 400 ? res.status : 502 }
      );
    }
    if (data && data.error) {
      return NextResponse.json(data, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      {
        error:
          "Could not reach Google Apps Script. Check NEXT_PUBLIC_GAS_URL and network.",
      },
      { status: 502 }
    );
  }
}
