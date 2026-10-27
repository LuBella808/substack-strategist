// The six discovery stages. Each has an opening form (quick choices plus a short answer),
// guidance for the strategist's follow-up questions, and the structured result it saves
// into the blueprint when the stage is complete.

export type OpeningField =
  | { id: string; kind: "choice"; label: string; options: string[]; multiple?: boolean }
  | { id: string; kind: "text"; label: string; placeholder?: string; optional?: boolean; long?: boolean };

export type StageDef = {
  n: number;
  title: string;
  kicker: string;
  intro: string;
  opening: OpeningField[];
  guidance: string;
  completion: { description: string; schema: Record<string, unknown> };
};

const str = { type: "string" } as const;
const strArr = { type: "array", items: { type: "string" } } as const;

export const stages: StageDef[] = [
  {
    n: 1,
    title: "Your Creative Identity",
    kicker: "Who you are and what you bring",
    intro:
      "Let's begin with you. Your experience, your gifts and the story only you can tell are the raw material of a publication people want to read.",
    opening: [
      {
        id: "role",
        kind: "choice",
        label: "Which describes you best right now?",
        multiple: true,
        options: ["Author", "Coach", "Consultant", "Artist or creative", "Healer or spiritual guide", "Educator", "Multipassionate entrepreneur"],
      },
      {
        id: "brand",
        kind: "choice",
        label: "Do you already have a brand or business?",
        options: ["Yes, an established business", "Yes, but it's new or shifting", "Not yet"],
      },
      {
        id: "about",
        kind: "text",
        long: true,
        label: "In a few sentences, what do you do, and what have you lived or learned that shapes your work?",
        placeholder: "I help... I've spent years... The thing people always come to me for is...",
      },
      {
        id: "codex",
        kind: "text",
        long: true,
        optional: true,
        label: "Completed the Magnetic Business Icon Codex? Paste your results here (optional).",
        placeholder: "Your archetype trinity, identity profile, aesthetic direction...",
      },
    ],
    guidance:
      "Understand their professional background, expertise, gifts, interests, lived experience and mission. Learn whether they have an existing brand. If they pasted Codex results, honor that identity and build on it rather than re-asking what it already answers. Ask about what people already come to them for, and the experiences that shaped their perspective.",
    completion: {
      description: "Save the creative identity once you understand who they are and what they bring.",
      schema: {
        type: "object",
        properties: {
          summary: { type: "string", description: "A warm 2-3 sentence portrait of who they are, in second person." },
          expertise: strArr,
          gifts: strArr,
          mission: str,
          roles: strArr,
        },
        required: ["summary", "expertise", "gifts", "mission", "roles"],
      },
    },
  },
  {
    n: 2,
    title: "Your Golden Thread",
    kicker: "The idea that connects it all",
    intro:
      "Most of the women I work with have more than one passion. We're going to find the thread that runs through all of them, so nothing meaningful gets left behind.",
    opening: [
      {
        id: "loves",
        kind: "text",
        long: true,
        label: "List the topics, passions and kinds of work you'd love your Substack to hold. Include the ones that feel unrelated.",
        placeholder: "Painting, business strategy, motherhood, faith, my garden...",
      },
      {
        id: "tension",
        kind: "choice",
        label: "How do you feel about bringing these together?",
        options: [
          "Excited, I just can't see how they connect",
          "Worried I'll look scattered",
          "I've been told to pick one and it doesn't feel right",
          "I already sense the connection",
        ],
      },
    ],
    guidance:
      "Help them identify the unifying idea connecting their interests, expertise, stories and message. Ask what each passion gives them or gives others, and what they'd talk about for hours. Look for a shared transformation, value or question beneath the topics. Never force them to abandon meaningful parts of their work. Offer two or three candidate threads as options and let them react before you finalize.",
    completion: {
      description: "Save the golden thread once they've confirmed a direction that feels true.",
      schema: {
        type: "object",
        properties: {
          thread: { type: "string", description: "The golden thread in one memorable sentence." },
          explanation: { type: "string", description: "2-3 sentences on how this thread connects their passions." },
          woven: { ...strArr, description: "The passions and topics this thread holds together." },
        },
        required: ["thread", "explanation", "woven"],
      },
    },
  },
  {
    n: 3,
    title: "Your Reader and Promise",
    kicker: "Who you're writing for and why they'll stay",
    intro:
      "A publication grows when the right reader feels it was written for her. Let's get specific about who that is and what you promise her.",
    opening: [
      {
        id: "reader",
        kind: "text",
        long: true,
        label: "Describe the person you most want to reach. What is she going through, or longing for?",
        placeholder: "She's a woman in her 40s who...",
      },
      {
        id: "value",
        kind: "choice",
        multiple: true,
        label: "What will readers mostly come to you for?",
        options: ["Practical how-to", "Inspiration and encouragement", "Stories and essays", "Insight and perspective", "Spiritual nourishment", "Behind the scenes of my work"],
      },
    ],
    guidance:
      "Explore who they most want to reach, that reader's problems, desires and aspirations, why someone would subscribe, what makes the user's perspective distinctive, and the transformation or value readers receive. When ready, draft two or three publication promise options and let them choose or combine before completing.",
    completion: {
      description: "Save the reader profile and publication promise once the user has chosen a promise.",
      schema: {
        type: "object",
        properties: {
          reader: {
            type: "object",
            properties: {
              profile: { type: "string", description: "A vivid paragraph describing the ideal reader." },
              desires: strArr,
              struggles: strArr,
              why_subscribe: str,
            },
            required: ["profile", "desires", "struggles", "why_subscribe"],
          },
          promise: { type: "string", description: "The publication promise, one or two sentences." },
          distinctive: { type: "string", description: "What makes their perspective distinctive." },
        },
        required: ["reader", "promise", "distinctive"],
      },
    },
  },
  {
    n: 4,
    title: "Naming and Positioning",
    kicker: "The name on the door",
    intro:
      "Now the fun part. We'll decide whether your publication carries your name, a distinctive brand, your business name or a book title, then explore names together.",
    opening: [
      {
        id: "approach",
        kind: "choice",
        label: "Which naming direction are you drawn to?",
        options: ["My personal name", "A distinctive publication name", "My existing business name", "A book title or signature concept", "I'm not sure yet"],
      },
      {
        id: "words",
        kind: "text",
        optional: true,
        label: "Any words, images or phrases you love, or names you've already considered?",
        placeholder: "Golden, hive, the studio, letters from...",
      },
    ],
    guidance:
      "Help them weigh personal name versus a brand name versus an existing business name versus a book or IP concept, based on their goals. Then generate 5 to 10 name possibilities, each with a subtitle. Present them using the show_options tool so they can pick favorites, then refine through conversation: combine, adjust, shorten. Never say a name, domain or Substack handle is available, since you have not checked; remind them to search Substack and domains before committing. Finish with a positioning statement and a profile display name and short bio.",
    completion: {
      description: "Save the chosen name, alternatives, positioning and profile once the user has picked a name.",
      schema: {
        type: "object",
        properties: {
          name: {
            type: "object",
            properties: {
              recommended: str,
              subtitle: str,
              naming_approach: { type: "string", description: "Personal name, brand name, business name, or IP concept." },
              why: { type: "string", description: "Why this name works for them, 1-2 sentences." },
            },
            required: ["recommended", "subtitle", "naming_approach", "why"],
          },
          alternatives: {
            type: "array",
            items: { type: "object", properties: { name: str, subtitle: str }, required: ["name", "subtitle"] },
          },
          positioning: { type: "string", description: "Positioning statement: who it's for, what it offers, how it's different." },
          profile: {
            type: "object",
            properties: {
              display_name: str,
              bio: { type: "string", description: "Substack profile bio, under 160 characters." },
            },
            required: ["display_name", "bio"],
          },
        },
        required: ["name", "alternatives", "positioning", "profile"],
      },
    },
  },
  {
    n: 5,
    title: "Pillars and Rhythm",
    kicker: "What you'll publish and how often",
    intro:
      "Pillars give your readers something to count on and give you something to write about every week. We'll shape three to five, then find a rhythm that fits your real life.",
    opening: [
      {
        id: "formats",
        kind: "choice",
        multiple: true,
        label: "Which formats feel natural to you?",
        options: ["Written posts", "Notes", "Audio or podcast", "Video", "Substack Lives", "Community threads"],
      },
      {
        id: "time",
        kind: "choice",
        label: "Realistically, how much time can you give your Substack each week?",
        options: ["1 to 2 hours", "3 to 5 hours", "6 to 10 hours", "More than 10 hours"],
      },
    ],
    guidance:
      "Identify three to five editorial pillars rooted in their golden thread and reader. Explain clearly that editorial pillars and Substack sections are different things, and do not recommend a separate section for every pillar; sections are worth it only when a series needs its own email list or home. Propose pillars and invite edits before finalizing. Recommend a realistic publishing rhythm based on their time, including how Notes fit. Also write ten article ideas spread across the pillars.",
    completion: {
      description: "Save pillars, rhythm and article ideas once the user is happy with the pillars.",
      schema: {
        type: "object",
        properties: {
          pillars: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: str,
                description: str,
                reader_value: str,
                themes: strArr,
                example_articles: strArr,
              },
              required: ["name", "description", "reader_value", "themes", "example_articles"],
            },
          },
          sections_advice: { type: "string", description: "Short advice on pillars versus Substack sections for them." },
          rhythm: {
            type: "object",
            properties: { cadence: str, weekly_plan: str, notes: { type: "string", description: "How Notes fit in." } },
            required: ["cadence", "weekly_plan", "notes"],
          },
          articles: {
            type: "array",
            description: "Exactly ten article ideas.",
            items: { type: "object", properties: { title: str, pillar: str, hook: str }, required: ["title", "pillar", "hook"] },
          },
        },
        required: ["pillars", "sections_advice", "rhythm", "articles"],
      },
    },
  },
  {
    n: 6,
    title: "Visibility and Income",
    kicker: "How your publication supports your business",
    intro:
      "Your publication can be the warmest front door your business has ever had. Let's connect it to what you want: clients, products, paid subscribers, book readers, or a mix.",
    opening: [
      {
        id: "goals",
        kind: "choice",
        multiple: true,
        label: "What do you want your Substack to create?",
        options: ["Clients for my services", "Product or course sales", "Paid subscriptions", "Book readers", "Speaking or collaborations", "I'm not sure yet"],
      },
      {
        id: "audience",
        kind: "choice",
        label: "Where are you starting from?",
        options: ["Starting from zero", "Small list or following (under 1,000)", "Growing audience (1,000 to 10,000)", "Large audience (10,000+)", "Already publishing on Substack"],
      },
      {
        id: "offers",
        kind: "text",
        long: true,
        optional: true,
        label: "What do you offer today, and at what price? (Skip if you don't have offers yet.)",
        placeholder: "1:1 coaching at..., a course at..., my book...",
      },
    ],
    guidance:
      "Discover their goals, existing offers and prices, current audience and email list, and desired outcomes. Then outline a preliminary trust-to-profit pathway from free reader to subscriber to buyer, matched to their offers. Be strategic and realistic, and never promise income or subscriber numbers. Also listen for how much support they want: ask whether they'd rather build it themselves, have guidance while they build, or have it built for them. Use that to choose recommended_offer: 'substack_day' if they want it done for them, 'society' if they want hands-on guided implementation and have or are ready to invest in a business, otherwise 'profit_mastery'.",
    completion: {
      description: "Save the monetization pathway and recommended next offer.",
      schema: {
        type: "object",
        properties: {
          monetization: {
            type: "object",
            properties: {
              goals: strArr,
              summary: { type: "string", description: "Preliminary monetization strategy, a short paragraph." },
              pathway: {
                type: "array",
                description: "Trust-to-profit steps, from discovery to client or buyer.",
                items: { type: "object", properties: { step: str, detail: str }, required: ["step", "detail"] },
              },
            },
            required: ["goals", "summary", "pathway"],
          },
          recommended_offer: { type: "string", enum: ["profit_mastery", "society", "substack_day"] },
        },
        required: ["monetization", "recommended_offer"],
      },
    },
  },
];

// Written after stage 6, using everything gathered.
export const composeSchema = {
  type: "object",
  properties: {
    about_page: { type: "string", description: "A full draft About page in their voice, 250-400 words, with short paragraphs separated by blank lines." },
    welcome_post: {
      type: "object",
      properties: { title: str, subtitle: str, outline: { ...strArr, description: "5-7 outline points for the first post." } },
      required: ["title", "subtitle", "outline"],
    },
    roadmap: {
      type: "array",
      description: "A realistic 30-day roadmap in four weeks.",
      items: { type: "object", properties: { week: str, focus: str, actions: strArr }, required: ["week", "focus", "actions"] },
    },
    growth: { ...strArr, description: "5-7 initial subscriber growth ideas suited to their audience and starting point." },
    next_steps: { ...strArr, description: "3-5 recommended next steps, most important first." },
  },
  required: ["about_page", "welcome_post", "roadmap", "growth", "next_steps"],
};
