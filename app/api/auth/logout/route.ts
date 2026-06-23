import { NextResponse } from "next/server";
import { deleteSession } from "../../../../lib/auth";

export async function POST(request: Request) {
  await deleteSession(request);
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set("session", "", { maxAge: 0, path: "/" });
  return response;
}
