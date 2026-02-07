import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const res = NextResponse.next();
  if (request.nextUrl.pathname === "/") {
    res.headers.set(
      "Cache-Control",
      "private, no-store, no-cache, must-revalidate, max-age=0"
    );
  }
  return res;
}
