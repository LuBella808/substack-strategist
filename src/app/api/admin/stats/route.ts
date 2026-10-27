import { get } from "@/lib/store";
import { json } from "@/lib/api";

// Recent events across all buyers. GET with header x-admin-key.
export async function GET(req: Request) {
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) return json({ error: "unauthorized" }, 401);
  const { Redis } = await import("@upstash/redis");
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  const events = url && token ? await new Redis({ url, token }).lrange("events:all", 0, 999) : ((await get<unknown[]>("events:all")) || []);
  const counts: Record<string, number> = {};
  for (const e of events as { event: string }[]) counts[e.event] = (counts[e.event] || 0) + 1;
  return json({ counts, recent: (events as unknown[]).slice(0, 100) });
}
