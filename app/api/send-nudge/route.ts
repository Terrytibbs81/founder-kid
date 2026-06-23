import { NextResponse } from "next/server";
import { generateNudge } from "../../../lib/generate-nudge";
import { Resend } from "resend";
import profile from "../../../config/profile.json";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const nudge = await generateNudge();
    const { kidName } = profile;

    const html = `
      <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 32px 20px; color: #1a1a1a;">

        <p style="font-size: 12px; color: #aaa; margin: 0 0 24px 0; text-transform: uppercase; letter-spacing: 0.08em;">
          ${new Date().toLocaleDateString("en-US", { weekday: "long" })} nudge for ${kidName}
        </p>

        <p style="font-size: 20px; margin: 0 0 32px 0; line-height: 1.5; color: #1a1a1a;">
          "${nudge.question}"
        </p>

        <div style="border-top: 1px solid #eee; padding-top: 20px;">
          <p style="font-size: 12px; color: #aaa; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.08em;">What to listen for</p>
          <p style="font-size: 13px; color: #888; margin: 0; font-style: italic; line-height: 1.5;">${nudge.parentNote}</p>
        </div>

      </div>
    `;

    await resend.emails.send({
      from: "Founder Kid <onboarding@resend.dev>",
      to: process.env.PARENT_EMAIL!,
      subject: `Nudge for ${kidName} — ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
