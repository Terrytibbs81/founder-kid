import profile from "../config/profile.json";

export default function Home() {
  return (
    <div
      style={{
        maxWidth: 560,
        margin: "80px auto",
        padding: "0 20px",
        color: "#1a1a1a",
      }}
    >
      <p
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "#888",
          marginBottom: 12,
        }}
      >
        Founder Kid
      </p>
      <h1 style={{ fontWeight: "normal", fontSize: 26, marginBottom: 16 }}>
        {profile.kidName}&apos;s weekly mission engine is running.
      </h1>
      <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, marginBottom: 32 }}>
        Every Sunday at 6pm ET, this sends one email with a question to ask,
        a small creation challenge, and a money conversation framed around
        producer thinking instead of consumer thinking.
      </p>
      <a
        href="/update"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: "#1a1a1a",
          color: "white",
          borderRadius: 6,
          fontSize: 14,
        }}
      >
        Update her profile →
      </a>
    </div>
  );
}
