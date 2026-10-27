import { withUser, json } from "@/lib/api";
import { track, IN_APP_EVENTS } from "@/lib/integrations";

export async function POST(req: Request) {
  return withUser(async (email) => {
    const { event } = (await req.json()) as { event: string };
    if (!(IN_APP_EVENTS as readonly string[]).includes(event)) return json({ error: "Unknown event" }, 400);
    await track(email, event);
    return json({ ok: true });
  });
}
