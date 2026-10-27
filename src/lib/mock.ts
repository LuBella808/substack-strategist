// Example responses used only when no ANTHROPIC_API_KEY is set, so the app can be
// clicked through locally. The persona is fictional sample data.

type Block = Record<string, unknown>;
const t = (text: string): Block => ({ type: "text", text });
const tool = (name: string, input: unknown): Block => ({ type: "tool_use", id: `mock_${name}_${Math.random().toString(36).slice(2, 8)}`, name, input });

const followUps: Record<number, Block[]> = {
  1: [t("I love that people already come to you for calm in the middle of chaos. That's a gift. When someone finishes a session with you, what do they usually say changed for them?")],
  2: [
    t("I'm hearing three threads underneath everything you listed. Which of these feels closest to the truth?"),
    tool("show_options", { question: "Which thread feels truest?", options: ["Creating a life that feels sacred", "Making beauty out of hard seasons", "Trusting your own inner knowing"] }),
  ],
  3: [
    t("Here are three ways your publication could make its promise. Pick one, or tell me what to blend."),
    tool("show_options", {
      question: "Choose your promise",
      options: ["Weekly letters to help you make beauty out of hard seasons", "Gentle, practical wisdom for women rebuilding their lives", "Art, faith and courage for your next chapter"],
    }),
  ],
  4: [
    t("Here are some names to react to. Which ones make you lean in?"),
    tool("show_options", {
      question: "Your favorite names",
      allow_multiple: true,
      options: ["The Golden Mend", "Letters from the Kiln", "Beauty in the Breaking", "Maya Ellison", "The Mending Room", "Kintsugi Hours"],
    }),
  ],
  5: [t("Your three or four hours a week is plenty for one beautiful weekly letter plus a few Notes. Before I finalize your pillars, is there any topic you'd be sad to leave out?")],
  6: [t("You'd love clients for your retreats and a paid tier later. Would you rather build this yourself with a plan, have hands-on guidance while you build, or have it built for you?")],
};

const results: Record<number, unknown> = {
  1: {
    summary: "You're a ceramic artist and grief-informed coach who helps women find their footing after loss. People come to you for calm, beauty and permission to slow down.",
    expertise: ["Grief-informed coaching", "Ceramics and kintsugi", "Retreat hosting"],
    gifts: ["Holding space", "Turning pain into beauty", "Gentle, honest writing"],
    mission: "Help women rebuild a life that feels beautiful again after a hard season.",
    roles: ["Coach", "Artist or creative"],
  },
  2: {
    thread: "Beauty can be made from the broken places.",
    explanation: "Your art, your coaching and your own story all point to the same truth: what breaks can be mended into something more beautiful. That thread lets you write about clay, grief, faith and courage in one voice.",
    woven: ["Ceramics", "Grief coaching", "Faith", "Motherhood", "Retreats"],
  },
  3: {
    reader: {
      profile: "She's in her 40s or 50s, a few years past a loss or a life that fell apart. She's functioning again, and she wants more than functioning. She loves beautiful things and suspects her creativity is part of her healing.",
      desires: ["To feel like herself again", "A gentle creative practice", "Permission to rest"],
      struggles: ["Feeling stuck between grief and a new chapter", "Advice that feels clinical or rushed"],
      why_subscribe: "Every week she gets a letter that feels like sitting in a sunlit studio with a friend who understands.",
    },
    promise: "Weekly letters to help you make beauty out of hard seasons.",
    distinctive: "You speak about grief through the language of clay and kintsugi, which makes healing feel tangible and hopeful.",
  },
  4: {
    name: { recommended: "The Golden Mend", subtitle: "Letters on making beauty out of hard seasons", naming_approach: "Distinctive publication name", why: "It carries your kintsugi imagery and your promise in three words, with room to grow beyond any one offer." },
    alternatives: [
      { name: "Letters from the Kiln", subtitle: "Art, grief and the slow work of becoming" },
      { name: "The Mending Room", subtitle: "Where hard seasons become beautiful" },
      { name: "Beauty in the Breaking", subtitle: "Weekly courage for your next chapter" },
    ],
    positioning: "The Golden Mend is a weekly publication for women rebuilding after loss, blending art, faith and gentle coaching so healing feels beautiful and possible.",
    profile: { display_name: "Maya Ellison", bio: "Ceramic artist and grief coach. I write about making beauty out of hard seasons." },
  },
  5: {
    pillars: [
      { name: "From the Studio", description: "Process stories from the wheel and the kiln.", reader_value: "A calm, beautiful window into creative practice.", themes: ["Kintsugi lessons", "Glaze experiments"], example_articles: ["What a cracked bowl taught me about patience"] },
      { name: "Mending Notes", description: "Gentle coaching for women in a hard season.", reader_value: "Practical comfort and small next steps.", themes: ["Rest", "Rebuilding routines"], example_articles: ["Three questions for the morning after a hard day"] },
      { name: "Sacred Ordinary", description: "Faith, motherhood and noticing beauty.", reader_value: "Encouragement and perspective.", themes: ["Prayer", "Seasons"], example_articles: ["The prayer I keep by the sink"] },
    ],
    sections_advice: "Keep all three pillars inside one main newsletter for now. A separate section only makes sense later, for example a retreat waitlist series.",
    rhythm: { cadence: "One letter every Thursday", weekly_plan: "Draft Monday, polish Wednesday, publish Thursday morning. Rotate pillars week to week.", notes: "Post three Notes a week: a studio photo, a quote from your letter and one question for readers." },
    articles: Array.from({ length: 10 }, (_, i) => ({ title: ["What a cracked bowl taught me about patience", "The morning after a hard day", "Why I started painting gold into the cracks", "Rest is a creative act", "Letters to the woman I was", "The prayer I keep by the sink", "How to begin again when you're tired", "My studio rules for hard seasons", "What grief and glaze have in common", "An invitation to slow down with me"][i], pillar: ["From the Studio", "Mending Notes", "Sacred Ordinary"][i % 3], hook: "A personal story that ends with one gentle practice." })),
  },
  6: {
    monetization: {
      goals: ["Clients for my services", "Paid subscriptions"],
      summary: "Start free to build trust, invite your most engaged readers to your retreat waitlist, then open a paid tier with a monthly studio session once you have steady readers.",
      pathway: [
        { step: "Discover", detail: "Notes and collaborations bring new readers to your letters." },
        { step: "Subscribe", detail: "Your welcome post makes the promise and invites replies." },
        { step: "Trust", detail: "Weekly letters and studio stories build a relationship." },
        { step: "Buy", detail: "Retreat invitations go to readers first, with a waitlist." },
      ],
    },
    recommended_offer: "society",
  },
};

export function mockStageTurn(n: number, userTurns: number): Block[] {
  if (userTurns <= 1) return followUps[n];
  return [t("Beautiful. I've saved this to your blueprint. Here's what we discovered together."), tool("complete_stage", results[n])];
}

export function mockCompose() {
  return {
    about_page:
      "Hi, I'm Maya.\n\nA few years ago my life broke open. I found my way back at the pottery wheel, one cracked bowl at a time.\n\nThe Golden Mend is a weekly letter for women rebuilding after a hard season. Every Thursday I share stories from my studio, gentle coaching and the small practices that helped me feel like myself again.\n\nIf you're tired of advice that rushes your healing, you're in the right place. Subscribe and I'll meet you here each week.",
    welcome_post: { title: "Welcome to The Golden Mend", subtitle: "Why I paint gold into the cracks", outline: ["The bowl that broke", "What kintsugi taught me", "Who this letter is for", "What to expect each Thursday", "An invitation to reply"] },
    roadmap: [
      { week: "Week 1", focus: "Set up your home", actions: ["Search your name on Substack", "Create your publication and About page", "Write your welcome post"] },
      { week: "Week 2", focus: "Open the door", actions: ["Publish your welcome post", "Post three Notes", "Invite 20 friends personally"] },
      { week: "Week 3", focus: "Find your rhythm", actions: ["Publish your first pillar letter", "Restack two writers you admire"] },
      { week: "Week 4", focus: "Grow together", actions: ["Publish letter two", "Reach out to one collaborator", "Mention your retreat waitlist"] },
    ],
    growth: ["Import your existing email list", "Ask three aligned writers about recommendations", "Share studio photos as Notes", "Invite retreat alumni personally"],
    next_steps: ["Search your chosen name on Substack", "Write your welcome post this week", "Watch Substack Profit Mastery"],
  };
}

export function mockSession(q: string) {
  return `Example reply (add your Anthropic API key to turn on the real strategist). You asked: "${q.slice(0, 120)}". Here I'd give you one clear recommendation and a next step based on your blueprint.`;
}
