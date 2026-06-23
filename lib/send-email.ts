import { Resend } from "resend";
import { kvGet } from "./kv";
import defaultProfile from "../config/profile.json";

const resend = new Resend(process.env.RESEND_API_KEY);

interface WeeklyPrompt {
  weeklyLens: string;
  lensDescription: string;
  openingQuestion: string;
  followUp: string;
  creationChallenge: string;
  earningNote: string;
  dispatchConnection: string | null;
  parentTip: string;
}

export async function sendWeeklyEmail(prompt: WeeklyPrompt) {
  const profile = (await kvGet("profile")) || defaultProfile;
  const { kidName, weeklyBudget } = profile;

  const dispatchBlock = prompt.dispatchConnection
    ? `
      <div style="margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">From your archive</p>
        <p style="font-size: 15px; margin: 0; line-height: 1.7; color: #444; font-style: italic;">${prompt.dispatchConnection}</p>
      </div>`
    : "";

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
      <p style="font-size: 12px; color: #aaa; margin-bottom: 4px; letter-spacing: 0.08em; text-transform: uppercase;">
        ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>
      <p style="font-size: 12px; color: #aaa; margin-bottom: 36px; letter-spacing: 0.08em; text-transform: uppercase;">
        This week's lens: ${prompt.weeklyLens}
      </p>
      <h1 style="font-size: 22px; font-weight: normal; margin-bottom: 8px;">
        This week with ${kidName}
      </h1>
      <p style="font-size: 14px; color: #888; margin-bottom: 40px; font-style: italic;">${prompt.lensDescription}</p>
      <div style="background: #f7f7f7; border-left: 3px solid #1a1a1a; padding: 20px 24px; margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">Ask her this</p>
        <p style="font-size: 18px; margin: 0; line-height: 1.65;">"${prompt.openingQuestion}"</p>
      </div>
      <div style="margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">If she engages, go here</p>
        <p style="font-size: 16px; margin: 0; line-height: 1.65; color: #333;">"${prompt.followUp}"</p>
      </div>
      <div style="margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">This week's creation challenge</p>
        <p style="font-size: 15px; margin: 0; line-height: 1.65; color: #333;">${prompt.creationChallenge}</p>
      </div>
      <div style="margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">The value exchange</p>
        <p style="font-size: 15px; margin: 0; line-height: 1.65; color: #333;">${prompt.earningNote} Up to $${weeklyBudget} this week.</p>
      </div>
      ${dispatchBlock}
      <div style="border-top: 1px solid #eee; padding-top: 24px; margin-top: 8px; margin-bottom: 40px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 8px 0;">How to show up</p>
        <p style="font-size: 14px; margin: 0; color: #555; font-style: italic;">${prompt.parentTip}</p>
      </div>
      <div style="border-top: 1px solid #eee; padding-top: 24px; display: flex; gap: 24px;">
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/update" style="font-size: 13px; color: #888; text-decoration: none;">Update her interests →</a>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dispatch" style="font-size: 13px; color: #888; text-decoration: none; margin-left: 24px;">Write a dispatch →</a>
      </div>
    </div>
  `;

  await resend.emails.send({
    from: "Founder Kid <onboarding@resend.dev>",
    to: process.env.PARENT_EMAIL!,
    subject: `This week with ${kidName} — ${prompt.weeklyLens}`,
    html,
  });
}
