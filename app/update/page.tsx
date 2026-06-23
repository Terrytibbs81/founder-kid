"use client";

import { useState, useEffect } from "react";

export default function UpdateProfile() {
  const [interests, setInterests] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/update-profile")
      .then((r) => r.json())
      .then((data) => {
        setInterests(data.interests || []);
        setNotes(data.lastWeekNotes || "");
      });
  }, []);

  const addInterest = () => {
    if (newInterest.trim()) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (i: number) => {
    setInterests(interests.filter((_, idx) => idx !== i));
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

  return (
    <div style={{ fontFamily: "Georgia, serif", maxWidth: 560, margin: "60px auto", padding: "0 20px", color: "#1a1a1a" }}>

      <h1 style={{ fontWeight: "normal", fontSize: 22, marginBottom: 8 }}>Update her world</h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 40 }}>What&apos;s she into right now? What happened last week?</p>

      <div style={{ marginBottom: 32 }}>
        <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", display: "block", marginBottom: 12 }}>
          Current interests
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          {interests.map((interest, i) => (
            <span key={i} style={{ background: "#f0f0f0", padding: "6px 12px", borderRadius: 20, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
              {interest}
              <button onClick={() => removeInterest(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newInterest}
            onChange={(e) => setNewInterest(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addInterest()}
            placeholder="Add an interest..."
            style={{ flex: 1, padding: "10px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "Georgia, serif" }}
          />
          <button onClick={addInterest} style={{ padding: "10px 20px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 14 }}>
            Add
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 40 }}>
        <label style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", display: "block", marginBottom: 12 }}>
          Last week&apos;s notes (one sentence is enough)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. She talked for 20 minutes about reselling. Seemed excited about the creation challenge."
          rows={4}
          style={{ width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 14, fontFamily: "Georgia, serif", resize: "vertical", boxSizing: "border-box" }}
        />
      </div>

      <button onClick={save} style={{ padding: "14px 32px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" }}>
        {saved ? "Saved ✓" : "Save & update"}
      </button>

      <div style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #eee", display: "flex", gap: 24 }}>
        <a href="/dispatch" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>Write a dispatch →</a>
        <a href="/archive" style={{ fontSize: 13, color: "#888", textDecoration: "none" }}>Open the archive →</a>
      </div>

    </div>
  );
}
