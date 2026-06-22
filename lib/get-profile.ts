import staticProfile from "../config/profile.json";

export interface Profile {
  kidName: string;
  age: number;
  interests: string[];
  weeklyBudget: number;
  lastWeekNotes: string;
  conversationHistory: unknown[];
}

// On Vercel: reads mutable fields (interests, lastWeekNotes) from KV storage.
// Locally: reads everything from config/profile.json as before.
export async function getProfile(): Promise<Profile> {
  if (process.env.KV_REST_API_URL) {
    const { kv } = await import("@vercel/kv");
    const interests = await kv.get<string[]>("interests");
    const lastWeekNotes = await kv.get<string>("lastWeekNotes");
    return {
      ...(staticProfile as Profile),
      interests: interests ?? staticProfile.interests,
      lastWeekNotes: lastWeekNotes ?? staticProfile.lastWeekNotes,
    };
  }
  return staticProfile as Profile;
}
