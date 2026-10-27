import { NextResponse } from "next/server";
import { consumeLoginToken, startSession } from "@/lib/auth";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = await consumeLoginToken(url.searchParams.get("token") || "");
  const base = process.env.APP_URL || url.origin;
  if (!email) return NextResponse.redirect(`${base}/login?expired=1`);
  await startSession(email);
  return NextResponse.redirect(`${base}/`);
}
