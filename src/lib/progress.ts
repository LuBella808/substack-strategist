import { get, set } from "./store";
import { emptyProgress, type Progress } from "./types";

const key = (email: string) => `progress:${email}`;

export async function loadProgress(email: string): Promise<Progress> {
  return (await get<Progress>(key(email))) || emptyProgress();
}

export async function saveProgress(email: string, p: Progress) {
  p.updatedAt = new Date().toISOString();
  await set(key(email), p);
}

// What the browser gets: progress without raw tool plumbing.
export function publicProgress(p: Progress) {
  const stages: Record<string, { complete: boolean; summary?: string; transcript: { role: string; text: string }[]; pendingOptions?: unknown }> = {};
  for (const [n, s] of Object.entries(p.stages)) {
    stages[n] = {
      complete: s.complete,
      summary: s.summary,
      pendingOptions: s.pendingOptions || null,
      transcript: s.messages.map((m) => ({ role: m.role, text: textOf(m.content) })).filter((m) => m.text),
    };
  }
  return {
    currentStage: p.currentStage,
    stages,
    blueprint: p.blueprint,
    codexImport: p.codexImport || "",
    session: p.session.map((m) => ({ role: m.role, text: textOf(m.content) })).filter((m) => m.text),
    completedAt: p.completedAt || null,
  };
}

export function textOf(content: unknown): string {
  if (typeof content === "string") return content.startsWith("[[hidden]]") ? "" : content;
  if (!Array.isArray(content)) return "";
  return content
    .map((b: Record<string, unknown>) => {
      if (b.type === "text") return String(b.text || "");
      if (b.type === "tool_result") {
        const c = b.content;
        if (typeof c === "string") return c.startsWith("[[hidden]]") ? "" : c;
        if (Array.isArray(c)) return c.map((x: Record<string, unknown>) => String(x.text || "")).join("\n");
      }
      return "";
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}
