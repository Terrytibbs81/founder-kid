import { Resend } from "resend";
import profile from "../config/profile.json";

const resend = new Resend(process.env.RESEND_API_KEY);

interface WeeklyPrompt {
  openingQuestion: string;
  followUp: string;
  creationChallenge: string;
  earningNote: string;
  parentTip: string;
}

export async function sendWeeklyEmail(prompt: WeeklyPrompt) {
  const { kidName, weeklyBudget } = profile;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">

      <p style="font-size: 13px; color: #888; margin-bottom: 32px; letter-spacing: 0.05em; text-transform: uppercase;">
        This week's mission — ${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </p>

      <h1 style="font-size: 24px; font-weight: normal; margin-bottom: 40px;">
        ${kidName}'s weekly mission 💡
      </h1>

      <div style="background: #f9f9f9; border-left: 3px solid #1a1a1a; padding: 20px 24px; margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">Ask her this</p>
        <p style="font-size: 18px; margin: 0; line-height: 1.6;">"${prompt.openingQuestion}"</p>
      </div>

      <div style="margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">If she engages, go here</p>
        <p style="font-size: 16px; margin: 0; line-height: 1.6; color: #333;">"${prompt.followUp}"</p>
      </div>

      <div style="margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">This week's creation challenge</p>
        <p style="font-size: 16px; margin: 0; line-height: 1.6; color: #333;">${prompt.creationChallenge}</p>
      </div>

      <div style="margin-bottom: 32px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 12px 0;">The money conversation</p>
        <p style="font-size: 16px; margin: 0; line-height: 1.6; color: #333;">${prompt.earningNote} Up to $${weeklyBudget} available this week.</p>
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 24px; margin-top: 40px;">
        <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; margin: 0 0 8px 0;">Parent tip</p>
        <p style="font-size: 14px; margin: 0; color: #555; font-style: italic;">${prompt.parentTip}</p>
      </div>

      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee;">
        <p style="font-size: 13px; color: #888; margin: 0;">
          Update her interests → <a href="${process.env.NEXT_PUBLIC_BASE_URL}/update" style="color: #1a1a1a;">here</a>
        </p>
      </div>

    </div>
  `;

  await resend.emails.send({
    from: "Founder Kid <onboarding@resend.dev>",
    to: process.env.PARENT_EMAIL!,
    subject: `This week's mission for ${kidName} 💡`,
    html,
  });
}
