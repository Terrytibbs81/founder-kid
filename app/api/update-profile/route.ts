import { NextResponse } from "next/server";
import { kvGet, kvSet } from "../../../lib/kv";
import defaultProfile from "../../../config/profile.json";

export async function GET() {
  const profile = (await kvGet("profile")) || defaultProfile;
  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  const { interests, lastWeekNotes } = await request.json();
  const profile = (await kvGet("profile")) || defaultProfile;
  await kvSet("profile", { ...profile, interests, lastWeekNotes });
  return NextResponse.json({ success: true });
}
