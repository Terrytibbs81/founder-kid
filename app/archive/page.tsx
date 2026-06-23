"use client";

import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ArchivePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => { if (!r.ok) window.location.href = "/"; });
  }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/archive-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: newMessages }),
    });
    const data = await res.json();
    setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    setLoading(false);
  };

  return (
    <div
      style={{
        fontFamily: "Georgia, serif",
        maxWidth: 600,
        margin: "0 auto",
        padding: "40px 20px",
        color: "#1a1a1a",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h1 style={{ fontWeight: "normal", fontSize: 22, marginBottom: 8 }}>
        The Archive
      </h1>
      <p style={{ color: "#888", fontSize: 14, marginBottom: 40 }}>
        Everything he chose to write down. Ask it anything.
      </p>

      <div style={{ flex: 1, marginBottom: 24 }}>
        {messages.length === 0 && (
          <p style={{ color: "#ccc", fontSize: 15, fontStyle: "italic" }}>
            Start a conversation...
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              marginBottom: 24,
              textAlign: m.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                maxWidth: "80%",
                padding: "14px 18px",
                borderRadius:
                  m.role === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                background: m.role === "user" ? "#1a1a1a" : "#f4f4f4",
                color: m.role === "user" ? "white" : "#1a1a1a",
                fontSize: 15,
                lineHeight: 1.7,
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#aaa", fontSize: 14, fontStyle: "italic" }}>
            ...
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          position: "sticky",
          bottom: 20,
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask something..."
          style={{
            flex: 1,
            padding: "14px 18px",
            border: "1px solid #ddd",
            borderRadius: 24,
            fontSize: 15,
            fontFamily: "Georgia, serif",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={loading}
          style={{
            padding: "14px 24px",
            background: "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: 24,
            cursor: "pointer",
            fontSize: 15,
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
