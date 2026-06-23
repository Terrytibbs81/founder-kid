import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";
import { userGet, userSet, registerUser } from "../../../lib/kv-user";
import { sendWelcomeEmail } from "../../../lib/send-email";

export async function GET(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const progress = (await userGet(session.userId, "onboarding")) || {};
  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { section, data, preview } = await request.json();
  const { userId, email } = session;

  const existing = (await userGet(userId, "onboarding")) || {};
  await userSet(userId, "onboarding", { ...existing, [`section${section}`]: data });

  // Section 3 = final section — write first dispatch, finalize profile, mark onboarded
  if (section === 3) {
    const s1 = existing.section1 || {};
    const s2 = existing.section2 || {};

    // Save first dispatch
    const firstDispatch = {
      id: Date.now().toString(),
      title: data.dispatchTitle,
      body: data.dispatchBody,
      date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
    await userSet(userId, "dispatches", [firstDispatch]);

    // Build full profile
    const profile = {
      email,
      // Kid
      kidName: s1.kidName,
      age: Number(s1.age),
      gender: s1.gender,
      interests: s1.interests ? s1.interests.split(",").map((x: string) => x.trim()).filter(Boolean) : [],
      kidGoals: s1.kidGoals,
      kidShutdowns: s1.kidShutdowns,
      commStyle: s1.commStyle,
      // Parent
      whyDoing: s2.whyDoing,
      worldView: s2.worldView,
      parentMistake: s2.parentMistake,
      weakSpot: s2.weakSpot,
      weeklyTime: s2.weeklyTime,
      // System
      weeklyBudget: 15,
      currentLensIndex: 0,
      lenses: ["value", "desire", "philosophy", "happiness", "design", "agency"],
      lastWeekNotes: "",
      onboarded: true,
    };

    await userSet(userId, "profile", profile);
    await registerUser(userId);
    await sendWelcomeEmail(email, profile.kidName);

    // Optionally generate preview prompt
    if (preview) {
      try {
        const { generateWeeklyPrompt } = await import("../../../lib/generate-prompt");
        const prompt = await generateWeeklyPrompt(userId);
        return NextResponse.json({ success: true, prompt });
      } catch (err) {
        console.error("Preview generation failed:", err);
        return NextResponse.json({ success: true, prompt: null });
      }
    }
  }

  return NextResponse.json({ success: true });
}
