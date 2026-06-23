import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { userGet, userSet } from "../../../lib/kv-user";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { hadConversation, response: kidResponse, word } = await request.json();
  const feedback = (await userGet(session.userId, "feedback")) || [];

  feedback.push({
    hadConversation,
    response: kidResponse,
    word: word || null,
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
  });

  await userSet(session.userId, "feedback", feedback);
  return NextResponse.json({ success: true });
}
