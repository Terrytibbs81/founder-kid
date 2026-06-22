import { NextResponse } from "next/server";
import { generateWeeklyPrompt } from "../../../lib/generate-prompt";
import { sendWeeklyEmail } from "../../../lib/send-email";

export async function GET(request: Request) {
  // Verify this is called by Vercel cron, not randos
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const prompt = await generateWeeklyPrompt();
    await sendWeeklyEmail(prompt);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
