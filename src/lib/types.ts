export type Buyer = {
  email: string;
  firstName?: string;
  createdAt: string;
  source: "kartra" | "admin" | "dev";
};

export type ChatMessage = {
  role: "user" | "assistant";
  // Anthropic content blocks, stored as-is so tool use can continue across turns
  content: string | Array<Record<string, unknown>>;
};

export type OptionsPrompt = { toolUseId: string; question: string; options: string[]; allowMultiple?: boolean };

export type StageState = {
  messages: ChatMessage[];
  pendingOptions?: OptionsPrompt | null;
  complete: boolean;
  summary?: string;
};

export type Pillar = {
  name: string;
  description: string;
  reader_value: string;
  themes: string[];
  example_articles: string[];
};

export type Blueprint = {
  identity?: { summary: string; expertise: string[]; gifts: string[]; mission: string; roles: string[] };
  golden_thread?: { thread: string; explanation: string; woven: string[] };
  reader?: { profile: string; desires: string[]; struggles: string[]; why_subscribe: string };
  promise?: string;
  distinctive?: string;
  name?: { recommended: string; subtitle: string; naming_approach: string; why: string };
  alternatives?: { name: string; subtitle: string }[];
  positioning?: string;
  profile?: { display_name: string; bio: string };
  pillars?: Pillar[];
  sections_advice?: string;
  rhythm?: { cadence: string; weekly_plan: string; notes: string };
  articles?: { title: string; pillar: string; hook: string }[];
  monetization?: { goals: string[]; summary: string; pathway: { step: string; detail: string }[] };
  about_page?: string;
  welcome_post?: { title: string; subtitle: string; outline: string[] };
  roadmap?: { week: string; focus: string; actions: string[] }[];
  growth?: string[];
  next_steps?: string[];
  recommended_offer?: "profit_mastery" | "society" | "substack_day";
  composedAt?: string;
};

export type Progress = {
  currentStage: number; // 1-6, 7 once complete
  stages: Record<string, StageState>;
  blueprint: Blueprint;
  codexImport?: string;
  session: ChatMessage[];
  startedAt?: string;
  completedAt?: string;
  updatedAt: string;
};

export const emptyProgress = (): Progress => ({
  currentStage: 1,
  stages: {},
  blueprint: {},
  session: [],
  updatedAt: new Date().toISOString(),
});
