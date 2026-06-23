import { NextResponse } from "next/server";
import { generateWeeklyPrompt } from "../../../lib/generate-prompt";
import { sendWeeklyEmail } from "../../../lib/send-email";
import { getAllUsers, userGet } from "../../../lib/kv-user";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await getAllUsers();
  const results: { userId: string; status: string; error?: string }[] = [];

  for (const userId of users) {
    try {
      const profile = await userGet(userId, "profile");
      if (!profile?.onboarded) {
        results.push({ userId, status: "skipped" });
        continue;
      }
      const prompt = await generateWeeklyPrompt(userId);
      await sendWeeklyEmail(prompt, profile.email, profile.kidName, profile.weeklyBudget || 15);
      if (prompt.reactionQuestion) {
        const { userSet } = await import("../../../lib/kv-user");
        await userSet(userId, "currentReactionQuestion", prompt.reactionQuestion);
      }
      results.push({ userId, status: "sent" });
    } catch (error) {
      console.error(`Failed for user ${userId}:`, error);
      results.push({ userId, status: "error", error: String(error) });
    }
  }

  return NextResponse.json({ success: true, results });
}
