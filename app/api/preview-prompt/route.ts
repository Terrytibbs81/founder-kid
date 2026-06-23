import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { generateWeeklyPrompt } from "../../../lib/generate-prompt";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const prompt = await generateWeeklyPrompt(session.userId);
    return NextResponse.json({ prompt });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
