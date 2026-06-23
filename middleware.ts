import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED = ["/update", "/dispatch", "/archive", "/start"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const session = request.cookies.get("session");
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/update/:path*", "/dispatch/:path*", "/archive/:path*", "/start/:path*"],
};
