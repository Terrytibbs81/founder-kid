"use client";

import { useState, useEffect } from "react";

interface Dispatch {
  id: string;
  title: string;
  body: string;
  date: string;
}

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);

  const load = () =>
    fetch("/api/dispatches")
      .then((r) => { if (!r.ok) { window.location.href = "/"; return null; } return r.json(); })
      .then((d) => { if (d) setDispatches(d); });

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    if (!title.trim() || !body.trim()) return;
    await fetch("/api/dispatches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    setTitle("");
    setBody("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    load();
  };

  const remove = async (id: string) => {
    await fetch("/api/dispatches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    load();
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
      <h1 style={{ fontWeight: "normal", fontSize: 22, marginBottom: 8 }}>
        Write a dispatch
      </h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 40 }}>
        A true thing from your life. Three sentences or three paragraphs.
        Written for her, not for posterity.
      </p>

      <div style={{ marginBottom: 16 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="A title — the moment, the lesson, the memory..."
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 16,
            fontFamily: "Georgia, serif",
            boxSizing: "border-box",
            marginBottom: 12,
          }}
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write it like you're texting her. Not a lesson. A true thing that happened."
          rows={8}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #ddd",
            borderRadius: 6,
            fontSize: 15,
            fontFamily: "Georgia, serif",
            resize: "vertical",
            boxSizing: "border-box",
            lineHeight: 1.7,
          }}
        />
      </div>

      <button
        onClick={save}
        style={{
          padding: "14px 32px",
          background: "#1a1a1a",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
          fontSize: 15,
          fontFamily: "Georgia, serif",
          marginBottom: 60,
        }}
      >
        {saved ? "Saved to archive ✓" : "Save dispatch"}
      </button>

      {dispatches.length > 0 && (
        <div>
          <p
            style={{
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#aaa",
              marginBottom: 24,
            }}
          >
            Archive — {dispatches.length}{" "}
            {dispatches.length === 1 ? "dispatch" : "dispatches"}
          </p>
          {[...dispatches].reverse().map((d) => (
            <div
              key={d.id}
              style={{ borderTop: "1px solid #eee", paddingTop: 24, marginBottom: 24 }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 8,
                }}
              >
                <div>
                  <p style={{ fontWeight: "bold", fontSize: 16, margin: "0 0 4px 0" }}>
                    {d.title}
                  </p>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>{d.date}</p>
                </div>
                <button
                  onClick={() => remove(d.id)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#ccc",
                    fontSize: 18,
                  }}
                >
                  ×
                </button>
              </div>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7, margin: 0 }}>
                {d.body}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
