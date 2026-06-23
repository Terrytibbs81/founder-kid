"use client";

import { useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const send = async () => {
    if (!email.includes("@")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Something went wrong. Try again.");
      }
    } catch {
      setError("Something went wrong. Try again.");
    }
    setLoading(false);
  };

  const s = {
    fontFamily: "Georgia, serif",
    maxWidth: 520,
    margin: "0 auto",
    padding: "80px 24px",
    color: "#1a1a1a",
  };

  if (sent) {
    return (
      <div style={s}>
        <p style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", marginBottom: 32 }}>Founder Kid</p>
        <h1 style={{ fontWeight: "normal", fontSize: 24, marginBottom: 16 }}>Check your email.</h1>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.7 }}>
          A sign-in link is on its way to <strong>{email}</strong>. It expires in 15 minutes.
        </p>
      </div>
    );
  }

  return (
    <div style={s}>
      <p style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", marginBottom: 48 }}>Founder Kid</p>

      <h1 style={{ fontWeight: "normal", fontSize: 28, lineHeight: 1.3, marginBottom: 24 }}>
        Most kids grow up as consumers.<br />This is for parents who want different.
      </h1>

      <p style={{ fontSize: 15, color: "#555", lineHeight: 1.75, marginBottom: 16 }}>
        Every Sunday, you get one question to ask — anchored in what your kid actually cares about, designed to open a real conversation instead of a lecture.
      </p>
      <p style={{ fontSize: 15, color: "#555", lineHeight: 1.75, marginBottom: 16 }}>
        Over time, you build a dispatch library: honest things from your life, written for them. They can read it now. They can talk to it later.
      </p>
      <p style={{ fontSize: 15, color: "#555", lineHeight: 1.75, marginBottom: 48 }}>
        You are not the teacher here. You are a genuinely curious co-explorer — and that difference changes everything.
      </p>

      <div style={{ borderTop: "1px solid #eee", paddingTop: 40 }}>
        <label style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", display: "block", marginBottom: 12 }}>
          Get started — enter your email
        </label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="you@email.com"
            style={{ flex: 1, padding: "12px 16px", border: "1px solid #ddd", borderRadius: 6, fontSize: 15, fontFamily: "Georgia, serif", outline: "none" }}
          />
          <button
            onClick={send}
            disabled={loading}
            style={{ padding: "12px 24px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" }}
          >
            {loading ? "..." : "Continue →"}
          </button>
        </div>
        {error && <p style={{ fontSize: 13, color: "#c00", marginTop: 8 }}>{error}</p>}
          <p style={{ fontSize: 12, color: "#aaa", marginTop: 12 }}>No password. Magic link sent to your inbox.</p>
      </div>
    </div>
  );
}
