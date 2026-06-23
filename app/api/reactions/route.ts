import { NextResponse } from "next/server";
import { emailToUserId } from "../../../lib/auth";
import { userGet, userSet } from "../../../lib/kv-user";

// Resend inbound email webhook
// Configure in Resend dashboard: Settings → Inbound → point to this URL
export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Resend inbound format
    const fromEmail = (data.from || "").replace(/.*<(.+)>/, "$1").trim().toLowerCase();
    const replyText = (data.text || "").split(/\n+/)[0].trim(); // first non-empty line

    if (!fromEmail || !replyText) {
      return NextResponse.json({ ok: true }); // ack but skip
    }

    const userId = emailToUserId(fromEmail);
    const currentQuestion = await userGet(userId, "currentReactionQuestion");

    const reactions = (await userGet(userId, "reactions")) || [];
    reactions.push({
      id: Date.now().toString(),
      question: currentQuestion || null,
      reply: replyText,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    });

    await userSet(userId, "reactions", reactions);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Reactions webhook error:", err);
    return NextResponse.json({ ok: true }); // always ack to avoid Resend retries
  }
}
