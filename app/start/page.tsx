"use client";

import { useState, useEffect } from "react";

const S = {
  page: { fontFamily: "Georgia, serif", maxWidth: 560, margin: "0 auto", padding: "60px 24px", color: "#1a1a1a" } as React.CSSProperties,
  label: { fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", display: "block", marginBottom: 10 },
  input: { width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 15, fontFamily: "Georgia, serif", boxSizing: "border-box" as const, marginBottom: 24, outline: "none" },
  textarea: { width: "100%", padding: "12px 14px", border: "1px solid #ddd", borderRadius: 6, fontSize: 15, fontFamily: "Georgia, serif", resize: "vertical" as const, boxSizing: "border-box" as const, lineHeight: 1.7, marginBottom: 24, outline: "none" },
  btn: { padding: "14px 32px", background: "#1a1a1a", color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" },
  btnSoft: { padding: "14px 32px", background: "#f0f0f0", color: "#1a1a1a", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" },
  h1: { fontWeight: "normal" as const, fontSize: 24, marginBottom: 8 },
  sub: { color: "#888", fontSize: 14, marginBottom: 40, lineHeight: 1.6 },
  progress: { display: "flex", gap: 6, marginBottom: 48 } as React.CSSProperties,
  dot: (active: boolean, done: boolean) => ({ width: 8, height: 8, borderRadius: "50%", background: done ? "#1a1a1a" : active ? "#1a1a1a" : "#ddd", opacity: done ? 1 : active ? 1 : 0.4 }),
  radio: { display: "flex", flexDirection: "column" as const, gap: 10, marginBottom: 24 },
  radioOpt: (sel: boolean) => ({ padding: "12px 16px", border: `1px solid ${sel ? "#1a1a1a" : "#ddd"}`, borderRadius: 6, cursor: "pointer", fontSize: 14, background: sel ? "#1a1a1a" : "white", color: sel ? "white" : "#1a1a1a" }),
};

interface WeeklyPrompt {
  weeklyLens: string;
  lensDescription: string;
  openingQuestion: string;
  followUp: string;
  creationChallenge: string;
  earningNote: string;
  dispatchConnection: string | null;
  parentTip: string;
}

export default function StartPage() {
  const [section, setSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<WeeklyPrompt | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Section 1 — Kid
  const [kidName, setKidName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [interests, setInterests] = useState("");
  const [kidGoals, setKidGoals] = useState("");
  const [kidShutdowns, setKidShutdowns] = useState("");
  const [commStyle, setCommStyle] = useState("");

  // Section 2 — Parent
  const [whyDoing, setWhyDoing] = useState("");
  const [worldView, setWorldView] = useState("");
  const [parentMistake, setParentMistake] = useState("");
  const [weakSpot, setWeakSpot] = useState("");
  const [weeklyTime, setWeeklyTime] = useState("");

  // Section 3 — First dispatch
  const [dispatchTitle, setDispatchTitle] = useState("");
  const [dispatchBody, setDispatchBody] = useState("");

  useEffect(() => {
    fetch("/api/onboard").then((r) => r.json()).then((progress) => {
      if (progress.section3) { setSection(4); return; }
      if (progress.section2) {
        const s2 = progress.section2;
        setWhyDoing(s2.whyDoing || ""); setWorldView(s2.worldView || "");
        setParentMistake(s2.parentMistake || ""); setWeakSpot(s2.weakSpot || "");
        setWeeklyTime(s2.weeklyTime || "");
        setSection(3); return;
      }
      if (progress.section1) {
        const s1 = progress.section1;
        setKidName(s1.kidName || ""); setAge(s1.age || "");
        setGender(s1.gender || ""); setInterests(s1.interests || "");
        setKidGoals(s1.kidGoals || ""); setKidShutdowns(s1.kidShutdowns || "");
        setCommStyle(s1.commStyle || "");
        setSection(2); return;
      }
    }).catch(() => {});
  }, []);

  const saveSection = async (num: number, data: Record<string, string>, wantPreview = false) => {
    setSaving(true);
    const res = await fetch("/api/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: num, data, preview: wantPreview }),
    });
    const json = await res.json();
    setSaving(false);
    return json;
  };

  const ageNum = parseInt(age);

  // SECTION 0 — Origin
  if (section === 0) return (
    <div style={S.page}>
      <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 48 }}>Founder Kid — Setup</p>
      <h1 style={S.h1}>Before we begin.</h1>
      <p style={{ fontSize: 16, lineHeight: 1.8, color: "#333", marginBottom: 24 }}>
        This takes about 10 minutes. You'll set up a profile for your kid, share a bit about what you're hoping to build together, and write the first thing you want them to know.
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.8, color: "#333", marginBottom: 24 }}>
        The answers you give here aren't stored anywhere public — they're used only to shape the questions you get each week. The more honest you are, the better those questions will be.
      </p>
      <p style={{ fontSize: 16, lineHeight: 1.8, color: "#333", marginBottom: 48 }}>
        You can pause and come back. Progress saves after each section.
      </p>
      <button style={S.btn} onClick={() => setSection(1)}>Start →</button>
    </div>
  );

  // SECTION 1 — The Kid
  if (section === 1) return (
    <div style={S.page}>
      <div style={S.progress}>
        <div style={S.dot(true, false)} />
        <div style={S.dot(false, false)} />
        <div style={S.dot(false, false)} />
      </div>
      <h1 style={S.h1}>Tell me about your kid.</h1>
      <p style={S.sub}>Be specific. Vague answers produce generic questions.</p>

      <label style={S.label}>Their name</label>
      <input style={S.input} value={kidName} onChange={(e) => setKidName(e.target.value)} placeholder="First name" />

      <label style={S.label}>Age (12–17)</label>
      <input style={S.input} type="number" min={12} max={17} value={age} onChange={(e) => setAge(e.target.value)} placeholder="13" />

      <label style={S.label}>Gender</label>
      <div style={S.radio}>
        {["girl", "boy", "prefer not to say"].map((g) => (
          <button key={g} style={S.radioOpt(gender === g)} onClick={() => setGender(g)}>{g.charAt(0).toUpperCase() + g.slice(1)}</button>
        ))}
      </div>

      <label style={S.label}>What are they obsessed with right now? (be specific)</label>
      <input style={S.input} value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. Depop reselling, K-drama, building a following on TikTok" />

      <label style={S.label}>What do they want to become or do?</label>
      <textarea style={S.textarea} rows={3} value={kidGoals} onChange={(e) => setKidGoals(e.target.value)} placeholder="What's their dream, even if vague?" />

      <label style={S.label}>What shuts them down in conversation?</label>
      <textarea style={S.textarea} rows={3} value={kidShutdowns} onChange={(e) => setKidShutdowns(e.target.value)} placeholder="e.g. Feels lectured, goes quiet if it feels like a test" />

      <label style={S.label}>How do they communicate best?</label>
      <div style={S.radio}>
        {["Text", "In person", "Car rides", "Doesn't matter"].map((c) => (
          <button key={c} style={S.radioOpt(commStyle === c)} onClick={() => setCommStyle(c)}>{c}</button>
        ))}
      </div>

      <button
        style={S.btn}
        disabled={saving || !kidName || !age || ageNum < 12 || ageNum > 17 || !gender || !interests}
        onClick={async () => {
          await saveSection(1, { kidName, age, gender, interests, kidGoals, kidShutdowns, commStyle });
          setSection(2);
        }}
      >
        {saving ? "Saving..." : "Next →"}
      </button>
    </div>
  );

  // SECTION 2 — The Parent
  if (section === 2) return (
    <div style={S.page}>
      <div style={S.progress}>
        <div style={S.dot(false, true)} />
        <div style={S.dot(true, false)} />
        <div style={S.dot(false, false)} />
      </div>
      <h1 style={S.h1}>Now tell me about you.</h1>
      <p style={S.sub}>These answers shape the system prompt — the philosophy layer that makes every question yours, not generic.</p>

      <label style={S.label}>Why are you doing this?</label>
      <textarea style={S.textarea} rows={4} value={whyDoing} onChange={(e) => setWhyDoing(e.target.value)} placeholder="Not the polished answer. The real one." />

      <label style={S.label}>What do you want them to understand about the world that they don't yet?</label>
      <textarea style={S.textarea} rows={4} value={worldView} onChange={(e) => setWorldView(e.target.value)} placeholder="One belief you hold that you'd want passed on." />

      <label style={S.label}>One thing you got wrong that you don't want them to repeat</label>
      <textarea style={S.textarea} rows={4} value={parentMistake} onChange={(e) => setParentMistake(e.target.value)} placeholder="Honest is better than polished here." />

      <label style={S.label}>Your honest weak spot in conversations with them</label>
      <div style={S.radio}>
        {["I lecture", "I go quiet", "I make it about me", "I give up too fast"].map((w) => (
          <button key={w} style={S.radioOpt(weakSpot === w)} onClick={() => setWeakSpot(w)}>{w}</button>
        ))}
      </div>

      <label style={S.label}>Realistic weekly time available</label>
      <div style={S.radio}>
        {["15 mins", "30 mins", "An hour"].map((t) => (
          <button key={t} style={S.radioOpt(weeklyTime === t)} onClick={() => setWeeklyTime(t)}>{t}</button>
        ))}
      </div>

      <button
        style={S.btn}
        disabled={saving || !whyDoing || !worldView || !parentMistake || !weakSpot || !weeklyTime}
        onClick={async () => {
          await saveSection(2, { whyDoing, worldView, parentMistake, weakSpot, weeklyTime });
          setSection(3);
        }}
      >
        {saving ? "Saving..." : "Next →"}
      </button>
    </div>
  );

  // SECTION 3 — First Dispatch
  if (section === 3) return (
    <div style={S.page}>
      <div style={S.progress}>
        <div style={S.dot(false, true)} />
        <div style={S.dot(false, true)} />
        <div style={S.dot(true, false)} />
      </div>
      <h1 style={S.h1}>Write the first dispatch.</h1>
      <p style={S.sub}>One true thing from your life you'd want them to know. Not advice — a story. Minimum three sentences. This seeds the archive.</p>

      <label style={S.label}>A title — the moment, the lesson, the memory</label>
      <input style={S.input} value={dispatchTitle} onChange={(e) => setDispatchTitle(e.target.value)} placeholder="e.g. The day I almost quit everything" />

      <label style={S.label}>Write it</label>
      <textarea
        style={S.textarea}
        rows={10}
        value={dispatchBody}
        onChange={(e) => setDispatchBody(e.target.value)}
        placeholder="Write it like you're texting them. Not a lesson. A true thing that happened."
      />
      <p style={{ fontSize: 12, color: dispatchBody.split(/\s+/).filter(Boolean).length < 30 ? "#c00" : "#aaa", marginTop: -16, marginBottom: 24 }}>
        {dispatchBody.split(/\s+/).filter(Boolean).length < 30 ? "At least a few more sentences — give it some room." : "Good. Keep going or submit when ready."}
      </p>

      <button
        style={S.btn}
        disabled={saving || !dispatchTitle || dispatchBody.split(/\s+/).filter(Boolean).length < 30}
        onClick={async () => {
          setSaving(true);
          const json = await saveSection(3, { dispatchTitle, dispatchBody }, false);
          setSaving(false);
          if (json.success) setSection(4);
        }}
      >
        {saving ? "Saving..." : "Finish setup →"}
      </button>
    </div>
  );

  // SECTION 4 — Completion
  if (section === 4) return (
    <div style={S.page}>
      <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "#888", marginBottom: 48 }}>Founder Kid</p>
      {preview ? (
        <div>
          <h1 style={S.h1}>Here's your first prompt.</h1>
          <p style={{ color: "#888", fontSize: 14, marginBottom: 40 }}>This is exactly what Sunday's email looks like. Yours, anchored in who they actually are.</p>

          <p style={{ fontSize: 12, color: "#aaa", marginBottom: 4, letterSpacing: "0.08em", textTransform: "uppercase" as const }}>This week's lens: {preview.weeklyLens}</p>
          <p style={{ fontSize: 14, color: "#888", marginBottom: 32, fontStyle: "italic" }}>{preview.lensDescription}</p>

          <div style={{ background: "#f7f7f7", borderLeft: "3px solid #1a1a1a", padding: "20px 24px", marginBottom: 28 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", margin: "0 0 10px 0" }}>Ask them this</p>
            <p style={{ fontSize: 17, margin: 0, lineHeight: 1.65 }}>"{preview.openingQuestion}"</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", margin: "0 0 10px 0" }}>If they engage, go here</p>
            <p style={{ fontSize: 15, margin: 0, lineHeight: 1.65, color: "#333" }}>"{preview.followUp}"</p>
          </div>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", margin: "0 0 10px 0" }}>Creation challenge</p>
            <p style={{ fontSize: 15, margin: 0, lineHeight: 1.65, color: "#333" }}>{preview.creationChallenge}</p>
          </div>
          <div style={{ borderTop: "1px solid #eee", paddingTop: 20, marginBottom: 40 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.1em", color: "#888", margin: "0 0 8px 0" }}>How to show up</p>
            <p style={{ fontSize: 14, margin: 0, color: "#555", fontStyle: "italic" }}>{preview.parentTip}</p>
          </div>

          <a href="/update" style={{ ...S.btn, display: "inline-block", textDecoration: "none" }}>Go to your dashboard →</a>
        </div>
      ) : (
        <div>
          <h1 style={S.h1}>You're set up.</h1>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#555", marginBottom: 16 }}>Your first Sunday prompt is already on its way.</p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: "#555", marginBottom: 48 }}>Want a taste right now?</p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              style={S.btn}
              disabled={loadingPreview}
              onClick={async () => {
                setLoadingPreview(true);
                const res = await fetch("/api/preview-prompt", { method: "POST" });
                const data = await res.json();
                setLoadingPreview(false);
                if (data.prompt) setPreview(data.prompt);
              }}
            >
              {loadingPreview ? "Generating..." : "Yes — show me →"}
            </button>
            <a href="/update" style={{ ...S.btnSoft, display: "inline-block", textDecoration: "none" }}>Not yet</a>
          </div>
        </div>
      )}
    </div>
  );

  return null;
}
