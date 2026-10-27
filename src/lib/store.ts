import { Redis } from "@upstash/redis";

// Storage: Upstash Redis (add it from the Vercel Marketplace). Without it, an in-memory
// store is used so the app runs locally; that store resets whenever the server restarts.

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

type Mem = { v: unknown; exp?: number };
const g = globalThis as unknown as { __mem?: Map<string, Mem> };
const mem = (g.__mem ??= new Map<string, Mem>());

export const usingMemoryStore = !redis;

export async function get<T>(key: string): Promise<T | null> {
  if (redis) return (await redis.get<T>(key)) ?? null;
  const m = mem.get(key);
  if (!m) return null;
  if (m.exp && m.exp < Date.now()) {
    mem.delete(key);
    return null;
  }
  return structuredClone(m.v) as T;
}

export async function set(key: string, value: unknown, ttlSeconds?: number) {
  if (redis) {
    if (ttlSeconds) await redis.set(key, value, { ex: ttlSeconds });
    else await redis.set(key, value);
    return;
  }
  mem.set(key, { v: structuredClone(value), exp: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined });
}

export async function del(key: string) {
  if (redis) await redis.del(key);
  else mem.delete(key);
}

export async function incr(key: string, ttlSeconds: number): Promise<number> {
  if (redis) {
    const n = await redis.incr(key);
    if (n === 1) await redis.expire(key, ttlSeconds);
    return n;
  }
  const cur = ((await get<number>(key)) || 0) + 1;
  await set(key, cur, ttlSeconds);
  return cur;
}

export async function pushList(key: string, value: unknown, max = 500) {
  if (redis) {
    await redis.lpush(key, value);
    await redis.ltrim(key, 0, max - 1);
    return;
  }
  const list = ((await get<unknown[]>(key)) || []) as unknown[];
  list.unshift(value);
  await set(key, list.slice(0, max));
}
