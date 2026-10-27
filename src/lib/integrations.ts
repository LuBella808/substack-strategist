import { kartraTags, product } from "@/config/offers";
import { pushList } from "./store";

const appUrl = () => process.env.APP_URL || "http://localhost:3000";

/** Sends the login link. Uses Resend if RESEND_API_KEY is set; otherwise logs it (local dev). */
export async function sendLoginEmail(email: string, token: string): Promise<{ sent: boolean; devLink?: string }> {
  const link = `${appUrl()}/auth/verify?token=${token}`;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[login link for ${email}] ${link}`);
    return { sent: false, devLink: process.env.NODE_ENV === "production" ? undefined : link };
  }
  const html = `
  <div style="background:#2a0b12;padding:48px 24px;font-family:Georgia,serif;color:#f6ead2;text-align:center">
    <div style="color:#c9a24a;font-size:22px">&#9733;</div>
    <div style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;color:#c9a24a;margin:12px 0">THE SUBSTACK STRATEGIST</div>
    <h1 style="font-weight:400;font-size:32px;margin:0 0 16px">Your studio is ready.</h1>
    <p style="font-family:Arial,sans-serif;font-size:15px;line-height:1.6;color:#e9dcc4;max-width:420px;margin:0 auto 28px">Tap the button below to step inside. This link works once and expires in 30 minutes.</p>
    <a href="${link}" style="display:inline-block;background:#c9a24a;color:#2a0b12;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:12px;letter-spacing:3px;padding:16px 28px">ENTER MY STUDIO</a>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#b9a98f;margin-top:32px">Questions? Reply to this email or write ${product.supportEmail}.</p>
  </div>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Lucinda Rae <lucinda@hellolucinda.com>",
      to: email,
      reply_to: product.supportEmail,
      subject: "Your Substack Strategist login",
      html,
    }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
  return { sent: res.ok };
}

/** Optional: apply a tag to the lead in Kartra via the Kartra API. */
export async function kartraTag(email: string, tag: string) {
  const app = process.env.KARTRA_APP_ID, key = process.env.KARTRA_API_KEY, pass = process.env.KARTRA_API_PASSWORD;
  if (!app || !key || !pass || !tag) return;
  const body = new URLSearchParams({
    app_id: app,
    api_key: key,
    api_password: pass,
    "lead[email]": email,
    "actions[0][cmd]": "assign_tag",
    "actions[0][tag_name]": tag,
  });
  try {
    const r = await fetch("https://app.kartra.com/api", { method: "POST", body });
    if (!r.ok) console.error("Kartra tag failed", r.status);
  } catch (e) {
    console.error("Kartra tag error", e);
  }
}

export const IN_APP_EVENTS = [
  "assessment_started",
  "assessment_completed",
  "blueprint_downloaded",
  "profit_mastery_clicked",
  "society_clicked",
  "substack_day_clicked",
  "recommended_society",
  "recommended_substack_day",
] as const;
// Confirmed by Kartra (arrive through the webhook): strategist_purchased, profit_mastery_registered.

/** Records an event and, if configured, mirrors it to Kartra as a tag and to an outside webhook (e.g. Zapier). */
export async function track(email: string, event: string, source: "app" | "kartra" = "app", data?: Record<string, unknown>) {
  const entry = { email, event, source, at: new Date().toISOString(), ...(data ? { data } : {}) };
  await pushList(`events:${email}`, entry, 200);
  await pushList(`events:all`, entry, 5000);
  if (source === "app" && kartraTags[event]) await kartraTag(email, kartraTags[event]);
  const hook = process.env.EVENTS_WEBHOOK_URL;
  if (hook) {
    fetch(hook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }).catch(() => {});
  }
}
