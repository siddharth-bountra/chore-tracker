import { NextRequest, NextResponse } from "next/server";

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
  const base = GAS_URL.replace(/\/$/, "");
  const url = new URL(base);
  url.searchParams.set("action", "toggle");
  if (TOKEN) url.searchParams.set("token", TOKEN);
  url.searchParams.set("date", date);
  url.searchParams.set("taskId", taskId);
  url.searchParams.set("completed", completed === "true" ? "true" : "false");
  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(data ?? { error: "Request failed" }, { status: res.status });
    }
    if (data?.error) {
      return NextResponse.json(data, { status: 400 });
    }
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: "Could not reach server" },
      { status: 502 }
    );
  }
}
