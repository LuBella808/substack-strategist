"use client";
import { useEffect, useRef, useState } from "react";
import Md from "./Md";
import type { Pending, Turn } from "./useApp";

export function Thread({ turns, thinking }: { turns: Turn[]; thinking: boolean }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns.length, thinking]);
  return (
    <div className="thread" aria-live="polite">
      {turns.map((t, i) =>
        t.role === "assistant" ? (
          <div className="msg ai" key={i}>
            <span className="who" aria-hidden>★</span>
            <div className="body"><Md text={t.text} /></div>
          </div>
        ) : (
          <div className="msg me" key={i}>{t.text}</div>
        ),
      )}
      {thinking && (
        <div className="msg ai">
          <span className="who" aria-hidden>★</span>
          <div className="typing" aria-label="Your strategist is thinking"><i /><i /><i /></div>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}

export function Options({ pending, onSend, disabled }: { pending: Pending; onSend: (t: string) => void; disabled: boolean }) {
  const [picked, setPicked] = useState<string[]>([]);
  if (!pending) return null;
  if (!pending.allowMultiple)
    return (
      <div className="options">
        <div className="chips">
          {pending.options.map((o) => (
            <button key={o} className="chip" disabled={disabled} onClick={() => onSend(o)}>{o}</button>
          ))}
        </div>
      </div>
    );
  return (
    <div className="options">
      <div className="chips">
        {pending.options.map((o) => (
          <button key={o} className="chip" aria-pressed={picked.includes(o)} disabled={disabled}
            onClick={() => setPicked((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))}>{o}</button>
        ))}
      </div>
      <div><button className="btn small" disabled={disabled || !picked.length} onClick={() => onSend(picked.join(", "))}>Send my picks</button></div>
    </div>
  );
}

export function Composer({ onSend, disabled, placeholder }: { onSend: (t: string) => void; disabled: boolean; placeholder?: string }) {
  const [text, setText] = useState("");
  const send = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  };
  return (
    <div className="composer">
      <div className="row">
        <textarea id="composer" rows={2} value={text} placeholder={placeholder || "Write your answer..."} disabled={disabled}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
        <button className="btn" onClick={send} disabled={disabled || !text.trim()}>Send</button>
      </div>
      <span className="fine">Enter to send · Shift + Enter for a new line</span>
    </div>
  );
}
