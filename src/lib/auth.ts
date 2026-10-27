import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { get, set, del } from "./store";
import type { Buyer } from "./types";

const COOKIE = "ss_session";
const secret = () => {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is not set");
  return new TextEncoder().encode(s || "dev-only-secret-change-me-please-0123456789");
};

export const normEmail = (e: string) => e.trim().toLowerCase();
export const buyerKey = (email: string) => `buyer:${normEmail(email)}`;

export async function getBuyer(email: string) {
  return get<Buyer>(buyerKey(email));
}

export async function grantAccess(email: string, source: Buyer["source"], firstName?: string) {
  const existing = await getBuyer(email);
  if (existing) return existing;
  const buyer: Buyer = { email: normEmail(email), firstName, createdAt: new Date().toISOString(), source };
  await set(buyerKey(email), buyer);
  return buyer;
}

export async function createLoginToken(email: string) {
  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  await set(`login:${token}`, normEmail(email), 60 * 30);
  return token;
}

export async function consumeLoginToken(token: string) {
  const email = await get<string>(`login:${token}`);
  if (email) await del(`login:${token}`);
  return email;
}

export async function startSession(email: string) {
  const jwt = await new SignJWT({ email: normEmail(email) })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(secret());
  (await cookies()).set(COOKIE, jwt, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}

export async function currentEmail(): Promise<string | null> {
  const c = (await cookies()).get(COOKIE)?.value;
  if (!c) return null;
  try {
    const { payload } = await jwtVerify(c, secret());
    const email = String(payload.email || "");
    if (!email) return null;
    const buyer = await getBuyer(email);
    return buyer ? email : null;
  } catch {
    return null;
  }
}
