// Every offer name, price and link the app shows lives here.
// Links read from environment variables first, so you can change them in Vercel
// without touching code. The bracketed values are placeholders until you set them.

const env = (key: string, fallback: string) => process.env[key] || fallback;

export const product = {
  name: "The Substack Strategist",
  byline: "with Lucinda Rae",
  price: "$37",
  supportEmail: env("SUPPORT_EMAIL", "lucinda@hellolucinda.com"),
  salesPage: env("STRATEGIST_SALES_URL", "http://secure.hellolucinda.com/substack-strategist"),
};

export type OfferKey = "profit_mastery" | "society" | "substack_day" | "creator_circle" | "starter_kit" | "codex";

export const offers: Record<OfferKey, { name: string; price: string; url: string; blurb: string }> = {
  profit_mastery: {
    name: "Substack Profit Mastery",
    price: "Free masterclass",
    url: env("PROFIT_MASTERY_URL", "[PROFIT_MASTERY_URL]"),
    blurb:
      "You've discovered the foundation of a publication that's uniquely yours. Now discover how to turn your ideas, expertise and message into a publication that builds trust, attracts the right readers and creates natural pathways to clients and income.",
  },
  society: {
    name: "Substack Society",
    price: "$2,497",
    url: env("SUBSTACK_SOCIETY_URL", "[SUBSTACK_SOCIETY_URL]"),
    blurb:
      "You've discovered what your publication could become. Now let's build it, grow it and create a strategic pathway to revenue together, with three months of live guidance, feedback and support.",
  },
  substack_day: {
    name: "Substack Day",
    price: "$1,297",
    url: env("SUBSTACK_DAY_URL", "[SUBSTACK_DAY_URL]"),
    blurb:
      "You have the clarity. Let me do the building. In one Substack Day I set up your publication from your blueprint, so you can start writing.",
  },
  creator_circle: {
    name: "Affluent Creator Circle",
    price: "$47/month",
    url: env("CREATOR_CIRCLE_URL", "[CREATOR_CIRCLE_URL]"),
    blurb: "An ongoing membership with training, community and publishing resources.",
  },
  starter_kit: {
    name: "Holy Hot Substack Starter Kit",
    price: "Free",
    url: env("STARTER_KIT_URL", "[STARTER_KIT_URL]"),
    blurb: "A short beginner training on profile versus publication, your promise, pillars and first steps.",
  },
  codex: {
    name: "Magnetic Business Icon Codex",
    price: "$37",
    url: env("CODEX_URL", "https://lucindaraestudio.com/magnetic-business-icon-codex"),
    blurb: "Discover your brand identity, archetypes and premium positioning.",
  },
};

// Kartra tags applied when these in-app events happen (only if Kartra API keys are set).
export const kartraTags: Record<string, string> = {
  assessment_started: env("TAG_ASSESSMENT_STARTED", "Strategist - Started"),
  assessment_completed: env("TAG_ASSESSMENT_COMPLETED", "Strategist - Completed"),
  blueprint_downloaded: env("TAG_BLUEPRINT_DOWNLOADED", "Strategist - Blueprint Downloaded"),
  profit_mastery_clicked: env("TAG_PM_CLICKED", "Strategist - Clicked Profit Mastery"),
  society_clicked: env("TAG_SOCIETY_CLICKED", "Strategist - Clicked Society"),
  substack_day_clicked: env("TAG_SUBSTACK_DAY_CLICKED", "Strategist - Clicked Substack Day"),
  recommended_society: env("TAG_REC_SOCIETY", "Strategist - Recommended Society"),
  recommended_substack_day: env("TAG_REC_SUBSTACK_DAY", "Strategist - Recommended Substack Day"),
};

// Safety valve on AI usage per buyer per calendar month.
export const monthlyMessageLimit = Number(process.env.MONTHLY_MESSAGE_LIMIT || 400);
