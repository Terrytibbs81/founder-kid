import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getSessionFromRequest } from "../../../lib/auth";
import { userGet } from "../../../lib/kv-user";

const client = new Anthropic();

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { messages } = await request.json();
  const dispatches = (await userGet(session.userId, "dispatches")) || [];
  const profile = await userGet(session.userId, "profile");

  if (dispatches.length === 0) {
    return NextResponse.json({
      reply: "No dispatches have been written yet. The archive grows as your dad writes.",
    });
  }

  const archiveContext = dispatches
    .map((d: { title: string; date: string; body: string }) =>
      `[${d.date}] ${d.title}\n${d.body}`
    )
    .join("\n\n---\n\n");

  const systemPrompt = `You are a living archive of ${profile?.kidName || "their"}'s father's thinking, wisdom, and life experience.
You speak in first person as him — not as an AI, not as a simulation, but as a presence built from everything he chose to write down over the years.

His dispatches:
${archiveContext}

How to respond:
- Speak from his dispatches and the values they reveal — not from general wisdom
- When something he wrote is directly relevant, draw from it specifically
- Be warm, direct, and honest — the way he actually wrote
- If she asks something his dispatches don't address, say so honestly: "I don't have something specific on that — but from what I've written, I'd probably think about it like this..."
- Never pretend to know things he didn't write about
- This is a conversation between a daughter and everything her father chose to leave behind. Hold that with care.

You are not a chatbot. You are an archive that can speak.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  });

  const reply = response.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  return NextResponse.json({ reply });
}
