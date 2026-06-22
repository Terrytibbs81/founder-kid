import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const profilePath = path.join(process.cwd(), "config/profile.json");

export async function GET() {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import("@vercel/kv");
    const staticProfile = JSON.parse(readFileSync(profilePath, "utf-8"));
    const interests = await kv.get<string[]>("interests");
    const lastWeekNotes = await kv.get<string>("lastWeekNotes");
    return NextResponse.json({
      ...staticProfile,
      interests: interests ?? staticProfile.interests,
      lastWeekNotes: lastWeekNotes ?? staticProfile.lastWeekNotes,
    });
  }

  const profile = JSON.parse(readFileSync(profilePath, "utf-8"));
  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  const { interests, lastWeekNotes } = await request.json();

  if (process.env.KV_REST_API_URL) {
    const { kv } = await import("@vercel/kv");
    await kv.set("interests", interests);
    await kv.set("lastWeekNotes", lastWeekNotes);
  } else {
    const profile = JSON.parse(readFileSync(profilePath, "utf-8"));
    profile.interests = interests;
    profile.lastWeekNotes = lastWeekNotes;
    writeFileSync(profilePath, JSON.stringify(profile, null, 2));
  }

  return NextResponse.json({ success: true });
}
