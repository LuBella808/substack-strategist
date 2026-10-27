import { NextResponse } from "next/server";
import { currentEmail } from "./auth";
import { LimitError } from "./strategist";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

export async function withUser(fn: (email: string) => Promise<Response>) {
  const email = await currentEmail();
  if (!email) return json({ error: "Please log in again." }, 401);
  try {
    return await fn(email);
  } catch (e) {
    if (e instanceof LimitError)
      return json({ error: "You've reached this month's strategy limit. It resets on the 1st. Reply to your purchase email if you need more." }, 429);
    console.error(e);
    return json({ error: "Your strategist lost her train of thought. Please try that again." }, 500);
  }
}
