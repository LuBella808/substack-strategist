import { withUser, json } from "@/lib/api";
import { loadProgress, publicProgress } from "@/lib/progress";
import { getBuyer } from "@/lib/auth";
import { mockMode } from "@/lib/strategist";
import { offers, product } from "@/config/offers";

export async function GET() {
  return withUser(async (email) => {
    const [p, buyer] = await Promise.all([loadProgress(email), getBuyer(email)]);
    return json({ email, firstName: buyer?.firstName || "", mock: mockMode, progress: publicProgress(p), offers, product });
  });
}
