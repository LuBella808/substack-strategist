import { grantAccess } from "@/lib/auth";
import { track } from "@/lib/integrations";
import { json } from "@/lib/api";

// Point Kartra (or Zapier) here:
//   purchase:    https://strategist.hellolucinda.com/api/webhooks/kartra?key=YOUR_WEBHOOK_SECRET&event=purchase
//   PM sign-up:  https://strategist.hellolucinda.com/api/webhooks/kartra?key=YOUR_WEBHOOK_SECRET&event=profit_mastery_registered
// Accepts JSON or form posts and looks for the buyer's email in the usual Kartra fields.

function pick(obj: Record<string, unknown>, paths: string[]): string {
  for (const p of paths) {
    const v = p.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
    if (typeof v === "string" && v) return v;
  }
  return "";
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  const type = req.headers.get("content-type") || "";
  const raw = await req.text();
  if (type.includes("json")) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  const params = new URLSearchParams(raw);
  const out: Record<string, unknown> = {};
  for (const [k, v] of params) {
    // Turn lead[email] into lead.email
    const parts = k.replace(/\]/g, "").split("[");
    let o = out;
    parts.forEach((part, i) => {
      if (i === parts.length - 1) o[part] = v;
      else o = (o[part] = (o[part] as Record<string, unknown>) || {}) as Record<string, unknown>;
    });
  }
  return out;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const secret = process.env.KARTRA_WEBHOOK_SECRET;
  if (!secret || url.searchParams.get("key") !== secret) return json({ error: "unauthorized" }, 401);

  const body = await readBody(req);
  const email = pick(body, ["lead.email", "email", "buyer.email", "customer.email", "data.email"]);
  const firstName = pick(body, ["lead.first_name", "first_name", "buyer.first_name", "firstName"]);
  if (!email) return json({ error: "no email found" }, 400);

  const event = url.searchParams.get("event") || "purchase";
  if (event === "purchase") {
    await grantAccess(email, "kartra", firstName || undefined);
    await track(email.toLowerCase(), "strategist_purchased", "kartra");
  } else if (event === "profit_mastery_registered") {
    await track(email.toLowerCase(), "profit_mastery_registered", "kartra");
  } else {
    return json({ error: "unknown event" }, 400);
  }
  return json({ ok: true });
}
