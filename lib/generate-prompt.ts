import Anthropic from "@anthropic-ai/sdk";
import { kvGet, kvSet } from "./kv";
import defaultProfile from "../config/profile.json";

const client = new Anthropic();

const LENS_DESCRIPTIONS: Record<string, string> = {
  value:
    "How does value actually flow in the world? Who creates it, who captures it, and why?",
  desire:
    "How are wants and trends created? What does she actually want vs what she's been taught to want?",
  philosophy:
    "How have serious thinkers approached living well? What tools do they offer for right now?",
  happiness:
    "What does evidence and experience say actually produces flourishing — not pleasure, but real lasting happiness?",
  design:
    "Everything around her was designed by someone with an intention. She can design things too.",
  agency:
    "Given everything she can see — what does she want to create, become, or change?",
};

export async function generateWeeklyPrompt() {
  // Load profile from KV, fall back to config file on first run
  let profile = await kvGet("profile");
  if (!profile) {
    profile = defaultProfile;
    await kvSet("profile", profile);
  }

  // Load dispatches
  const dispatches: Array<{ title: string; body: string; date: string }> =
    (await kvGet("dispatches")) || [];
  const recentDispatches = dispatches.slice(-5);

  // Rotate lens
  const {
    kidName,
    age,
    interests,
    weeklyBudget,
    lastWeekNotes,
    lenses,
    currentLensIndex,
  } = profile;
  const currentLens = lenses[currentLensIndex % lenses.length];
  const nextLensIndex = (currentLensIndex + 1) % lenses.length;

  // Save next lens index
  await kvSet("profile", { ...profile, currentLensIndex: nextLensIndex });

  const dispatchContext =
    recentDispatches.length > 0
      ? `Parent's recent dispatches from their own life:\n\n${recentDispatches
          .map((d) => `"${d.title}" (${d.date}):\n${d.body}`)
          .join("\n\n")}`
      : "No dispatches written yet.";

  const systemPrompt = `You are helping a parent build a lifelong thinking relationship with their daughter.

The philosophy:
- Most people sleepwalk through life without realising they have a choice about how to live it
- Seeing how the world works isn't cynical — it's liberating
- Happiness comes from creating genuine value through things you care about
- The goal is a kid who authors her own life rather than living the default one
- The parent is not the teacher here. They are a genuinely curious co-explorer.

This week's lens: ${currentLens.toUpperCase()}
${LENS_DESCRIPTIONS[currentLens]}

Rules for every prompt:
- Never leading. No embedded answer. Genuine open space.
- Always anchored in something she currently cares about — never abstract
- Curious not teachy. The parent is learning alongside her.
- Points toward creation and agency, not just analysis
- The dispatch connection should feel natural, never forced — if it doesn't fit, leave parentTip focused purely on how to show up

Output only valid JSON, no markdown, no preamble:
{
  "weeklyLens": "the lens name",
  "lensDescription": "one plain sentence describing this lens for the parent",
  "openingQuestion": "the first question — casual, specific to her world, genuinely open",
  "followUp": "where to go if she engages — slightly deeper, still open",
  "creationChallenge": "one small thing to make, write, design, record, or articulate this week — minimum viable creation",
  "earningNote": "one sentence on how to frame the value exchange for this week's work",
  "dispatchConnection": "if a dispatch connects naturally to this week's lens, name it by title and explain the connection in one sentence. If nothing fits, return null.",
  "parentTip": "one sentence on how to show up — curious, not knowing the answer, ready to be surprised"
}`;

  const userPrompt = `Kid's name: ${kidName}
Age: ${age}
Current interests: ${interests.join(", ")}
Weekly budget: $${weeklyBudget}
Last week's notes: ${lastWeekNotes || "First week — no history yet."}

${dispatchContext}

Generate this week's mission package.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("");

  return JSON.parse(text);
}
