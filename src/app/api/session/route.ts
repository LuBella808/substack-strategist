import { withUser, json } from "@/lib/api";
import { loadProgress, saveProgress, publicProgress } from "@/lib/progress";
import { sessionTurn } from "@/lib/strategist";

export const maxDuration = 120;

export async function POST(req: Request) {
  return withUser(async (email) => {
    const { text } = (await req.json()) as { text: string };
    if (!text?.trim()) return json({ error: "Type a question first." }, 400);
    const p = await loadProgress(email);
    const r = await sessionTurn(email, p, text.trim().slice(0, 6000));
    await saveProgress(email, p);
    return json({ ...r, progress: publicProgress(p) });
  });
}
