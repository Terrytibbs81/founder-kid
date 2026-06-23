"use client";

import { useState, useEffect } from "react";

export default function UpdateProfile() {
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [saved, setSaved] = useState(false);

  // Feedback
  const [hadConversation, setHadConversation] = useState("");
  const [kidResponse, setKidResponse] = useState("");
  const [feedbackWord, setFeedbackWord] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    fetch("/api/update-profile")
      .then((r) => { if (!r.ok) { window.location.href = "/"; return null; } return r.json(); })
      .then((data) => { if (!data) return; setInterests(data.interests || []); setNotes(data.lastWeekNotes || ""); })
      .catch(() => { window.location.href = "/"; });
  }, []);

  const add = () => {
    if (newInterest.trim()) { setInterests([...interests, newInterest.trim()]); setNewInterest(""); }
  };

  const save = async () => {
    await fetch("/api/update-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interests, lastWeekNotes: notes }),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const saveFeedback = async () => {
    if (!hadConversation) return;
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hadConversation, response: kidResponse, word: feedbackWord }),
    });
    setFeedbackSaved(true);
    setTimeout(() => setFeedbackSaved(false), 3000);
  };

  const s = { fontFamily: "Georgia, serif", maxWidth: 560, margin: "60px auto", padding: "0 20px", color: "#1a1a1a" };
  const label = { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", display: "block", marginBottom: 12 };
  const radioRow = { display: "flex", gap: 8, flexWrap: "wrap" as const, marginBottom: 24 };
  const pill = (sel: boolean) => ({
    padding: "8px 16px", border: `1px solid ${sel ? "#1a1a1a" : "#ddd"}`, borderRadius: 20,
    cursor: "pointer", fontSize: 14, background: sel ? "#1a1a1a" : "white", color: sel ? "white" : "#1a1a1a",
  });

  return (
    <div style={s}>
      <h1 style={{ fontWeight: "normal", fontSize: 22, marginBottom: 8 }}>Update her world</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 40 }}>What&apos;s she into right now? What happened last week?</p>

      <div style={{ marginBottom: 32 }}>
        <label style={label}>Current interests</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {interests.map((x, i) => (
            <span key={i} style={{ background: "#f0f0f0", padding: "6px 12px", borderRadius: 20, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              {x}
              <button onClick={() => setInterests(interests.filter((_, j) => j !== i))} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Add an interest..." style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "Georgia, serif" }} />
          <button onClick={add} style={{ padding: "10px 20px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>Add</button>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <label style={label}>Last week&apos;s notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="One sentence is enough. How did the conversation go?" rows={4} style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box" }} />
      </div>

      <button onClick={save} style={{ padding: "14px 32px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif", marginBottom: 60 }}>
        {saved ? "Saved ✓" : "Save & update"}
      </button>

      {/* Feedback micro-loop */}
      <div style={{ borderTop: "1px solid #eee", paddingTop: 40, marginBottom: 60 }}>
        <h2 style={{ fontWeight: "normal", fontSize: 17, marginBottom: 8 }}>Last week&apos;s check-in</h2>
        <p style={{ color: "#888", fontSize: 13, marginBottom: 28 }}>Takes 20 seconds. Helps next week&apos;s prompt be better.</p>

        <label style={label}>Did you have the conversation?</label>
        <div style={radioRow}>
          {["Yes", "Partially", "No"].map((o) => (
            <button key={o} style={pill(hadConversation === o)} onClick={() => setHadConversation(o)}>{o}</button>
          ))}
        </div>

        {hadConversation && hadConversation !== "No" && (
          <>
            <label style={label}>How did they respond?</label>
            <div style={radioRow}>
              {["Great", "OK", "Didn't engage"].map((o) => (
                <button key={o} style={pill(kidResponse === o)} onClick={() => setKidResponse(o)}>{o}</button>
              ))}
            </div>
          </>
        )}

        <label style={label}>One word (optional)</label>
        <input value={feedbackWord} onChange={(e) => setFeedbackWord(e.target.value)} placeholder="e.g. surprised, quiet, lit up..." style={{ width: "100%", padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "Georgia, serif", boxSizing: "border-box", marginBottom: 20 }} />

        <button onClick={saveFeedback} disabled={!hadConversation} style={{ padding: "12px 24px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>
          {feedbackSaved ? "Logged ✓" : "Log it"}
        </button>
      </div>

      <div style={{ borderTop: "1px solid #eee", paddingTop: 24, display: "flex", gap: 24 }}>
        <a href="/dispatch" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>Write a dispatch →</a>
        <a href="/archive" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>Open the archive →</a>
        <form action="/api/auth/logout" method="POST" style={{ marginLeft: "auto" }}>
          <button type="submit" style={{ fontSize: 13, color: "#ccc", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Sign out</button>
        </form>
      </div>
    </div>
  );
}
