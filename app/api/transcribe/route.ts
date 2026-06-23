import { NextResponse } from "next/server";
import { getSessionFromRequest } from "../../../lib/auth";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const audioFile = formData.get("audio") as File | null;

  if (!audioFile) {
    return NextResponse.json({ error: "No audio file" }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 503 });
  }

  try {
    // Transcribe with Whisper
    const whisperForm = new FormData();
    whisperForm.append("file", audioFile, "recording.webm");
    whisperForm.append("model", "whisper-1");

    const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: whisperForm,
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      console.error("Whisper error:", err);
      return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
    }

    const { text: transcript } = await whisperRes.json();

    // Store audio in Vercel Blob (if configured)
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const { put } = await import("@vercel/blob");
        const timestamp = Date.now();
        const arrayBuffer = await audioFile.arrayBuffer();
        await put(
          `user/${session.userId}/audio/${timestamp}.webm`,
          Buffer.from(arrayBuffer),
          { access: "private", contentType: "audio/webm" }
        );
      } catch (blobErr) {
        console.error("Blob storage failed (non-fatal):", blobErr);
      }
    }

    return NextResponse.json({ transcript });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
