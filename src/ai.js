// ─── DOPE AI — mock intelligence + optional real LLM ───────────────
// No backend required. Works instantly in mock mode.
// To enable real AI, set VITE_ANTHROPIC_API_KEY (or VITE_OPENAI_API_KEY) in .env — see .env.example.

const MOCK_KNOWLEDGE = [
  {
    keys: ["price", "pricing", "cost", "plan", "package", "₹", "budget"],
    answer:
      "We have 3 plans — **Launch ₹49k/mo**, **Scale ₹1.2L/mo** (most popular), and **Expand custom**. All are month-to-month, no lock-in, and start with a free 7-day Growth Audit. Scale includes full-funnel + 8 creatives/mo + a dedicated strategist. Want me to recommend one for your budget?",
  },
  {
    keys: ["service", "what do you do", "offer", "develop", "optimize", "produce", "expand"],
    answer:
      "**DOPE = Develop · Optimize · Produce · Expand.**\n\n• **Develop** — brand, positioning & site\n• **Optimize** — paid, SEO & lifecycle (avg. −33% CAC)\n• **Produce** — video, UGC & design systems (3.1× thumb-stop)\n• **Expand** — new markets, partnerships & retention (avg. +41% LTV)\n\nPick one pillar or plug into the full system. I can sketch a plan for you — what’s your business?",
  },
  {
    keys: ["work", "case", "portfolio", "result", "example", "lumen", "vault", "aero", "nord", "bloom", "forge"],
    answer:
      "Some highlights:\n\n• **Lumen** (D2C) — +212% revenue in 90 days, 4.6× ROAS\n• **Vault** (Fintech) — 4.8★ App Store, 51% activation\n• **Aero** (SaaS) — 3.4× qualified pipeline\n• **Nord** — +94% organic revenue\n\nOpen any case at **Work → case page** for the full playbook. Which industry are you in?",
  },
  {
    keys: ["process", "how you work", "timeline", "how long", "steps"],
    answer:
      "Our 4-step system: **Discover** (7-day audit) → **Build** (sprint, week-1 wins) → **Launch** (daily tuning) → **Scale** (compound). Kickoff in 72h, first wins in week 1, full roadmap in 7 days. You get a weekly Loom + live dashboard — no black boxes.",
  },
  {
    keys: ["contact", "call", "meet", "talk", "book", "audit"],
    answer:
      "Book a **free 15-min strategy call** — we’ll audit one of your funnels live, no deck. Use the form at **#contact** or email **hello@dopemedia.in**. Avg. reply in 4h. Want me to pre-fill the form for you? Just tell me your name, company and goal.",
  },
  {
    keys: ["ai", "campaign", "copy", "ad", "idea", "generate"],
    answer:
      "Try the **AI Studio** below — it can generate campaign ideas, ad copy variants, and a site audit in seconds. Or tell me your product + goal right here and I’ll draft something now.",
  },
];

function mockAnswer(input) {
  const q = input.toLowerCase();
  for (const k of MOCK_KNOWLEDGE) if (k.keys.some(w => q.includes(w))) return k.answer;
  // fallback — helpful + routes to studio/form
  return (
    `Great question — here’s how I’d think about that:\n\n` +
    `For **"${input.slice(0, 80)}"** I'd recommend starting with a quick audit (funnel → creative → offer), then testing one paid channel + one organic loop for 2 weeks before scaling. That’s exactly how we got **+212% for Lumen** and **3.4× pipeline for Aero**.\n\n` +
    `Want me to generate a concrete plan? Tell me: **what you sell, who it’s for, and your monthly budget** — or hit **AI Studio → Campaign Architect** for a full draft.`
  );
}

// Streaming mock (char by char)
export async function* streamMockResponse(input) {
  const full = mockAnswer(input);
  let cur = "";
  for (const ch of full) {
    cur += ch;
    // speed up on spaces/newlines
    await new Promise(r => setTimeout(r, ch === " " || ch === "\n" ? 2 : 10 + Math.random() * 14));
    yield cur;
  }
}

// Optional real LLM — uses Anthropic or OpenAI if keys are set
// NOTE: calling LLM directly from the browser exposes your key. For production, proxy via your server.
// We support it for quick demos; the prompt instructs the model to be DOPE's assistant.
const SYSTEM_PROMPT = `You are DOPE AI — the helpful copilot for DOPE (Develop Optimize Produce Expand), a digital marketing agency.
Brand voice: crisp, confident, no fluff. Palette is ink #111318 / brand #1D4ED8 / cream #F7F7F5.
Services: Develop (brand & web), Optimize (paid/SEO/lifecycle), Produce (UGC/video/design), Expand (new markets/partnerships).
Pricing: Launch ₹49k/mo, Scale ₹1.2L/mo (most popular), Expand custom — month-to-month, free 7-day audit.
Cases: Lumen +212% revenue, Vault 4.8★, Nord +94% organic, Aero 3.4× pipeline, Bloom 8.2M views, Forge −38% CAC.
Answer concisely (under 140 words unless asked for more). Always end with a helpful next step (try AI Studio, open a case, or book at #contact). Never hallucinate prices.`;

export async function* streamRealResponse(input, history) {
  const anthropicKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

  // Prefer Anthropic if both are set
  if (anthropicKey) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 700,
        system: SYSTEM_PROMPT,
        messages: [...history.map(h => ({ role: h.role, content: h.content })), { role: "user", content: input }],
      }),
    });
    if (!res.ok) throw new Error(`Anthropic ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    // simulate streaming for consistent UX
    let cur = "";
    for (const ch of text) { cur += ch; await new Promise(r => setTimeout(r, 6)); yield cur; }
    return;
  }

  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${openaiKey}` },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...history.map(h => ({ role: h.role, content: h.content })), { role: "user", content: input }],
        temperature: 0.7,
        max_tokens: 600,
      }),
    });
    if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    let cur = "";
    for (const ch of text) { cur += ch; await new Promise(r => setTimeout(r, 6)); yield cur; }
    return;
  }

  // no key — fall back to mock
  yield* streamMockResponse(input);
}

// ─── AI Studio generators (deterministic + varied) ─────────────────

const CAMPAIGN_TEMPLATES = [
  { name: "Creator-Led Loop", channels: ["TikTok", "Reels", "YouTube Shorts"], angle: "40 creators/mo → 3 posts/day → comment-led community. Turn customers into creators.", kpi: "8.2M views / quarter" },
  { name: "Quiz → Offer Funnel", channels: ["Meta Ads", "Landing", "Klaviyo"], angle: "Quiz segments intent → personalized landing → checkout. Lifts CVR 1.9% → 4.1%.", kpi: "+212% revenue in 90d" },
  { name: "ABM Sniper", channels: ["LinkedIn Ads", "HubSpot", "Webflow"], angle: "300 target accounts → POV content → comparison-page SEO moat.", kpi: "−38% CAC" },
  { name: "Search Moat", channels: ["SEO", "Content", "Lifecycle"], angle: "Programmatic collections + buying guides + 12-email nurture. Own 40+ keywords.", kpi: "+94% organic" },
  { name: "Full-Funnel Engine", channels: ["Google", "LinkedIn", "Outbound"], angle: "Intent → enrichment → sequences → nurture. Sales knows who’s warm.", kpi: "3.4× pipeline" },
];

export function generateCampaigns({ business, goal }) {
  const seed = (business + goal).length;
  const picks = [0, 1, 2].map(i => CAMPAIGN_TEMPLATES[(seed + i * 3) % CAMPAIGN_TEMPLATES.length]);
  return picks.map((t, i) => ({
    ...t,
    title: `${t.name} for ${business || "your brand"}`,
    brief: i === 0
      ? `Primary bet for “${goal || "growth"}” — ship in 14 days, measure in 30.`
      : i === 1 ? `Compounding loop — builds moat while paid drives immediate pipeline.` : `Scale lever — expand once the first loop is profitable.`,
  }));
}

const COPY_TONES = {
  Bold: { h: ["Stop scrolling. Start scaling.", "Your competitor’s worst nightmare."], b: "We build funnels that convert and stories people share. 250+ brands scaled. 4.9★ on Clutch.", c: "Book your audit →" },
  Playful: { h: ["Growth shouldn’t feel like guesswork.", "Make your brand the main character."], b: "DOPE turns attention into revenue — no deck, no jargon, just a Loom and a plan.", c: "See the playbook" },
  Premium: { h: ["Develop. Optimize. Produce. Expand.", "Attention is the new currency."], b: "Strategy, performance & creative under one roof. One dashboard, one team, one goal: growth.", c: "Start a project" },
};

export function generateCopy({ product, tone = "Bold" }) {
  const t = COPY_TONES[tone] || COPY_TONES.Bold;
  const p = product || "your product";
  return [
    { label: "Headline A", text: t.h[0].replace("scaling", `scaling ${p}`) },
    { label: "Headline B", text: t.h[1] },
    { label: "Body", text: `${t.b} Built for ${p} — avg. +68% CVR, −33% CAC, 3.2× ROAS lift in 90 days.` },
    { label: "CTA", text: t.c },
    { label: "Hook (UGC)", text: `POV: you switched to ${p} and your ROAS went 1.6× → 4.6× in 30 days.` },
  ];
}

export function generateAudit({ urlOrDesc }) {
  const input = (urlOrDesc || "").toLowerCase();
  const has = (w) => input.includes(w);
  const seo = has("shop") || has("ecom") ? 62 : has("saas") || has("app") ? 58 : 64;
  const creative = has("ugc") || has("video") ? 72 : has("boring") ? 41 : 55;
  const funnel = has("leak") || has("drop") ? 48 : 61;
  const overall = Math.round((seo + creative + funnel) / 3);
  return {
    overall,
    scores: [
      { label: "SEO & Discoverability", score: seo, tip: seo < 60 ? "Programmatic collections + buying guides. Own 40+ commercial keywords (like Nord +94%)." : "Tighten internal linking + add UGC reviews at scale." },
      { label: "Creative & Thumb-stop", score: creative, tip: creative < 60 ? "Ship 40 creators/mo, 3 posts/day. Turn customers into creators (Bloom 8.2M views)." : "Double down on winners — produce 8 assets/mo in Scale." },
      { label: "Funnel & Conversion", score: funnel, tip: funnel < 60 ? "Quiz → landing → checkout. Lift CVR 1.9% → 4.1% (Lumen playbook)." : "Add lifecycle (12-email nurture) to lift LTV +41%." },
    ],
    verdict: overall >= 65 ? "Strong foundation — you’re one sprint from compounding." : overall >= 50 ? "Solid, but leaking value. Fix the lowest score first — fastest ROI." : "High leverage — a 14-day sprint could 2× one metric.",
  };
}
