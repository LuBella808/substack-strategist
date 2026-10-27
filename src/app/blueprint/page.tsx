"use client";
import Link from "next/link";
import { useState } from "react";
import Shell from "@/components/Shell";
import { api, track, useApp, type Offer, type PublicProgress } from "@/components/useApp";
import type { Blueprint } from "@/lib/types";

type Save = (changes: Partial<Blueprint>) => Promise<void>;

function Edit({ value, onSave, multiline, label }: { value: string; onSave: (v: string) => Promise<void> | void; multiline?: boolean; label: string }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  const [busy, setBusy] = useState(false);
  if (!editing)
    return <button className="edit-btn" onClick={() => { setV(value); setEditing(true); }} aria-label={`Edit ${label}`}>Edit</button>;
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {multiline ? <textarea rows={8} value={v} onChange={(e) => setV(e.target.value)} aria-label={label} />
        : <input type="text" value={v} onChange={(e) => setV(e.target.value)} aria-label={label} />}
      <div className="edit-row">
        <button className="btn small" disabled={busy} onClick={async () => { setBusy(true); await onSave(v); setBusy(false); setEditing(false); }}>Save</button>
        <button className="edit-btn" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </div>
  );
}

function Sec({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="sec">
      <header>
        <span className="num">{String(n).padStart(2, "0")}</span>
        <h2>{title}</h2>
      </header>
      <div className="body">{children}</div>
    </section>
  );
}

function Life({ bp, offers }: { bp: Blueprint; offers: Record<string, Offer> }) {
  const pm = offers.profit_mastery;
  const rec = bp.recommended_offer;
  const second = rec === "society" ? offers.society : rec === "substack_day" ? offers.substack_day : null;
  return (
    <section className="life no-print">
      <div className="eyebrow"><span className="star">★</span> Bring your publication to life</div>
      <h2>Congratulations. <em>Your strategy is done.</em></h2>
      <div className="life-row">
        <img src="/masterclass.webp" alt="Substack Profit Mastery free masterclass with Lucinda Rae" width={1536} height={1024} />
        <div style={{ display: "grid", gap: 18 }}>
          <p className="lede">The next step is turning your publication into an audience-building, trust-building part of your business. {pm.blurb}</p>
          <div>
            <a className="btn" href={pm.url} target="_blank" rel="noopener" onClick={() => track("profit_mastery_clicked")}>Watch Substack Profit Mastery · Free</a>
          </div>
        </div>
      </div>
      {second && (
        <div className="second life-row">
          {rec === "society" && <img src="/society.webp" alt="Substack Society program materials" width={1000} height={1000} />}
          <div style={{ display: "grid", gap: 10 }}>
            <div className="eyebrow">{rec === "society" ? "Ready for guided implementation?" : "Want it built for you?"}</div>
            <h3>{rec === "society" ? "Explore Substack Society" : "Book a Substack Day"}</h3>
            <p className="muted" style={{ maxWidth: "62ch" }}>{second.blurb}</p>
            <div>
              <a className="btn ghost small" href={second.url} target="_blank" rel="noopener" onClick={() => track(rec === "society" ? "society_clicked" : "substack_day_clicked")}>
                {rec === "society" ? "Explore Substack Society" : "Learn about Substack Day"}
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function BlueprintPage() {
  const { state, setProgress } = useApp();
  if (!state) return <Shell><main className="wrap center"><div className="orbit" aria-label="Loading" /></main></Shell>;
  const bp = state.progress.blueprint;
  const save: Save = async (changes) => {
    const r = await api<{ progress: PublicProgress }>("/api/blueprint", { changes }, "PATCH");
    setProgress(r.progress);
  };
  const has = Object.keys(bp).length > 0;
  const done = state.progress.currentStage > 6;
  const download = () => { track("blueprint_downloaded"); window.print(); };

  if (!has)
    return (
      <Shell>
        <main className="wrap center">
          <div className="card" style={{ maxWidth: 620, display: "grid", gap: 18 }}>
            <div className="eyebrow"><span className="star">★</span> Your blueprint</div>
            <h1 style={{ fontSize: 48 }}>Your blueprint fills in as you go.</h1>
            <p className="muted">Each stage you complete adds new pages here. Start with Stage 1 and come back to watch it grow.</p>
            <div><Link className="btn" href="/studio">Go to my studio</Link></div>
          </div>
        </main>
      </Shell>
    );

  let i = 0;
  const next = () => ++i;

  return (
    <Shell>
      <div className="paper-bg">
        <main className="wrap bp">
          <div className="bp-tools">
            <div className="eyebrow"><span className="star">★</span> {done ? "Your Publication Blueprint" : "Your blueprint so far"}</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link className="btn ghost small" href="/session">Refine with my strategist</Link>
              <button className="btn small" onClick={download}>Download PDF</button>
            </div>
          </div>

          <div className="cover">
            <div className="eyebrow"><span className="star">★</span> Publication Blueprint · The Substack Strategist</div>
            <h1>{bp.name?.recommended || "Your Publication"}</h1>
            {bp.name?.subtitle && <div className="sub">{bp.name.subtitle}</div>}
            {bp.promise && <p className="promise">{bp.promise}</p>}
            <div className="meta">
              <span className="fine">Prepared for {state.firstName || state.email}</span>
              <span className="fine">{new Date(state.progress.completedAt || Date.now()).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {!done && <p style={{ marginTop: 24, color: "var(--mute-l)" }}>Complete all six stages to add your About page, welcome post, 30-day roadmap and next steps. <Link href="/studio">Return to the studio</Link>.</p>}

          {bp.name && (
            <Sec n={next()} title="Your Publication Name">
              <div className="big">{bp.name.recommended}</div>
              <p><em>{bp.name.subtitle}</em></p>
              <p>{bp.name.why}</p>
              <p className="fine" style={{ color: "var(--mute-l)" }}>Approach: {bp.name.naming_approach}. Search this name on Substack and check any domain before you commit, since availability hasn't been checked.</p>
              <Edit label="publication name" value={`${bp.name.recommended} | ${bp.name.subtitle}`}
                onSave={(v) => { const [a, b] = v.split("|").map((x) => x.trim()); return save({ name: { ...bp.name!, recommended: a || bp.name!.recommended, subtitle: b ?? bp.name!.subtitle } }); }} />
            </Sec>
          )}

          {bp.alternatives?.length ? (
            <Sec n={next()} title="Alternative Names">
              <div className="names">{bp.alternatives.map((a) => <span key={a.name}>{a.name}<small>{a.subtitle}</small></span>)}</div>
            </Sec>
          ) : null}

          {bp.reader && (
            <Sec n={next()} title="Your Ideal Reader">
              <p>{bp.reader.profile}</p>
              <div className="grid2">
                <div className="tile"><span className="k">She longs for</span><ul>{bp.reader.desires.map((d) => <li key={d}>{d}</li>)}</ul></div>
                <div className="tile"><span className="k">She struggles with</span><ul>{bp.reader.struggles.map((d) => <li key={d}>{d}</li>)}</ul></div>
              </div>
              <p><strong>Why she subscribes:</strong> {bp.reader.why_subscribe}</p>
            </Sec>
          )}

          {bp.promise && (
            <Sec n={next()} title="Your Publication Promise">
              <div className="big">{bp.promise}</div>
              {bp.distinctive && <p><strong>What makes you distinctive:</strong> {bp.distinctive}</p>}
              <Edit label="publication promise" value={bp.promise} multiline onSave={(v) => save({ promise: v })} />
            </Sec>
          )}

          {bp.positioning && (
            <Sec n={next()} title="Your Positioning Statement">
              <p style={{ fontSize: 19 }}>{bp.positioning}</p>
              <Edit label="positioning statement" value={bp.positioning} multiline onSave={(v) => save({ positioning: v })} />
            </Sec>
          )}

          {bp.golden_thread && (
            <Sec n={next()} title="Your Golden Thread">
              <div className="big">{bp.golden_thread.thread}</div>
              <p>{bp.golden_thread.explanation}</p>
              <div className="names">{bp.golden_thread.woven.map((w) => <span key={w} style={{ fontSize: 17 }}>{w}</span>)}</div>
            </Sec>
          )}

          {bp.pillars?.length ? (
            <Sec n={next()} title="Your Editorial Pillars">
              <div className="grid2">
                {bp.pillars.map((pl, k) => (
                  <div className="tile" key={k}>
                    <span className="k">Pillar {k + 1}</span>
                    <h3>{pl.name}</h3>
                    <p>{pl.description}</p>
                    <p><strong>For your reader:</strong> {pl.reader_value}</p>
                    {pl.themes?.length > 0 && <p><strong>Recurring themes:</strong> {pl.themes.join(", ")}</p>}
                    {pl.example_articles?.length > 0 && <ul>{pl.example_articles.map((a) => <li key={a}>{a}</li>)}</ul>}
                    <Edit label={`pillar ${k + 1}`} multiline value={`${pl.name}\n${pl.description}`}
                      onSave={(v) => { const [name, ...rest] = v.split("\n"); const pillars = [...bp.pillars!]; pillars[k] = { ...pl, name: name.trim() || pl.name, description: rest.join("\n").trim() || pl.description }; return save({ pillars }); }} />
                  </div>
                ))}
              </div>
              {bp.sections_advice && <p><strong>Pillars and Substack sections:</strong> {bp.sections_advice}</p>}
            </Sec>
          ) : null}

          {bp.profile && (
            <Sec n={next()} title="Your Profile Name and Bio">
              <div className="tile">
                <span className="k">Display name</span>
                <h3>{bp.profile.display_name}</h3>
                <span className="k" style={{ marginTop: 8 }}>Bio</span>
                <p>{bp.profile.bio}</p>
              </div>
              <Edit label="profile bio" multiline value={`${bp.profile.display_name}\n${bp.profile.bio}`}
                onSave={(v) => { const [d, ...b] = v.split("\n"); return save({ profile: { display_name: d.trim(), bio: b.join(" ").trim() } }); }} />
            </Sec>
          )}

          {bp.about_page && (
            <Sec n={next()} title="Your About Page">
              <div className="about">{bp.about_page}</div>
              <Edit label="About page" multiline value={bp.about_page} onSave={(v) => save({ about_page: v })} />
            </Sec>
          )}

          {bp.articles?.length ? (
            <Sec n={next()} title="Ten Article Ideas">
              <div className="articles">
                {bp.articles.map((a) => (
                  <div key={a.title}><span><b>{a.title}</b><small>{a.hook}</small></span><span className="tag">{a.pillar}</span></div>
                ))}
              </div>
            </Sec>
          ) : null}

          {bp.welcome_post && (
            <Sec n={next()} title="Your Welcome Post">
              <div className="big">{bp.welcome_post.title}</div>
              <p><em>{bp.welcome_post.subtitle}</em></p>
              <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 6 }}>{bp.welcome_post.outline.map((o) => <li key={o}>{o}</li>)}</ol>
            </Sec>
          )}

          {(bp.roadmap?.length || bp.rhythm) && (
            <Sec n={next()} title="Your 30-Day Roadmap">
              {bp.rhythm && (
                <div className="tile">
                  <span className="k">Your publishing rhythm</span>
                  <h3>{bp.rhythm.cadence}</h3>
                  <p>{bp.rhythm.weekly_plan}</p>
                  <p><strong>Notes:</strong> {bp.rhythm.notes}</p>
                  <Edit label="publishing rhythm" multiline value={`${bp.rhythm.cadence}\n${bp.rhythm.weekly_plan}`}
                    onSave={(v) => { const [c, ...w] = v.split("\n"); return save({ rhythm: { ...bp.rhythm!, cadence: c.trim(), weekly_plan: w.join("\n").trim() } }); }} />
                </div>
              )}
              {bp.roadmap?.length ? (
                <div className="weeks">
                  {bp.roadmap.map((w) => (
                    <div className="tile" key={w.week}><span className="k">{w.week}</span><h3 style={{ fontSize: 22 }}>{w.focus}</h3><ul>{w.actions.map((a) => <li key={a}>{a}</li>)}</ul></div>
                  ))}
                </div>
              ) : null}
            </Sec>
          )}

          {bp.growth?.length ? (
            <Sec n={next()} title="Subscriber Growth Ideas">
              <ul>{bp.growth.map((g) => <li key={g}>{g}</li>)}</ul>
            </Sec>
          ) : null}

          {bp.monetization && (
            <Sec n={next()} title="Your Monetization Strategy">
              <p style={{ fontSize: 18 }}>{bp.monetization.summary}</p>
              <div className="path">{bp.monetization.pathway.map((s) => <div key={s.step}><b>{s.step}</b><span>{s.detail}</span></div>)}</div>
              <p className="fine" style={{ color: "var(--mute-l)" }}>A starting strategy. Results depend on your publishing, offers and audience.</p>
            </Sec>
          )}

          {bp.next_steps?.length ? (
            <Sec n={next()} title="Your Next Steps">
              <ol style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, fontSize: 18 }}>{bp.next_steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </Sec>
          ) : null}

          {done && bp.composedAt && <Life bp={bp} offers={state.offers} />}
        </main>
      </div>
    </Shell>
  );
}
