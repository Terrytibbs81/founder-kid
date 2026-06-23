import { NextResponse } from "next/server";
import { verifyMagicToken, createSession, emailToUserId } from "../../../../lib/auth";
import { userGet } from "../../../../lib/kv-user";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/?error=missing", request.url));
  }

  const email = await verifyMagicToken(token);
  if (!email) {
    return NextResponse.redirect(new URL("/?error=expired", request.url));
  }

  const sessionToken = await createSession(email);
  const userId = emailToUserId(email);
  const profile = await userGet(userId, "profile");
  const isOnboarded = profile?.onboarded === true;

  const redirectTo = isOnboarded ? "/update" : "/start";
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
