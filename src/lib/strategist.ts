import Anthropic from "@anthropic-ai/sdk";
import { stages, composeSchema } from "@/config/stages";
import { monthlyMessageLimit } from "@/config/offers";
import { stageSystem, composeSystem, sessionSystem } from "./prompts";
import { incr } from "./store";
import { mockStageTurn, mockCompose, mockSession } from "./mock";
import type { ChatMessage, Progress } from "./types";

type Block = Record<string, unknown>;

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
export const mockMode = !process.env.ANTHROPIC_API_KEY;
const client = mockMode ? null : new Anthropic();

export class LimitError extends Error {}

async function meter(email: string) {
  const month = new Date().toISOString().slice(0, 7);
  const n = await incr(`usage:${email}:${month}`, 60 * 60 * 24 * 40);
  if (n > monthlyMessageLimit) throw new LimitError("monthly limit");
}

// Keep Lucinda's no-em-dash rule even if the model slips.
export function clean<T>(v: T): T {
  if (typeof v === "string") return v.replace(/\s*—\s*/g, ", ").replace(/–/g, "-") as T;
  if (Array.isArray(v)) return v.map(clean) as T;
  if (v && typeof v === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) o[k] = clean(x);
    return o as T;
  }
  return v;
}

const showOptionsTool = {
  name: "show_options",
  description: "Show the user clickable answer options for your question. They may also type their own answer.",
  input_schema: {
    type: "object" as const,
    properties: {
      question: { type: "string", description: "The question, in a few words." },
      options: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 8 },
      allow_multiple: { type: "boolean" },
    },
    required: ["question", "options"],
  },
};

function cachedSystem(text: string) {
  return [{ type: "text" as const, text, cache_control: { type: "ephemeral" as const } }];
}

// Remove an unanswered tool_use at the end (e.g. if the user typed instead of using a pending prompt).
function sanitizeHistory(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => ({ role: m.role, content: m.content })) as ChatMessage[];
}

export type StageResult = { reply: string; complete: boolean; options?: { toolUseId: string; question: string; options: string[]; allowMultiple?: boolean } | null };

/** One turn of a discovery stage. Mutates progress. */
export async function stageTurn(email: string, p: Progress, n: number, userText: string): Promise<StageResult> {
  const def = stages.find((s) => s.n === n)!;
  const st = (p.stages[n] ??= { messages: [], complete: false });

  // Answer a pending show_options with a tool_result, otherwise plain text.
  const pending = st.pendingOptions;
  st.messages.push(
    pending
      ? { role: "user", content: [{ type: "tool_result", tool_use_id: pending.toolUseId, content: userText }] }
      : { role: "user", content: userText },
  );
  st.pendingOptions = null;

  await meter(email);

  let content: Block[];
  if (!client) {
    content = mockStageTurn(n, st.messages.filter((m) => m.role === "user").length);
  } else {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: n === 5 ? 8000 : 4000,
      system: cachedSystem(stageSystem(p, n)),
      messages: sanitizeHistory(st.messages) as Anthropic.MessageParam[],
      tools: [
        showOptionsTool,
        { name: "complete_stage", description: def.completion.description, input_schema: def.completion.schema as Anthropic.Tool.InputSchema },
      ],
    });
    content = res.content as unknown as Block[];
  }
  content = clean(content);

  const text = content.filter((b) => b.type === "text").map((b) => String(b.text)).join("\n\n").trim();
  const complete = content.find((b) => b.type === "tool_use" && b.name === "complete_stage");
  const opts = content.find((b) => b.type === "tool_use" && b.name === "show_options");

  if (complete) {
    // Store only the text so the stage history never ends on an unanswered tool call.
    st.messages.push({ role: "assistant", content: text || "Beautiful. I've saved this to your blueprint." });
    const wrapKey = n === 1 ? "identity" : n === 2 ? "golden_thread" : null;
    if (wrapKey) (p.blueprint as Record<string, unknown>)[wrapKey] = complete.input;
    else Object.assign(p.blueprint, complete.input as object);
    st.complete = true;
    st.summary = text;
    p.currentStage = Math.max(p.currentStage, n + 1);
    if (n === 6) p.completedAt = p.completedAt || new Date().toISOString();
    return { reply: text || "Beautiful. I've saved this to your blueprint.", complete: true };
  }

  st.messages.push({ role: "assistant", content: content as ChatMessage["content"] });
  if (opts) {
    const input = opts.input as { question: string; options: string[]; allow_multiple?: boolean };
    st.pendingOptions = { toolUseId: String(opts.id), question: input.question, options: input.options, allowMultiple: !!input.allow_multiple };
  }
  return { reply: text, complete: false, options: st.pendingOptions };
}

export async function composeBlueprint(email: string, p: Progress) {
  await meter(email);
  let input: Record<string, unknown>;
  if (!client) input = mockCompose();
  else {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: cachedSystem(composeSystem(p)),
      messages: [{ role: "user", content: "Please write the final sections of my Publication Blueprint." }],
      tools: [{ name: "write_blueprint", description: "Save the final blueprint sections.", input_schema: composeSchema as Anthropic.Tool.InputSchema }],
      tool_choice: { type: "tool", name: "write_blueprint" },
    });
    const tu = res.content.find((b) => b.type === "tool_use");
    if (!tu || tu.type !== "tool_use") throw new Error("No blueprint returned");
    input = tu.input as Record<string, unknown>;
  }
  Object.assign(p.blueprint, clean(input), { composedAt: new Date().toISOString() });
}

/** Returning strategy session, with web search and blueprint updates. Mutates progress. */
export async function sessionTurn(email: string, p: Progress, userText: string): Promise<{ reply: string; updated: string[] }> {
  p.session.push({ role: "user", content: userText });
  await meter(email);
  const updated: string[] = [];

  if (!client) {
    const reply = mockSession(userText);
    p.session.push({ role: "assistant", content: reply });
    return { reply, updated };
  }

  const tools: Anthropic.Messages.ToolUnion[] = [
    {
      name: "update_blueprint",
      description: "Update fields of the user's blueprint. Pass only the top-level fields that change, with their full new value.",
      input_schema: { type: "object", properties: { changes: { type: "object", description: "Top-level blueprint fields and their new values." } }, required: ["changes"] },
    },
  ];
  if (process.env.ENABLE_WEB_SEARCH !== "false") {
    tools.push({ type: "web_search_20250305", name: "web_search", max_uses: 3 } as Anthropic.Messages.WebSearchTool20250305);
  }

  // Send a recent window of the conversation.
  const history = p.session.slice(-30);
  while (history.length && (history[0].role !== "user" || Array.isArray(history[0].content))) history.shift();
  const msgs = history.map((m) => ({ role: m.role, content: m.content })) as Anthropic.MessageParam[];

  let reply = "";
  for (let i = 0; i < 4; i++) {
    const res = await client.messages.create({ model: MODEL, max_tokens: 3000, system: cachedSystem(sessionSystem(p)), messages: msgs, tools });
    const content = clean(res.content) as Anthropic.ContentBlock[];
    msgs.push({ role: "assistant", content: content as Anthropic.ContentBlockParam[] });
    reply = content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("").trim() || reply;

    if (res.stop_reason === "pause_turn") continue;
    const uses = content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];
    if (!uses.length) break;
    const results: Anthropic.ToolResultBlockParam[] = uses.map((u) => {
      const changes = (u.input as { changes?: Record<string, unknown> }).changes || {};
      Object.assign(p.blueprint, clean(changes));
      updated.push(...Object.keys(changes));
      return { type: "tool_result", tool_use_id: u.id, content: "Saved to the blueprint." };
    });
    msgs.push({ role: "user", content: results });
  }

  // Store a simple text transcript for the session.
  p.session.push({ role: "assistant", content: reply || "Done. Your blueprint is updated." });
  p.session = p.session.slice(-60);
  return { reply: reply || "Done. Your blueprint is updated.", updated };
}
