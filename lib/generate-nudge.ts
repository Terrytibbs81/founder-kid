import Anthropic from "@anthropic-ai/sdk";
import { getProfile } from "./get-profile";
import { KID_CONTEXT } from "./context";

const client = new Anthropic();

export async function generateNudge() {
  const { kidName, interests, lastWeekNotes } = await getProfile();

  const systemPrompt = `You are helping a parent have better conversations with their kid.
Your job is to generate ONE casual, text-message-sized question the parent can send
to spark interesting thinking — without it feeling like a lesson or a prompt.

Here is background on who she is:

${KID_CONTEXT}

Rules:
- One question only. No preamble, no follow-up, no challenge.
- Should sound like something a curious adult would genuinely wonder about, not a teacher.
- Must be anchored in something from her current interests — trends, influencers, aesthetics, products, social dynamics.
- Short enough to send as a text. Under 25 words ideally.
- Aim to make her notice something she already half-knows but hasn't articulated.

Output a JSON object with exactly this structure:
{
  "question": "The question to send her, exactly as you'd text it.",
  "parentNote": "One sentence on what cognitive pattern this is designed to surface and what to listen for."
}

Return only valid JSON. No preamble, no markdown, no explanation.`;

  const userPrompt = `Kid's name: ${kidName}
Current interests: ${interests.join(", ")}
Last week's notes: ${lastWeekNotes || "No notes yet."}

Generate today's nudge question.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}
