// Tiny, safe renderer for the strategist's light markdown: paragraphs, **bold**, *italic*, and lists.
import React from "react";

function inline(s: string, key: string) {
  const parts = s.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={key + i}>{p.slice(2, -2)}</strong>
    : p.startsWith("*") && p.endsWith("*") && p.length > 2 ? <em key={key + i}>{p.slice(1, -1)}</em>
    : <React.Fragment key={key + i}>{p}</React.Fragment>,
  );
}

export default function Md({ text }: { text: string }) {
  const blocks = text.replace(/\r/g, "").split(/\n{2,}/);
  return (
    <div className="md">
      {blocks.map((b, i) => {
        const lines = b.split("\n").filter(Boolean);
        if (lines.length && lines.every((l) => /^\s*([-*•]|\d+[.)])\s+/.test(l))) {
          const ordered = /^\s*\d/.test(lines[0]);
          const items = lines.map((l, j) => <li key={j}>{inline(l.replace(/^\s*([-*•]|\d+[.)])\s+/, ""), `${i}-${j}-`)}</li>);
          return ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
        }
        return <p key={i}>{lines.map((l, j) => <React.Fragment key={j}>{j > 0 && <br />}{inline(l.replace(/^#+\s*/, ""), `${i}-${j}-`)}</React.Fragment>)}</p>;
      })}
    </div>
  );
}
