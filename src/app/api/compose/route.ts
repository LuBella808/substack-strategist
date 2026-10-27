import { withUser, json } from "@/lib/api";
import { loadProgress, saveProgress, publicProgress } from "@/lib/progress";
import { composeBlueprint } from "@/lib/strategist";

export const maxDuration = 300;

export async function POST() {
  return withUser(async (email) => {
    const p = await loadProgress(email);
    if (p.currentStage < 7) return json({ error: "Finish all six stages first." }, 400);
    await composeBlueprint(email, p);
    await saveProgress(email, p);
    return json({ progress: publicProgress(p) });
  });
}
