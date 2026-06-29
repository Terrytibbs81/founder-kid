import staticProfile from "../config/profile.json";
import { kvGet } from "./kv";

export interface Profile {
  kidName: string;
  age: number;
  interests: string[];
  weeklyBudget: number;
  lastWeekNotes: string;
  conversationHistory?: unknown[];
  currentLensIndex?: number;
  lenses?: string[];
}

// Reads mutable fields from KV, falls back to config/profile.json on first run.
export async function getProfile(): Promise<Profile> {
  const profile = await kvGet("profile");
  if (profile) return profile as Profile;
  return staticProfile as unknown as Profile;
}
