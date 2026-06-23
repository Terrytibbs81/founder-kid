import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { userGet, userSet } from "../../../lib/kv-user";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await userGet(session.userId, "profile");
  return NextResponse.json(profile || {});
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { interests, lastWeekNotes } = await request.json();
  const profile = await userGet(session.userId, "profile");
  await userSet(session.userId, "profile", { ...profile, interests, lastWeekNotes });
  return NextResponse.json({ success: true });
}
