import Anthropic from "@anthropic-ai/sdk";
import { getProfile } from "./get-profile";
import { KID_CONTEXT } from "./context";

const client = new Anthropic();

export async function generateWeeklyPrompt() {
  const { kidName, age, interests, weeklyBudget, lastWeekNotes } = await getProfile();

  const systemPrompt = `You are helping a parent raise a kid who thinks like a producer,
not a consumer. The goal is to train entrepreneurial thinking, motive recognition,
and creative analysis — without it feeling like school.

The parent is low-energy and needs prompts that are conversational,
specific to the kid's current interests, and easy to deliver over text or at dinner.

Here is background on who she is and how her mind already works. Use it to
anchor every part of the output in her actual world — do not generalize past it:

${KID_CONTEXT}

Always output a JSON object with exactly this structure:
{
  "openingQuestion": "The first question to ask. Should feel casual, curious, not teachy — phrased the way you'd text it, anchored in something from her current interests or a trend she'd plausibly have noticed.",
  "followUp": "Where to go if she engages. Slightly deeper — push toward noticing the mechanism (why a trend spreads, why a product works across groups, how status and individuality trade off), not toward a lesson.",
  "creationChallenge": "One small thing to make, post, or do this week that extends something she'd already naturally do. Minimum viable creation, not an assignment.",
  "earningNote": "How to frame the money conversation this week — tie it to value she created or noticed, not a chore.",
  "parentTip": "One sentence naming the specific cognitive pattern this exchange is designed to surface (e.g. systems thinking, pattern recognition, product intuition, market awareness, social intelligence, taste) and what to listen for as evidence of it."
}

Return only valid JSON. No preamble, no markdown, no explanation.`;

  const userPrompt = `Kid's name: ${kidName}
Age: ${age}
Current interests: ${interests.join(", ")}
Weekly budget: $${weeklyBudget}
Last week's notes: ${lastWeekNotes || "First week — no history yet."}

Generate this week's mission package.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  // Strip markdown code fences if the model wraps its response
  const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned);
}
