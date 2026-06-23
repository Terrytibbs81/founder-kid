import profile from "../config/profile.json";

export default function Home() {
  return (
    <div style={{ maxWidth: 560, margin: "80px auto", padding: "0 20px", color: "#1a1a1a" }}>
      <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 12 }}>
        Founder Kid
      </p>
      <h1 style={{ fontWeight: "normal", fontSize: 26, marginBottom: 16 }}>
        {profile.kidName}&apos;s weekly mission engine is running.
      </h1>
      <p style={{ color: "#555", fontSize: 15, lineHeight: 1.6, marginBottom: 48 }}>
        Every Sunday at 6pm ET, this sends one email with a question to ask,
        a small creation challenge, and a money conversation framed around
        producer thinking instead of consumer thinking.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <a href="/update" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#1a1a1a", color: "white", borderRadius: 8, fontSize: 15, textDecoration: "none" }}>
          <span>Update her profile</span>
          <span style={{ opacity: 0.5 }}>→</span>
        </a>
        <a href="/dispatch" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f4f4f4", color: "#1a1a1a", borderRadius: 8, fontSize: 15, textDecoration: "none" }}>
          <span>Write a dispatch</span>
          <span style={{ opacity: 0.4 }}>→</span>
        </a>
        <a href="/archive" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "#f4f4f4", color: "#1a1a1a", borderRadius: 8, fontSize: 15, textDecoration: "none" }}>
          <span>Open the archive</span>
          <span style={{ opacity: 0.4 }}>→</span>
        </a>
      </div>
    </div>
  );
}
