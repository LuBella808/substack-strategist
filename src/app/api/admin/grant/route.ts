import { grantAccess } from "@/lib/auth";
import { json } from "@/lib/api";

// Give someone access by hand (comps, beta testers, fixing a missed webhook).
// curl -X POST https://strategist.hellolucinda.com/api/admin/grant -H "x-admin-key: YOUR_ADMIN_KEY" -H "content-type: application/json" -d '{"email":"name@example.com"}'
export async function POST(req: Request) {
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) return json({ error: "unauthorized" }, 401);
  const { email, firstName } = (await req.json()) as { email: string; firstName?: string };
  if (!email) return json({ error: "email required" }, 400);
  const buyer = await grantAccess(email, "admin", firstName);
  return json({ ok: true, buyer });
}
