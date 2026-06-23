import { NextResponse } from "next/server";
import { createMagicToken } from "../../../../lib/auth";
import { sendMagicLinkEmail } from "../../../../lib/send-email";

export async function POST(request: Request) {
  const { email } = await request.json();
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 });
  }
  try {
    const token = await createMagicToken(email.toLowerCase().trim());
    await sendMagicLinkEmail(email.toLowerCase().trim(), token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to send link" }, { status: 500 });
  }
}
