"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import { Thread, Options, Composer } from "@/components/Thread";
import { api, useApp, type PublicProgress, type Turn } from "@/components/useApp";
import { stages, type OpeningField } from "@/config/stages";
import type { Blueprint } from "@/lib/types";

function preview(n: number, bp: Blueprint): { label: string; value: string }[] {
  switch (n) {
    case 1: return bp.identity ? [{ label: "Who you are", value: bp.identity.summary }] : [];
    case 2: return bp.golden_thread ? [{ label: "Your golden thread", value: bp.golden_thread.thread }] : [];
    case 3: return bp.promise ? [{ label: "Your publication promise", value: bp.promise }] : [];
    case 4: return bp.name ? [{ label: "Your publication", value: `${bp.name.recommended}: ${bp.name.subtitle}` }] : [];
    case 5: return bp.pillars ? [{ label: "Your pillars", value: bp.pillars.map((p) => p.name).join(" · ") }, ...(bp.rhythm ? [{ label: "Your rhythm", value: bp.rhythm.cadence }] : [])] : [];
    case 6: return bp.monetization ? [{ label: "Your pathway", value: bp.monetization.pathway.map((s) => s.step).join(" → ") }] : [];
  }
  return [];
}

function Opening({ fields, onSubmit, disabled, codexDefault }: { fields: OpeningField[]; onSubmit: (text: string, codex?: string) => void; disabled: boolean; codexDefault: string }) {
  const [vals, setVals] = useState<Record<string, string | string[]>>({ codex: codexDefault });
  const set = (id: string, v: string | string[]) => setVals((s) => ({ ...s, [id]: v }));
  const ready = fields.every((f) => (f.kind === "text" && f.optional) || (Array.isArray(vals[f.id]) ? (vals[f.id] as string[]).length : String(vals[f.id] || "").trim()));
  const submit = () => {
    const lines = fields
      .filter((f) => f.id !== "codex")
      .map((f) => {
        const v = vals[f.id];
        const a = Array.isArray(v) ? v.join(", ") : String(v || "").trim();
        return a ? `${f.label}\n${a}` : "";
      })
      .filter(Boolean);
    const codex = String(vals.codex || "").trim();
    if (codex) lines.push("I've shared my Magnetic Business Icon Codex results with you.");
    onSubmit(lines.join("\n\n"), codex || undefined);
  };
  return (
    <div className="opening">
      {fields.map((f) => (
        <div className="field" key={f.id}>
          {f.kind === "choice" ? (
            <>
              <div className="q" id={`q-${f.id}`}>{f.label}{f.multiple && <span className="opt">Choose any</span>}</div>
              <div className="chips" role="group" aria-labelledby={`q-${f.id}`}>
                {f.options.map((o) => {
                  const cur = vals[f.id];
                  const on = f.multiple ? Array.isArray(cur) && cur.includes(o) : cur === o;
                  return (
                    <button key={o} className="chip" aria-pressed={on} onClick={() => {
                      if (!f.multiple) return set(f.id, o);
                      const arr = Array.isArray(cur) ? cur : [];
                      set(f.id, on ? arr.filter((x) => x !== o) : [...arr, o]);
                    }}>{o}</button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <label htmlFor={`f-${f.id}`}>{f.label}{f.optional && <span className="opt">Optional</span>}</label>
              <textarea id={`f-${f.id}`} rows={f.long ? 4 : 2} placeholder={f.placeholder} value={String(vals[f.id] || "")} onChange={(e) => set(f.id, e.target.value)} />
            </>
          )}
        </div>
      ))}
      <div><button className="btn" disabled={disabled || !ready} onClick={submit}>Share with my strategist</button></div>
    </div>
  );
}

export default function Studio() {
  const router = useRouter();
  const { state, setProgress } = useApp();
  const [view, setView] = useState<number | null>(null);
  const [thinking, setThinking] = useState(false);
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState("");
  const [optimistic, setOptimistic] = useState<Turn | null>(null);

  const p = state?.progress;
  useEffect(() => {
    if (p && view === null) setView(Math.min(p.currentStage, 6));
  }, [p, view]);

  const n = view || 1;
  const def = stages[n - 1];
  const st = p?.stages[n];
  const turns = useMemo(() => [...(st?.transcript || []), ...(optimistic ? [optimistic] : [])], [st, optimistic]);

  if (!state || !p) return <Shell><main className="wrap center"><div className="orbit" aria-label="Loading" /></main></Shell>;

  const send = async (text: string, codex?: string) => {
    setError("");
    setThinking(true);
    setOptimistic({ role: "user", text });
    try {
      const r = await api<{ progress: PublicProgress }>("/api/stage", { stage: n, text, codex });
      setProgress(r.progress);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOptimistic(null);
      setThinking(false);
    }
  };

  const compose = async () => {
    if (p.blueprint.composedAt) return router.push("/blueprint");
    setComposing(true);
    setError("");
    try {
      const r = await api<{ progress: PublicProgress }>("/api/compose", {});
      setProgress(r.progress);
      router.push("/blueprint");
    } catch (e) {
      setError((e as Error).message);
      setComposing(false);
    }
  };

  const doneCount = Object.values(p.stages).filter((s) => s.complete).length;
  const started = turns.length > 0;
  const complete = !!st?.complete;

  return (
    <Shell>
      <main className="wrap studio">
        <aside className="rail" aria-label="Stages">
          <div className="eyebrow"><span className="star">★</span> Your discovery</div>
          {stages.map((s) => (
            <button key={s.n} disabled={s.n > p.currentStage} aria-current={s.n === n ? "step" : undefined}
              className={p.stages[s.n]?.complete ? "done" : ""} onClick={() => { setView(s.n); setError(""); }}>
              <span className="n">{String(s.n).padStart(2, "0")}</span>
              <span className="t">{s.title}</span>
            </button>
          ))}
          <div className="progress" aria-hidden><span style={{ width: `${(doneCount / 6) * 100}%` }} /></div>
        </aside>

        <section>
          {state.mock && <div className="demo-note">Preview mode: the strategist is using example replies until the Anthropic API key is added.</div>}

          {composing ? (
            <div className="composing">
              <div className="orbit" />
              <div className="eyebrow">Composing your blueprint</div>
              <h2 style={{ fontSize: "clamp(34px,4.6vw,52px)" }}>Writing your About page, welcome post and 30-day plan.</h2>
              <p className="muted">This takes about a minute. Stay right here.</p>
            </div>
          ) : (
            <>
              <header className="stage-head">
                <div className="eyebrow">Stage {n} of 6 · {def.kicker}</div>
                <h1>{def.title}</h1>
                {!started && <p className="lede">{def.intro}</p>}
              </header>

              {!started ? (
                <Opening key={n} fields={def.opening.filter((f) => n === 1 || f.id !== "codex")} onSubmit={send} disabled={thinking} codexDefault={p.codexImport} />
              ) : (
                <>
                  <Thread turns={turns} thinking={thinking} />
                  {!complete && <Options key={st?.pendingOptions?.toolUseId} pending={st?.pendingOptions || null} onSend={send} disabled={thinking} />}
                  {!complete && <Composer onSend={send} disabled={thinking} placeholder={st?.pendingOptions ? "Or write your own answer..." : undefined} />}
                </>
              )}

              {error && <p className="err" role="alert" style={{ marginTop: 16 }}>{error}</p>}

              {complete && !thinking && (
                <div className="saved">
                  <div className="eyebrow"><span className="star">★</span> Saved to your blueprint</div>
                  <h3>Stage {n} complete.</h3>
                  <div className="pv">
                    {preview(n, p.blueprint).map((x) => (
                      <div key={x.label}><b>{x.label}</b>{x.value}</div>
                    ))}
                  </div>
                  <div className="actions">
                    {n < 6 ? (
                      <button className="btn" onClick={() => setView(n + 1)}>Continue to Stage {n + 1}</button>
                    ) : (
                      <button className="btn" onClick={compose}>{p.blueprint.composedAt ? "Open my blueprint" : "Create my blueprint"}</button>
                    )}
                    <span className="fine">Want to change something? Write it below.</span>
                  </div>
                  <Composer onSend={send} disabled={thinking} placeholder="Refine this stage, for example: I'd like a softer promise..." />
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </Shell>
  );
}
