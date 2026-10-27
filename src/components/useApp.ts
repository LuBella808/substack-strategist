"use client";
import { useCallback, useEffect, useState } from "react";
import type { Blueprint } from "@/lib/types";

export type Turn = { role: "user" | "assistant"; text: string };
export type Pending = { toolUseId: string; question: string; options: string[]; allowMultiple?: boolean } | null;
export type PublicStage = { complete: boolean; summary?: string; transcript: Turn[]; pendingOptions?: Pending };
export type PublicProgress = {
  currentStage: number;
  stages: Record<string, PublicStage>;
  blueprint: Blueprint;
  codexImport: string;
  session: Turn[];
  completedAt: string | null;
};
export type Offer = { name: string; price: string; url: string; blurb: string };
export type AppState = { email: string; firstName: string; mock: boolean; progress: PublicProgress; offers: Record<string, Offer>; product: { name: string; supportEmail: string } };

export async function api<T = unknown>(path: string, body?: unknown, method = body ? "POST" : "GET"): Promise<T> {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
    throw new Error("Please log in again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || "Something went wrong. Please try again.");
  return data as T;
}

export function track(event: string) {
  fetch("/api/event", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event }), keepalive: true }).catch(() => {});
}

export function useApp() {
  const [state, setState] = useState<AppState | null>(null);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    try {
      setState(await api<AppState>("/api/state"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    reload();
  }, [reload]);
  const setProgress = (progress: PublicProgress) => setState((s) => (s ? { ...s, progress } : s));
  return { state, error, reload, setProgress };
}
