import { getBuyer, createLoginToken, grantAccess } from "@/lib/auth";
import { sendLoginEmail } from "@/lib/integrations";
import { json } from "@/lib/api";
import { product } from "@/config/offers";

export async function POST(req: Request) {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return json({ error: "Please enter the email you used at checkout." }, 400);

  // Local development: any email gets in, so the app can be tried without Kartra.
  if (process.env.NODE_ENV !== "production" && process.env.DEV_OPEN_ACCESS !== "false") await grantAccess(email, "dev");

  const buyer = await getBuyer(email);
  if (!buyer)
    return json({ error: `We couldn't find a purchase for that email. Try the email you used at checkout, or get access at ${product.salesPage}.` }, 404);
  const token = await createLoginToken(email);
  const r = await sendLoginEmail(email, token);
  return json({ ok: true, devLink: r.devLink });
}
