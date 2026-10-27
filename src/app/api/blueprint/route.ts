import { withUser, json } from "@/lib/api";
import { loadProgress, saveProgress, publicProgress } from "@/lib/progress";
import { clean } from "@/lib/strategist";
import type { Blueprint } from "@/lib/types";

const allowed = new Set<keyof Blueprint>(["name", "promise", "positioning", "golden_thread", "pillars", "rhythm", "profile", "about_page", "welcome_post", "distinctive"]);

// Saves the user's own edits to blueprint sections.
export async function PATCH(req: Request) {
  return withUser(async (email) => {
    const { changes } = (await req.json()) as { changes: Partial<Blueprint> };
    const p = await loadProgress(email);
    for (const [k, v] of Object.entries(changes || {})) {
      if (allowed.has(k as keyof Blueprint)) (p.blueprint as Record<string, unknown>)[k] = clean(v);
    }
    await saveProgress(email, p);
    return json({ progress: publicProgress(p) });
  });
}
