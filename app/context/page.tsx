"use client";

import { useState, useEffect, useRef } from "react";

interface ContextEntry {
  id: string;
  body: string;
  date: string;
}

const SEED_PROMPTS = [
  "What do you believe that most people around you don't",
  "What makes you laugh that probably shouldn't",
  "Who were you before you became a parent",
  "What do you want them to know about love, work, money, failure",
  "What are you still figuring out",
  "Describe yourself at your best and your worst",
];

export default function ContextPage() {
  const [entries, setEntries] = useState<ContextEntry[]>([]);
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const load = () =>
    fetch("/api/context")
      .then((r) => { if (!r.ok) { window.location.href = "/"; return null; } return r.json(); })
      .then((d) => { if (d) setEntries(d); });

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!body.trim()) return;
    await fetch("/api/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    setBody("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    load();
  };

  const remove = async (id: string) => {
    await fetch("/api/context", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setTranscribing(true);
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("audio", blob, "recording.webm");
        try {
          const res = await fetch("/api/transcribe", { method: "POST", body: form });
          const data = await res.json();
          if (data.transcript) {
            setBody((prev) => prev ? `${prev}\n\n${data.transcript}` : data.transcript);
          }
        } catch {
          // transcription failed silently
        }
        setTranscribing(false);
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      alert("Microphone access needed for voice capture.");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    mediaRef.current = null;
    setRecording(false);
  };

  const s = {
    fontFamily: "Georgia, serif",
    maxWidth: 600,
    margin: "60px auto",
    padding: "0 20px",
    color: "#1a1a1a",
  };

  return (
    <div style={s}>
      <h1 style={{ fontWeight: "normal", fontSize: 22, marginBottom: 8 }}>Your inner world</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 32 }}>
        Less narrative than a dispatch. More complete. The stuff that doesn&apos;t fit in a story but is still true.
      </p>

      {/* Seed prompts */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#aaa", marginBottom: 10 }}>Start with one of these, or write freely</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {SEED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => setBody((prev) => prev ? prev : p + "\n\n")}
              style={{ padding: "6px 12px", border: "1px solid #e0e0e0", borderRadius: 20, fontSize: 13, background: "none", cursor: "pointer", color: "#666", fontFamily: "Georgia, serif" }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 16 }}>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write anything. No structure needed."
          rows={10}
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 15, fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box", lineHeight: 1.7 }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 60 }}>
        <button
          onClick={save}
          style={{ padding: "14px 32px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" }}
        >
          {saved ? "Saved ✓" : "Save"}
        </button>

        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={transcribing}
          style={{
            width: 44, height: 44, borderRadius: "50%",
            background: recording ? "#cc0000" : transcribing ? "#eee" : "#f0f0f0",
            border: "none", cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.2s",
          }}
          title={recording ? "Stop recording" : "Record voice"}
        >
          {transcribing ? "…" : recording ? "■" : "●"}
        </button>
        <span style={{ fontSize: 13, color: "#aaa" }}>
          {transcribing ? "Transcribing..." : recording ? "Recording — tap to stop" : "Tap to record voice"}
        </span>
      </div>

      {entries.length > 0 && (
        <div>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#aaa", marginBottom: 24 }}>
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
          {[...entries].reverse().map((e) => (
            <div key={e.id} style={{ borderTop: "1px solid #eee", paddingTop: 24, marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{e.date}</p>
                <button onClick={() => remove(e.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ccc", fontSize: 18 }}>×</button>
              </div>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, margin: 0, whiteSpace: "pre-wrap" }}>{e.body}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderTop: "1px solid #eee", paddingTop: 24, marginTop: 40, display: "flex", gap: 24 }}>
        <a href="/dispatch" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>Write a dispatch →</a>
        <a href="/update" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>Dashboard →</a>
      </div>
    </div>
  );
}
