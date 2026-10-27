"use client";
import { useState } from "react";
import Link from "next/link";
import Shell from "@/components/Shell";
import { Thread, Composer } from "@/components/Thread";
import { api, useApp, type PublicProgress, type Turn } from "@/components/useApp";

const starters = [
  "Write me a week of Notes from my pillars",
  "Help me write headlines for my next post",
  "Should I turn on paid subscriptions yet?",
  "Here are my stats. What should I change?",
  "Help me plan a launch to my readers",
  "Change my publication name",
];

export default function Session() {
  const { state, setProgress } = useApp();
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState<Turn | null>(null);
  const [updated, setUpdated] = useState<string[]>([]);
  if (!state) return <Shell><main className="wrap center"><div className="orbit" aria-label="Loading" /></main></Shell>;

  const p = state.progress;
  const turns = [...p.session, ...(optimistic ? [optimistic] : [])];
  const hasBlueprint = Object.keys(p.blueprint).length > 0;

  const send = async (text: string) => {
    setError("");
    setThinking(true);
    setOptimistic({ role: "user", text });
    try {
      const r = await api<{ progress: PublicProgress; updated: string[] }>("/api/session", { text });
      setProgress(r.progress);
      setUpdated(r.updated);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOptimistic(null);
      setThinking(false);
    }
  };

  return (
    <Shell>
      <main className="wrap session">
        {state.mock && <div className="demo-note">Preview mode: example replies until the Anthropic API key is added.</div>}
        <div className="eyebrow"><span className="star">★</span> Strategy session</div>
        <h1 style={{ fontSize: "clamp(40px,5.4vw,60px)", margin: "14px 0 12px" }}>What shall we work on today?</h1>
        <p className="muted" style={{ maxWidth: "60ch" }}>
          {hasBlueprint ? <>Your blueprint{p.blueprint.name ? <> for <em>{p.blueprint.name.recommended}</em></> : null} is loaded, so we can get right to it.</> : <>You haven't built your blueprint yet. I can still help, and the <Link href="/studio">six-stage discovery</Link> will make my advice much more specific to you.</>}
        </p>

        {turns.length === 0 && (
          <div className="starters">
            {starters.map((s) => <button key={s} onClick={() => send(s)} disabled={thinking}>{s}</button>)}
          </div>
        )}

        <div style={{ marginTop: 32 }}><Thread turns={turns} thinking={thinking} /></div>
        {updated.length > 0 && !thinking && (
          <p className="fine" style={{ marginTop: 14 }}>★ Blueprint updated · <Link href="/blueprint">View it</Link></p>
        )}
        {error && <p className="err" role="alert" style={{ marginTop: 14 }}>{error}</p>}
        <Composer onSend={send} disabled={thinking} placeholder="Ask your strategist anything about your Substack..." />
      </main>
    </Shell>
  );
}
