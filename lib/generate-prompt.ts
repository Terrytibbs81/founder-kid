import Anthropic from "@anthropic-ai/sdk";
import { userGet, userSet } from "./kv-user";

const client = new Anthropic();

const LENS_DESCRIPTIONS: Record<string, string> = {
  value: "How does value actually flow in the world? Who creates it, who captures it, and why?",
  desire: "How are wants and trends created? What do they actually want vs what they've been taught to want?",
  philosophy: "How have serious thinkers approached living well? What tools do they offer for right now?",
  happiness: "What does evidence and experience say actually produces flourishing — not pleasure, but real lasting happiness?",
  design: "Everything around them was designed by someone with an intention. They can design things too.",
  agency: "Given everything they can see — what do they want to create, become, or change?",
};

const DEFAULT_LENSES = ["value", "desire", "philosophy", "happiness", "design", "agency"];

function getPronoun(gender: string): { subject: string; object: string; possessive: string; reflexive: string } {
  if (gender === "boy") return { subject: "he", object: "him", possessive: "his", reflexive: "himself" };
  if (gender === "girl") return { subject: "she", object: "her", possessive: "her", reflexive: "herself" };
  return { subject: "they", object: "them", possessive: "their", reflexive: "themselves" };
}

function getAgeGuidance(age: number): string {
  if (age <= 13) return "Very casual, short questions, concrete examples. No abstract framing. Feels like texting.";
  if (age <= 15) return "Conversational but can handle one layer of abstraction. Anchor in their specific world.";
  return "Near-adult. Can engage with nuance, trade-offs, and real complexity. Still grounded in their life.";
}

export async function generateWeeklyPrompt(userId: string) {
  const profile = await userGet(userId, "profile");
  if (!profile) throw new Error(`No profile found for user ${userId}`);

  const dispatches: Array<{ title: string; body: string; date: string }> =
    (await userGet(userId, "dispatches")) || [];
  const recentDispatches = dispatches.slice(-5);

  const feedback: Array<{ hadConversation: string; response: string; word?: string; date: string }> =
    (await userGet(userId, "feedback")) || [];
  const recentFeedback = feedback.slice(-3);

  const lenses: string[] = profile.lenses || DEFAULT_LENSES;
  const currentLensIndex: number = profile.currentLensIndex || 0;
  const currentLens = lenses[currentLensIndex % lenses.length];
  const nextLensIndex = (currentLensIndex + 1) % lenses.length;

  await userSet(userId, "profile", { ...profile, currentLensIndex: nextLensIndex });

  const pronoun = getPronoun(profile.gender || "girl");
  const ageGuidance = getAgeGuidance(profile.age || 13);

  const dispatchContext =
    recentDispatches.length > 0
      ? `Parent's recent dispatches:\n\n${recentDispatches
          .map((d) => `"${d.title}" (${d.date}):\n${d.body}`)
          .join("\n\n")}`
      : "No dispatches written yet.";

  const feedbackContext =
    recentFeedback.length > 0
      ? `Recent weeks:\n${recentFeedback
          .map((f) => `- Had conversation: ${f.hadConversation}. Response: ${f.response}${f.word ? `. Word: ${f.word}` : ""}`)
          .join("\n")}`
      : "";

  const systemPrompt = `You are helping a parent build a lifelong thinking relationship with their ${profile.age}-year-old.

PARENT CONTEXT:
Why they're doing this: ${profile.whyDoing || "Not specified"}
What they want their kid to understand about the world: ${profile.worldView || "Not specified"}
One thing the parent got wrong and doesn't want repeated: ${profile.parentMistake || "Not specified"}
Their honest weak spot in conversations: ${profile.weakSpot || "Not specified"}
Time available this week: ${profile.weeklyTime || "30"} minutes

KID CONTEXT:
Name: ${profile.kidName}
Age: ${profile.age} — language guidance: ${ageGuidance}
Gender: ${profile.gender || "not specified"} — use pronouns: ${pronoun.subject}/${pronoun.object}/${pronoun.possessive}
What shuts ${pronoun.object} down: ${profile.kidShutdowns || "Not specified"}
What ${pronoun.subject} wants to become or do: ${profile.kidGoals || "Not specified"}
Preferred communication style: ${profile.commStyle || "Doesn't matter"}

This week's lens: ${currentLens.toUpperCase()}
${LENS_DESCRIPTIONS[currentLens]}

Rules:
- Never leading. No embedded answer. Genuine open space.
- Always anchored in something ${pronoun.subject} currently cares about.
- The parent is learning alongside ${pronoun.object} — not teaching.
- parentTip must directly address their weak spot: "${profile.weakSpot || "staying curious"}".
- If time is 15 minutes, keep openingQuestion short and skip the deep follow-up.
- Points toward creation and agency, not just analysis.

Output only valid JSON, no markdown:
{
  "weeklyLens": "the lens name",
  "lensDescription": "one plain sentence describing this lens for the parent",
  "openingQuestion": "the first question — casual, specific to their world, genuinely open",
  "followUp": "where to go if they engage — slightly deeper, still open",
  "creationChallenge": "one small thing to make, write, design, record, or articulate this week",
  "earningNote": "one sentence on how to frame the value exchange for this week",
  "dispatchConnection": "if a dispatch connects naturally to this week's lens, name it by title and explain in one sentence. If nothing fits, return null.",
  "parentTip": "one sentence on how to show up — directly addressing their specific weak spot"
}`;

  const userPrompt = `Kid's interests: ${(profile.interests || []).join(", ")}
Weekly budget: $${profile.weeklyBudget || 15}
Last week's notes: ${profile.lastWeekNotes || "First week — no history yet."}
${feedbackContext}
${dispatchContext}

Generate this week's mission.`;

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
