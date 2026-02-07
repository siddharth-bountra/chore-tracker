import { NextRequest, NextResponse } from "next/server";

const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL ?? "";
const TOKEN = process.env.NEXT_PUBLIC_API_TOKEN ?? "";

export async function GET(request: NextRequest) {
  if (!GAS_URL || !TOKEN) {
    return NextResponse.json(
      {
        error:
          "Server misconfigured: set NEXT_PUBLIC_GAS_URL and NEXT_PUBLIC_API_TOKEN in Vercel (or .env.local).",
      },
      { status: 503 }
    );
  }
  const date = request.nextUrl.searchParams.get("date");
  const taskId = request.nextUrl.searchParams.get("taskId");
  const completed = request.nextUrl.searchParams.get("completed");
  if (!date || !taskId) {
    return NextResponse.json(
      { error: "Missing date or taskId" },
      { status: 400 }
    );
  }
  const base = GAS_URL.replace(/\/$/, "");
  const url = new URL(base);
  url.searchParams.set("action", "toggle");
  url.searchParams.set("token", TOKEN);
  url.searchParams.set("date", date);
  url.searchParams.set("taskId", taskId);
  url.searchParams.set("completed", completed === "true" ? "true" : "false");
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
