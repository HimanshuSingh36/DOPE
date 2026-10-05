# DOPE — Develop Optimize Produce Expand

Production-ready agency site. **React + Vite + Tailwind + Framer Motion + React Router + AI**.

### Palette
| Token | Hex | Use |
|-------|-----|-----|
| `ink` | `#111318` | text / dark surfaces |
| `brand` | `#1D4ED8` | primary |
| `cream` | `#F7F7F5` | page bg |
| `paper` | `#FFFFFF` | cards |

### Logo
Vector at `public/logo.svg` (matches the attached image — `#1D4ED8` on transparent). Replace with your export anytime — just overwrite that file. It's used in the navbar (light) and hero/footer (inverted on dark).

### Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # → dist/
npm run preview
```

Deploy `dist/` to Vercel / Netlify / Cloudflare Pages — build `npm run build`, output `dist`.

### Routes
- `/` — full landing: Hero (parallax + tilt dashboard) → Trust marquee → Services (modal) → **AI Studio** → ROI calculator → Stats → Work (filter) → Process (sticky timeline) → Testimonials (draggable) → Pricing (monthly/annual toggle) → FAQ → Contact
- `/work/:slug` — case study (`lumen`, `vault`, `nord`, `aero`, `bloom`, `forge`): hero, results grid, challenge/solution, gallery, testimonial, sticky CTA + "More work"

Work cards on `/` link to `/work/:slug`. Case data lives in `src/data.js` — edit there.

### AI — Chat + Studio (no backend required)

**Mock mode (default):** works instantly, no key, no cost.
- Floating chat bubble (bottom-right) — streams answers about DOPE (pricing, services, cases) via `src/ai.js` mock knowledge base.
- **AI Studio** section on `/` with three tools: **Campaign Architect**, **Copy Lab**, and **Site Audit** — all deterministic, instant.

**Live LLM (optional):** for real streaming replies in the chat.
1. Copy `.env.example` → `.env`
2. Fill **one** of:
   - `VITE_ANTHROPIC_API_KEY` — Anthropic (`claude-sonnet-4-20250514`)
   - `VITE_OPENAI_API_KEY` — OpenAI (`gpt-4o-mini`)
3. Restart `npm run dev`

> ⚠️ `VITE_` vars are exposed in the browser. For production, proxy LLM calls through your server and keep keys server-side.

Logic lives in `src/ai.js` (`streamMockResponse` / `streamRealResponse` / `generateCampaigns` / `generateCopy` / `generateAudit`).

### Contact form
Works out of the box in **demo mode** (shows success, no email sent). To receive real emails — no backend needed:

1. Copy `.env.example` → `.env`
2. Fill **one** of:
   - `VITE_FORMSPREE_ID` — from https://formspree.io (create form → copy ID from URL)
   - `VITE_WEB3FORMS_KEY` — from https://web3forms.com (access key, free)
3. Restart `npm run dev`

The form validates (`name ≥2`, `email` regex, `message ≥10`) and shows sending / success / error states.

### Customising
- Case studies: `src/data.js` → `CASES`
- Pricing / services / AI copy: `src/App.jsx` and `src/ai.js`
- Email/phone: search `hello@dopemedia.in` in `src/App.jsx`

### Interactions (intentionally restrained)
Scroll progress bar, hide-on-scroll navbar, magnetic buttons, tilt cards, custom cursor (desktop), parallax orbs, marquee, count-up, filter + layout, sticky timeline, draggable carousel, pricing toggle, live ROI calculator, **streaming AI chat + AI Studio** — all `framer-motion`, no heavy libs.
