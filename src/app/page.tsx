"use client";
import Link from "next/link";
import Shell from "@/components/Shell";
import { useApp } from "@/components/useApp";

export default function Home() {
  const { state } = useApp();
  if (!state) return <Shell><main className="wrap center"><div className="orbit" aria-label="Loading" /></main></Shell>;
  const p = state.progress;
  const started = Object.keys(p.stages).length > 0;
  const done = p.currentStage > 6;
  const name = state.firstName ? `, ${state.firstName}` : "";

  return (
    <Shell>
      <main className="wrap center">
        <div className="hello" style={{ maxWidth: 900, width: "100%" }}>
          <div className="eyebrow"><span className="star">★</span> The Substack Strategist</div>
          <h1 style={{ marginTop: 18 }}>
            {done ? <>Welcome back{name}. <em>Let's keep building.</em></> : started ? <>Welcome back{name}. <em>Your studio is just as you left it.</em></> : <>Welcome to your <em>private strategy studio</em>{name}.</>}
          </h1>
          <p className="muted" style={{ marginTop: 18, maxWidth: "60ch", fontSize: 18 }}>
            {done
              ? "Your Publication Blueprint is ready. Open it, refine it, or bring today's question to a strategy session."
              : "Together we'll move through six stages and build your personal Publication Blueprint: your name, your promise, your pillars and a plan that connects your writing to your income."}
          </p>
          <div className="doors">
            {!done ? (
              <Link className="door" href="/studio">
                <span className="eyebrow">{started ? `Stage ${p.currentStage} of 6` : "First time here"}</span>
                <h3>{started ? "Continue my discovery" : "This is my first time"}</h3>
                <p>{started ? "Pick up right where you left off. Everything you've shared is saved." : "Begin the six-stage discovery. Most women finish in about an hour, and you can pause anytime."}</p>
                <span className="go">{started ? "Continue" : "Begin"} →</span>
              </Link>
            ) : (
              <Link className="door" href="/blueprint">
                <span className="eyebrow">Ready</span>
                <h3>Open my blueprint</h3>
                <p>Read, edit and download your Publication Blueprint as a PDF.</p>
                <span className="go">Open →</span>
              </Link>
            )}
            <Link className="door" href="/session">
              <span className="eyebrow">Returning</span>
              <h3>I'm back for strategy and support</h3>
              <p>A working session for headlines, Notes, launches, stats or your next move. Your plan is already loaded.</p>
              <span className="go">Start a session →</span>
            </Link>
          </div>
        </div>
      </main>
    </Shell>
  );
}
