"use client";
import { useEffect, useState } from "react";
import Shell from "@/components/Shell";

export default function Login() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [devLink, setDevLink] = useState("");
  const [expired, setExpired] = useState(false);
  useEffect(() => setExpired(new URLSearchParams(location.search).has("expired")), []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setState("sending");
    const res = await fetch("/api/auth/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "Something went wrong. Please try again.");
      setState("idle");
      return;
    }
    setDevLink(data.devLink || "");
    setState("sent");
  };

  return (
    <Shell showNav={false}>
      <main className="wrap center">
        <div className="card" style={{ maxWidth: 560, width: "100%", display: "grid", gap: 22, justifyItems: "start" }}>
          <div className="seal" aria-hidden>★</div>
          <div className="eyebrow">Your private strategy studio</div>
          {state === "sent" ? (
            <>
              <h1 style={{ fontSize: "clamp(40px,6vw,56px)" }}>Check your inbox.</h1>
              <p className="muted">We sent a login link to <strong>{email}</strong>. It works once and expires in 30 minutes.</p>
              {devLink && <a className="btn" href={devLink}>Open login link (local test)</a>}
              <button className="link" onClick={() => setState("idle")}>Use a different email</button>
            </>
          ) : (
            <form onSubmit={submit} style={{ display: "grid", gap: 18, width: "100%" }}>
              <h1 style={{ fontSize: "clamp(40px,6vw,56px)" }}>Welcome <em style={{ color: "var(--gold-soft)" }}>in.</em></h1>
              <p className="muted">{expired ? "That link has expired. Enter your email and we'll send a fresh one." : "Enter the email you used at checkout and we'll send you a private login link."}</p>
              <label htmlFor="email" className="fine">Email</label>
              <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@yourbusiness.com" />
              {error && <p className="err" role="alert">{error}</p>}
              <button className="btn" disabled={state === "sending"}>{state === "sending" ? "Sending..." : "Send my login link"}</button>
            </form>
          )}
        </div>
      </main>
    </Shell>
  );
}
