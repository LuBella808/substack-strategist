import { withUser, json } from "@/lib/api";
import { loadProgress, saveProgress, publicProgress } from "@/lib/progress";
import { stageTurn } from "@/lib/strategist";
import { track } from "@/lib/integrations";

export const maxDuration = 120;

export async function POST(req: Request) {
  return withUser(async (email) => {
    const { stage, text, codex } = (await req.json()) as { stage: number; text: string; codex?: string };
    const p = await loadProgress(email);
    if (!stage || stage < 1 || stage > 6 || stage > p.currentStage) return json({ error: "That stage isn't open yet." }, 400);
    if (!text?.trim()) return json({ error: "Please write an answer first." }, 400);
    if (codex?.trim()) p.codexImport = codex.trim().slice(0, 12000);
    const first = !p.startedAt;
    if (first) p.startedAt = new Date().toISOString();
    if (p.stages[stage]?.complete) {
      // Reopening a finished stage to refine it.
      p.stages[stage].complete = false;
    }
    const r = await stageTurn(email, p, stage, text.trim().slice(0, 6000));
    await saveProgress(email, p);
    if (first) await track(email, "assessment_started");
    if (r.complete && stage === 6) {
      await track(email, "assessment_completed");
      const rec = p.blueprint.recommended_offer;
      if (rec === "society") await track(email, "recommended_society");
      if (rec === "substack_day") await track(email, "recommended_substack_day");
    }
    return json({ ...r, progress: publicProgress(p) });
  });
}
