import { useEffect, useState, useRef } from "react";
import { Routes, Route, Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform, useInView, useSpring } from "framer-motion";
import {
  ArrowUpRight, ArrowRight, Menu, X, Sparkles, TrendingUp, Layers, Rocket,
  Search, Megaphone, Palette, BarChart3, Mail, Phone, MapPin, Check, Star,
  Play, Quote, ChevronDown, Globe, Zap, Target, Calculator, Users, DollarSign,
  Eye, ChevronLeft, ChevronRight, MousePointer2, ArrowLeft, ExternalLink,
  Bot, Wand2, FileText, Copy, RefreshCw, Send, Sparkle, Lightbulb, PenLine, ScanSearch,
  Sun, Moon
} from "lucide-react";
import { CASES } from "./data.js";
import { streamMockResponse, streamRealResponse, generateCampaigns, generateCopy, generateAudit } from "./ai.js";
import { useTheme } from "./useTheme.jsx";

// ─── config ───────────────────────────────────────────────────
const navLinks = [
  { label: "AI Studio", href: "/#ai-studio" },
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Pricing", href: "/#pricing" },
];

const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID;
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY;
const HAS_LLM_KEY = !!(import.meta.env.VITE_ANTHROPIC_API_KEY || import.meta.env.VITE_OPENAI_API_KEY);

function useCountUp(target, active, dur = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf, start;
    const step = (t) => {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      setVal(Math.round((1 - Math.pow(1 - p, 3)) * target));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, active, dur]);
  return val;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) setTimeout(() => document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" }), 80);
    else window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, hash]);
  return null;
}

// ─── micro-interactions ───────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
  return <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-[3px] bg-brand origin-left z-[60]" />;
}
function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) { setHidden(true); return; }
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    const onOver = (e) => setHovering(!!e.target.closest("a, button"));
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseover", onOver); };
  }, []);
  if (hidden) return null;
  return (
    <>
      <motion.div animate={{ x: pos.x - 4, y: pos.y - 4, scale: hovering ? 1.6 : 1 }} transition={{ type: "spring", stiffness: 600, damping: 28 }}
        className="fixed top-0 left-0 h-2 w-2 rounded-full bg-brand pointer-events-none z-[100] mix-blend-difference hidden lg:block" />
      <motion.div animate={{ x: pos.x - 16, y: pos.y - 16, scale: hovering ? 1.4 : 1 }} transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="fixed top-0 left-0 h-8 w-8 rounded-full border border-ink/20 pointer-events-none z-[100] hidden lg:block" />
    </>
  );
}
function MagneticButton({ children, className = "", href, to, onClick, variant = "primary", type = "button", disabled }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const handleMove = (e) => {
    const r = ref.current?.getBoundingClientRect(); if (!r) return;
    setPos({ x: ((e.clientX - (r.left + r.width / 2)) / r.width) * 10, y: ((e.clientY - (r.top + r.height / 2)) / r.height) * 8 });
  };
  const base = variant === "primary" ? "bg-brand text-white hover:bg-brandHover shadow-soft"
    : variant === "dark" ? "bg-ink text-white hover:bg-black"
      : variant === "ai" ? "bg-gradient-to-r from-brand to-violet-600 text-white shadow-soft hover:from-brandHover hover:to-violet-700"
        : "bg-paper border border-ink/10 hover:bg-cream text-ink";
  const cls = `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 font-semibold transition-[transform,background,box-shadow] duration-200 will-change-transform ${base} ${className} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`;
  const style = { transform: `translate(${pos.x}px, ${pos.y}px)` };
  if (to) return <Link ref={ref} to={to} onClick={onClick} onMouseMove={handleMove} onMouseLeave={() => setPos({ x: 0, y: 0 })} style={style} className={cls}>{children}</Link>;
  const El = href ? "a" : "button";
  return <El ref={ref} href={href} type={type} disabled={disabled} onClick={onClick} onMouseMove={handleMove} onMouseLeave={() => setPos({ x: 0, y: 0 })} style={style} className={cls}>{children}</El>;
}
function TiltCard({ children, className = "", intensity = 10 }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `perspective(900px) rotateY(${((e.clientX - r.left) / r.width - 0.5) * intensity}deg) rotateX(${ -((e.clientY - r.top) / r.height - 0.5) * intensity}deg)`;
  };
  const onLeave = () => { if (ref.current) ref.current.style.transform = "perspective(900px) rotateY(0) rotateX(0)"; };
  return <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className={`transition-transform duration-200 will-change-transform ${className}`} style={{ transformStyle: "preserve-3d" }}>{children}</div>;
}
function ThemeToggle({ variant = "pill" }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  if (variant === "icon")
    return (
      <button onClick={toggle} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`} title={isDark ? "Light mode" : "Dark mode"}
        className="h-10 w-10 grid place-items-center rounded-full bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-white hover:bg-zinc-50 dark:hover:bg-white/15 transition shadow-sm">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}><Sun className="h-[18px] w-[18px]" /></motion.span>
            : <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}><Moon className="h-[18px] w-[18px]" /></motion.span>}
        </AnimatePresence>
      </button>
    );
  return (
    <button onClick={toggle} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-white/15 bg-white dark:bg-white/10 backdrop-blur px-2 py-1.5 text-xs font-semibold shadow-sm hover:bg-zinc-50 dark:hover:bg-white/15 transition">
      <span className={`h-6 w-6 grid place-items-center rounded-full transition ${isDark ? "bg-white text-ink" : "bg-ink text-white"}`}>
        {isDark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
      </span>
      <span className="pr-1 text-zinc-700 dark:text-white hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

// ─── AI CHAT WIDGET (floating, site-wide) ─────────────────────
function AIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hey — I’m **DOPE AI** 👋\n\nAsk me anything: pricing, services, case studies, or tell me what you sell and I’ll draft a campaign on the spot.\n\nTry: *“we sell clean skincare, ₹2L/mo budget, want to scale”*." },
  ]);
  const listRef = useRef(null);
  const historyRef = useRef([]); // for real LLM

  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" }); }, [messages, streaming]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || streaming) return;
    setInput("");
    const nextHistory = [...historyRef.current, { role: "user", content: q }];
    historyRef.current = nextHistory;
    setMessages(m => [...m, { role: "user", content: q }, { role: "assistant", content: "" }]);
    setStreaming(true);
    try {
      const stream = HAS_LLM_KEY ? streamRealResponse(q, nextHistory.slice(0, -1)) : streamMockResponse(q);
      let full = "";
      for await (const chunk of stream) {
        full = chunk;
        setMessages(m => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: full };
          return copy;
        });
      }
      historyRef.current = [...nextHistory, { role: "assistant", content: full }];
    } catch (e) {
      setMessages(m => {
        const copy = [...m];
        copy[copy.length - 1] = { role: "assistant", content: `Something went wrong: ${e.message}. Try again or email hello@dopemedia.in` };
        return copy;
      });
    } finally { setStreaming(false); }
  };

  return (
    <>
      {/* floating button */}
      <motion.button
        onClick={() => setOpen(v => !v)}
        whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-5 z-[65] h-14 w-14 rounded-full bg-gradient-to-br from-brand to-violet-600 text-white shadow-[0_12px_40px_rgba(29,78,216,0.35)] grid place-items-center border border-white/20"
        aria-label="Open DOPE AI"
      >
        <AnimatePresence mode="wait">
          {open ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X className="h-6 w-6" /></motion.span>
            : <motion.span key="bot" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="relative"><Bot className="h-6 w-6" /><span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" /></motion.span>}
        </AnimatePresence>
      </motion.button>

      {/* panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
            className="fixed bottom-[84px] right-4 sm:right-5 z-[65] w-[min(380px,calc(100vw-20px))] max-h-[min(560px,calc(100vh-120px))] rounded-[1.5rem] bg-paper border border-ink/10 shadow-[0_20px_60px_rgba(17,19,24,0.18)] overflow-hidden flex flex-col"
          >
            <div className="px-4 py-3 flex items-center gap-3 border-b border-ink/5 bg-gradient-to-r from-ink to-zinc-800 text-white">
              <span className="h-9 w-9 grid place-items-center rounded-xl bg-gradient-to-br from-brand to-violet-600"><Bot className="h-5 w-5" /></span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold leading-none flex items-center gap-2">DOPE AI <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${HAS_LLM_KEY ? "bg-emerald-500 text-white" : "bg-white/15 text-white/80 border border-white/15"}`}>{HAS_LLM_KEY ? "● Live" : "● Mock"}</span></div>
                <div className="text-xs text-white/60">Answers about DOPE + drafts campaigns instantly</div>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 grid place-items-center rounded-full bg-white/10 hover:bg-white/15"><X className="h-4 w-4" /></button>
            </div>

            <div ref={listRef} className="flex-1 overflow-auto p-4 space-y-3 bg-cream/40">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-ink text-white rounded-br-md" : "bg-paper border border-ink/5 shadow-card rounded-bl-md"}`}>
                    {m.content || (streaming && i === messages.length - 1 ? <span className="inline-flex items-center gap-1 text-ink/40"><span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce" /><span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:120ms]" /><span className="h-1.5 w-1.5 rounded-full bg-brand animate-bounce [animation-delay:240ms]" /></span> : "")}
                  </div>
                </div>
              ))}
              {/* quick chips (only when not streaming and near start) */}
              {!streaming && messages.length <= 3 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Show pricing", "What can AI Studio do?", "Draft a campaign for my brand", "Tell me about Lumen"].map(chip => (
                    <button key={chip} onClick={() => send(chip)} className="rounded-full bg-paper border border-ink/10 px-3 py-1.5 text-xs font-semibold hover:bg-white hover:border-brand/20 hover:text-brand transition text-ink/70">
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={e => { e.preventDefault(); send(); }} className="p-3 border-t border-ink/5 bg-paper flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={streaming ? "Thinking…" : "Ask anything or describe your business…"}
                disabled={streaming}
                className="flex-1 rounded-full bg-cream border border-ink/10 px-4 py-2.5 text-sm placeholder:text-ink/40 focus:outline-none focus:border-brand/30 focus:bg-white disabled:opacity-60"
              />
              <button disabled={streaming || !input.trim()} className="h-10 w-10 shrink-0 grid place-items-center rounded-full bg-brand text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brandHover transition">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <div className="px-4 pb-2 text-[11px] text-ink/40 text-center">
              {HAS_LLM_KEY ? "Live AI — replies may vary." : "Mock mode — add VITE_ANTHROPIC_API_KEY in .env for live AI."} · <a href="#ai-studio" onClick={() => setOpen(false)} className="underline decoration-ink/20 hover:text-ink">Open AI Studio</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── AI STUDIO (section) ──────────────────────────────────────
function AIStudio() {
  const [tab, setTab] = useState("campaign"); // campaign | copy | audit
  // campaign
  const [biz, setBiz] = useState("D2C skincare");
  const [goal, setGoal] = useState("scale from ₹18L to ₹50L MRR in 90 days");
  const [campaigns, setCampaigns] = useState(() => generateCampaigns({ business: "D2C skincare", goal: "scale from ₹18L to ₹50L MRR in 90 days" }));
  // copy
  const [product, setProduct] = useState("Lumen — clean skincare that actually works");
  const [tone, setTone] = useState("Bold");
  const [copies, setCopies] = useState(() => generateCopy({ product: "Lumen — clean skincare that actually works", tone: "Bold" }));
  const [copiedIdx, setCopiedIdx] = useState(-1);
  // audit
  const [auditInput, setAuditInput] = useState("https://example.com — Shopify store, 1.9% CVR, CAC rising, SEO flat");
  const [audit, setAudit] = useState(() => generateAudit({ urlOrDesc: "https://example.com — Shopify store, 1.9% CVR, CAC rising, SEO flat" }));

  const doCampaign = () => setCampaigns(generateCampaigns({ business: biz, goal }));
  const doCopy = () => setCopies(generateCopy({ product, tone }));
  const doAudit = () => setAudit(generateAudit({ urlOrDesc: auditInput }));

  const copyText = async (idx, text) => {
    try { await navigator.clipboard.writeText(text); setCopiedIdx(idx); setTimeout(() => setCopiedIdx(-1), 1500); } catch { /* ignore */ }
  };

  const tabs = [
    { id: "campaign", label: "Campaign Architect", icon: Lightbulb, desc: "3 funnel ideas in one click" },
    { id: "copy", label: "Copy Lab", icon: PenLine, desc: "Headlines + hooks that ship" },
    { id: "audit", label: "Site Audit", icon: ScanSearch, desc: "Score + fixes in seconds" },
  ];

  return (
    <section id="ai-studio" className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="rounded-[2rem] bg-ink text-white overflow-hidden relative">
          <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-brand/25 blur-[70px]" />
          <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[70px]" />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

          <div className="relative p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold tracking-wide">
                  <span className="h-6 w-6 grid place-items-center rounded-full bg-gradient-to-br from-brand to-violet-600"><Wand2 className="h-3.5 w-3.5" /></span>
                  NEW — AI STUDIO
                  <span className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${HAS_LLM_KEY ? "bg-emerald-500 text-white" : "bg-white text-ink"}`}>{HAS_LLM_KEY ? "LIVE AI" : "MOCK · INSTANT"}</span>
                </div>
                <h2 className="mt-3 font-display font-bold tracking-tight text-[30px] sm:text-[42px] leading-[0.95]">
                  AI that <span className="bg-gradient-to-r from-[#60A5FA] to-violet-300 bg-clip-text text-transparent">actually ships.</span>
                </h2>
                <p className="mt-3 max-w-[60ch] text-white/60 text-[14px] sm:text-[15px] leading-relaxed">
                  No fluff. Generate campaign plans, ad copy, and audits in seconds — then hand off to DOPE to execute. Works instantly (mock); add an API key for live LLM.
                </p>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-xs">
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5">No backend</span>
                <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5">No signup</span>
                <span className="rounded-full bg-white text-ink px-3 py-1.5 font-bold flex items-center gap-1"><Sparkle className="h-3.5 w-3.5" /> Instant</span>
              </div>
            </div>

            {/* tabs */}
            <div className="mt-6 flex gap-2 overflow-auto pb-1 -mx-1 px-1">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`shrink-0 flex items-center gap-2.5 rounded-2xl border px-4 py-3 text-left transition ${tab === t.id ? "bg-paper text-ink border-paper shadow-soft" : "bg-white/10 text-white border-white/10 hover:bg-white/15"}`}>
                  <span className={`h-9 w-9 grid place-items-center rounded-xl ${tab === t.id ? "bg-ink text-white" : "bg-white/10"}`}><t.icon className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-bold leading-none">{t.label}</span><span className={`block text-xs ${tab === t.id ? "text-ink/60" : "text-white/60"}`}>{t.desc}</span></span>
                </button>
              ))}
            </div>

            {/* tab panels */}
            <div className="mt-6 rounded-[1.5rem] bg-paper text-ink p-5 sm:p-6 shadow-soft">
              <AnimatePresence mode="wait">
                {tab === "campaign" && (
                  <motion.div key="campaign" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <div className="grid lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-5 space-y-4">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2"><Lightbulb className="h-4 w-4 text-brand" /> Campaign Architect</h3>
                        <label className="block space-y-1.5"><span className="text-xs font-bold tracking-wide text-ink/60">WHAT DO YOU SELL?</span>
                          <input value={biz} onChange={e => setBiz(e.target.value)} placeholder="e.g. D2C skincare, B2B SaaS, wellness app" className="w-full rounded-xl bg-cream border border-ink/10 px-4 py-3 text-sm focus:outline-none focus:border-brand/30 focus:bg-white" />
                        </label>
                        <label className="block space-y-1.5"><span className="text-xs font-bold tracking-wide text-ink/60">GOAL (90 DAYS)</span>
                          <input value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. 3× pipeline, +50% organic, launch in US" className="w-full rounded-xl bg-cream border border-ink/10 px-4 py-3 text-sm focus:outline-none focus:border-brand/30 focus:bg-white" />
                        </label>
                        <div className="flex gap-2">
                          <MagneticButton variant="ai" onClick={doCampaign} className="flex-1 justify-center"><Wand2 className="h-4 w-4" /> Generate 3 ideas</MagneticButton>
                          <Link to="/#contact" className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-cream border border-ink/10 px-4 py-3 text-sm font-semibold hover:bg-white">We’ll run it <ArrowUpRight className="h-4 w-4" /></Link>
                        </div>
                        <p className="text-xs text-ink/50">Based on DOPE’s median lifts: +68% CVR, −33% CAC, 3.2× ROAS.</p>
                      </div>
                      <div className="lg:col-span-7 grid gap-3">
                        {campaigns.map((c, i) => (
                          <div key={c.name} className={`rounded-2xl border p-4 ${i === 0 ? "bg-ink text-white border-ink" : "bg-cream border-ink/5"}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="font-display font-bold leading-tight">{i + 1}. {c.title}</div>
                              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${i === 0 ? "bg-white text-ink" : "bg-brand text-white"}`}>{c.kpi}</span>
                            </div>
                            <div className="mt-1 text-sm leading-relaxed opacity-80">{c.brief}</div>
                            <div className="mt-2 text-xs leading-relaxed opacity-70">{c.angle}</div>
                            <div className="mt-3 flex flex-wrap gap-1.5">{c.channels.map(ch => (<span key={ch} className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${i === 0 ? "bg-white/10 border-white/15 text-white" : "bg-paper border-ink/10 text-ink/70"}`}>{ch}</span>))}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === "copy" && (
                  <motion.div key="copy" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <div className="grid lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-5 space-y-4">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2"><PenLine className="h-4 w-4 text-brand" /> Copy Lab</h3>
                        <label className="block space-y-1.5"><span className="text-xs font-bold tracking-wide text-ink/60">PRODUCT / OFFER</span>
                          <input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. Vault — fintech app for freelancers" className="w-full rounded-xl bg-cream border border-ink/10 px-4 py-3 text-sm focus:outline-none focus:border-brand/30 focus:bg-white" />
                        </label>
                        <div className="space-y-1.5"><span className="text-xs font-bold tracking-wide text-ink/60">TONE</span>
                          <div className="flex gap-2 flex-wrap">
                            {["Bold", "Playful", "Premium"].map(t => (
                              <button key={t} onClick={() => setTone(t)} className={`rounded-full px-4 py-2 text-sm font-semibold border transition ${tone === t ? "bg-ink text-white border-ink" : "bg-cream border-ink/10 text-ink/60 hover:bg-white hover:text-ink"}`}>{t}</button>
                            ))}
                          </div>
                        </div>
                        <MagneticButton variant="ai" onClick={doCopy} className="w-full justify-center"><Sparkles className="h-4 w-4" /> Generate 5 variants</MagneticButton>
                      </div>
                      <div className="lg:col-span-7 grid gap-2.5">
                        {copies.map((c, i) => (
                          <div key={c.label} className="rounded-2xl bg-cream border border-ink/5 p-4 flex gap-3 items-start">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold tracking-wide text-ink/40">{c.label.toUpperCase()}</div>
                              <div className="mt-1 text-sm leading-relaxed font-medium">{c.text}</div>
                            </div>
                            <button onClick={() => copyText(i, c.text)} className="shrink-0 h-9 w-9 grid place-items-center rounded-xl bg-paper border border-ink/10 hover:border-brand/20 hover:text-brand shadow-card">
                              {copiedIdx === i ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {tab === "audit" && (
                  <motion.div key="audit" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <div className="grid lg:grid-cols-12 gap-5">
                      <div className="lg:col-span-5 space-y-4">
                        <h3 className="font-display font-bold text-lg flex items-center gap-2"><ScanSearch className="h-4 w-4 text-brand" /> Site Audit</h3>
                        <label className="block space-y-1.5"><span className="text-xs font-bold tracking-wide text-ink/60">URL OR “WHAT’S THE SITE?”</span>
                          <textarea value={auditInput} onChange={e => setAuditInput(e.target.value)} rows={3} placeholder="Paste a URL or describe the site (stack, CVR, traffic, creative…)" className="w-full rounded-xl bg-cream border border-ink/10 px-4 py-3 text-sm focus:outline-none focus:border-brand/30 focus:bg-white resize-none" />
                        </label>
                        <MagneticButton variant="ai" onClick={doAudit} className="w-full justify-center"><ScanSearch className="h-4 w-4" /> Run audit</MagneticButton>
                        <div className={`rounded-xl border px-3 py-2.5 text-xs leading-relaxed ${audit.overall >= 65 ? "bg-emerald-50 border-emerald-200 text-emerald-900" : audit.overall >= 50 ? "bg-amber-50 border-amber-200 text-amber-900" : "bg-red-50 border-red-200 text-red-900"}`}>
                          <b>Verdict:</b> {audit.verdict}
                        </div>
                      </div>
                      <div className="lg:col-span-7 space-y-3">
                        <div className="rounded-2xl bg-ink text-white p-5 flex items-center gap-4">
                          <div className="h-16 w-16 rounded-2xl bg-white/10 border border-white/10 grid place-items-center">
                            <span className="font-display font-bold text-2xl">{audit.overall}</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold">Overall score</div>
                            <div className="text-xs text-white/60">Out of 100 — higher is better. Fix the lowest bar first.</div>
                            <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-brand to-emerald-400 rounded-full" style={{ width: `${audit.overall}%` }} /></div>
                          </div>
                        </div>
                        {audit.scores.map(s => (
                          <div key={s.label} className="rounded-2xl bg-cream border border-ink/5 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold">{s.label}</span>
                              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.score >= 65 ? "bg-emerald-500 text-white" : s.score >= 50 ? "bg-amber-500 text-white" : "bg-red-500 text-white"}`}>{s.score}/100</span>
                            </div>
                            <div className="mt-2 h-1.5 rounded-full bg-ink/10 overflow-hidden"><div className="h-full bg-ink rounded-full" style={{ width: `${s.score}%` }} /></div>
                            <p className="mt-2 text-xs leading-relaxed text-ink/60"><b className="text-ink">Fix:</b> {s.tip}</p>
                          </div>
                        ))}
                        <Link to="/#contact" className="inline-flex items-center gap-2 rounded-full bg-ink text-white px-5 py-2.5 text-sm font-semibold hover:bg-black transition">Get the full audit (free) <ArrowUpRight className="h-4 w-4" /></Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
              <span>AI Studio runs fully in the browser. No data leaves your device unless you add a live LLM key.</span>
              <Link to="/#contact" className="inline-flex items-center gap-1.5 rounded-full bg-white text-ink px-4 py-2 font-semibold hover:bg-cream transition">Have DOPE run it for you <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 10);
      setHidden(y > lastY.current && y > 120 && !open);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  return (
    <motion.header animate={{ y: hidden ? -100 : 0 }} transition={{ duration: 0.3 }} className={`fixed inset-x-0 z-50 ${scrolled ? "top-3" : "top-4"}`}>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className={`flex items-center justify-between rounded-full border px-2 sm:px-3 py-2 backdrop-blur-xl transition-colors ${scrolled ? "bg-white dark:bg-[#161a25]/90 border-zinc-200 dark:border-white/10 shadow-[0_8px_30px_rgba(17,19,24,0.08)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)]" : "bg-white/95 dark:bg-[#161a25]/80 border-zinc-200/80 dark:border-white/10 shadow-soft dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"}`}>
          <Link to="/" className="flex items-center gap-2.5 pl-1">
            <img src="/logo.svg" alt="DOPE" className="h-7 sm:h-8 w-auto hidden sm:block" />
            <span className="sm:hidden inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white font-display font-bold text-[11px]">DOPE</span>
            <span className="sm:hidden font-display font-bold tracking-tight text-ink dark:text-white">DOPE</span>
            <span className="hidden lg:block text-[11px] tracking-[0.16em] font-semibold text-zinc-500 dark:text-white/55 ml-1">DEVELOP · OPTIMIZE · PRODUCE · EXPAND</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => (
              <Link key={l.label} to={l.href} className="px-4 py-2 rounded-full text-sm font-semibold text-zinc-600 dark:text-white/70 hover:text-ink dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition">{l.label}</Link>
            ))}
          </nav>
          <div className="hidden lg:flex items-center gap-2">
            <ThemeToggle />
            <MagneticButton to="/#ai-studio" variant="ai" className="hidden xl:inline-flex px-3 py-2 text-xs"><Bot className="h-3.5 w-3.5" /> Try AI</MagneticButton>
            <MagneticButton to="/#contact" variant="dark" className="px-5 py-2.5 text-sm">Start a project <ArrowUpRight className="h-4 w-4" /></MagneticButton>
          </div>
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle variant="icon" />
            <button onClick={() => setOpen(v => !v)} aria-label="Menu" className="h-10 w-10 grid place-items-center rounded-full bg-ink dark:bg-white text-white dark:text-ink">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="lg:hidden mt-3 rounded-[1.75rem] border border-zinc-200 dark:border-white/10 bg-white dark:bg-[#161a25] p-4 shadow-soft">
              <div className="flex flex-col">
                <Link onClick={() => setOpen(false)} to="/#ai-studio" className="py-3.5 text-[15px] font-semibold border-b border-zinc-200 dark:border-white/10 text-ink dark:text-white flex items-center gap-2"><span className="h-7 w-7 grid place-items-center rounded-full bg-gradient-to-br from-brand to-violet-600 text-white"><Bot className="h-3.5 w-3.5" /></span> AI Studio <span className="ml-auto rounded-full bg-brand text-white px-2 py-0.5 text-[10px]">NEW</span></Link>
                {navLinks.filter(l => l.label !== "AI Studio").map(l => (
                  <Link key={l.label} onClick={() => setOpen(false)} to={l.href} className="py-3.5 text-[15px] font-medium border-b border-zinc-200 dark:border-white/10 last:border-0 text-ink dark:text-white flex items-center justify-between">{l.label} <ArrowUpRight className="h-4 w-4 text-zinc-400 dark:text-white/40" /></Link>
                ))}
                <Link onClick={() => setOpen(false)} to="/#contact" className="mt-4 inline-flex justify-center items-center gap-2 rounded-full bg-brand text-white py-3.5 font-semibold">Start a project <ArrowRight className="h-4 w-4" /></Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}

// ─── HERO ─────────────────────────────────────────────────────
function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const ySlow = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const yFast = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  return (
    <section ref={ref} className="relative overflow-hidden pt-28 sm:pt-32 pb-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-cream" />
        <motion.div style={{ y: ySlow }} className="absolute -top-28 -right-24 h-[640px] w-[640px] rounded-full bg-brand/10 blur-[90px]" />
        <motion.div style={{ y: yFast }} className="absolute top-40 -left-40 h-[560px] w-[560px] rounded-full bg-ink/[0.035] blur-[70px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(17,19,24,0.055)_1px,transparent_0)] bg-[size:22px_22px]" />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")` }} />
      </div>
      <motion.div style={{ opacity }} className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="inline-flex flex-wrap items-center gap-2 rounded-full border border-ink/10 bg-paper px-3 py-1.5 text-xs font-medium shadow-card">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Available for new projects — Q4 2026</span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand to-violet-600 text-white px-2.5 py-1 text-[11px] font-bold"><Bot className="h-3 w-3" /> AI Studio live</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.07 }}
              className="mt-5 font-display font-bold tracking-tight leading-[0.88] text-[42px] sm:text-[58px] lg:text-[74px]">
              <span className="block text-ink">We make brands</span>
              <span className="block bg-gradient-to-r from-brand via-[#3B82F6] to-brand bg-clip-text text-transparent">impossible</span>
              <span className="block bg-gradient-to-r from-brand to-[#1E40AF] bg-clip-text text-transparent">to ignore.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
              className="mt-5 max-w-[56ch] text-[16px] sm:text-[18px] leading-relaxed text-ink/60">
              <b className="text-ink font-semibold">DOPE — Develop · Optimize · Produce · Expand.</b> Strategy, performance & creative under one roof. Now with an AI copilot that drafts campaigns while you sleep.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="mt-7 flex flex-wrap items-center gap-3">
              <MagneticButton to="/#contact">Book a strategy call <ArrowUpRight className="h-4 w-4" /></MagneticButton>
              <MagneticButton to="/#ai-studio" variant="ai"><Wand2 className="h-4 w-4" /> Try AI Studio</MagneticButton>
              <MagneticButton to="/#work" variant="ghost"><Play className="h-4 w-4" /> See our work</MagneticButton>
            </motion.div>
            <div className="mt-3 flex items-center gap-2 text-xs text-ink/50"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> No pitch deck. No retainer trap. Just results.</div>
            <div className="mt-8 grid grid-cols-3 gap-3 max-w-[580px]">
              {[{ k: "250+", l: "Brands scaled", sub: "D2C → SaaS → B2B" }, { k: "4.9/5", l: "Avg. rating", sub: "Clutch & Google" }, { k: "3.2×", l: "Avg. ROAS lift", sub: "First 90 days" }].map(s => (
                <motion.div key={s.k} whileHover={{ y: -4 }} className="rounded-2xl bg-paper border border-ink/5 p-4 shadow-card">
                  <div className="font-display font-bold text-xl leading-none">{s.k}</div>
                  <div className="text-xs font-semibold mt-1">{s.l}</div>
                  <div className="text-[11px] text-ink/50">{s.sub}</div>
                </motion.div>
              ))}
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.7 }} className="lg:col-span-5">
            <TiltCard>
              <div className="relative rounded-[2rem] bg-ink p-6 sm:p-7 overflow-hidden shadow-soft">
                <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
                <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)`, backgroundSize: "22px 22px" }} />
                <div className="relative">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <img src="/logo.svg" alt="DOPE" className="h-10 sm:h-12 w-auto" style={{ filter: "brightness(0) invert(1) drop-shadow(0 0 12px rgba(59,130,246,0.35))" }} />
                      <div className="mt-2 text-[10px] tracking-[0.22em] font-semibold text-white/55">DEVELOP · OPTIMIZE · PRODUCE · EXPAND</div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/80"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Live</span>
                  </div>
                  <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 border border-white/10 backdrop-blur p-3">
                    <img src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&q=80&auto=format&fit=crop" alt="" className="h-9 w-9 rounded-full object-cover" />
                    <div className="text-sm text-white/90 leading-tight">“DOPE doubled our pipeline in 60 days.”<div className="text-xs text-white/50">— Aarav, Lumen</div></div>
                    <span className="ml-auto hidden sm:grid h-8 w-8 place-items-center rounded-full bg-white text-ink"><Play className="h-4 w-4 ml-0.5" /></span>
                  </div>
                  <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }} className="mt-5 rounded-2xl bg-paper p-4 flex items-center gap-3 shadow-card">
                    <span className="h-10 w-10 grid place-items-center rounded-xl bg-emerald-500 text-white"><TrendingUp className="h-5 w-5" /></span>
                    <div className="flex-1"><div className="text-xs text-ink/60">Revenue growth</div><div className="font-semibold leading-none">+182% in 90 days</div></div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">▲ 24%</span>
                  </motion.div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-4">
                      <div className="text-xs text-white/60">Leads this week</div><div className="text-2xl font-bold text-white mt-1">1,284</div>
                      <div className="mt-2 h-1.5 rounded-full bg-white/15 overflow-hidden"><motion.div initial={{ width: 0 }} whileInView={{ width: "72%" }} transition={{ duration: 1, delay: 0.6 }} className="h-full bg-white rounded-full" /></div>
                    </div>
                    <div className="rounded-2xl bg-brand p-4 text-white relative overflow-hidden">
                      <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/15 blur-xl" />
                      <div className="text-xs text-white/80">ROAS</div><div className="text-2xl font-bold mt-1">4.8×</div><div className="text-xs text-white/80 mt-1">vs 1.5× before</div>
                    </div>
                  </div>
                  <Link to="/#ai-studio" className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-violet-600 text-white px-3 py-2.5 text-xs font-bold hover:from-brandHover hover:to-violet-700 transition">
                    <Bot className="h-4 w-4" /> Ask DOPE AI to draft your campaign — instant
                    <ArrowUpRight className="ml-auto h-4 w-4 opacity-70" />
                  </Link>
                </div>
              </div>
            </TiltCard>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-ink/50"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> 12 spots left this quarter — avg. reply in 4h</div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Marquee({ items, reverse = false }) {
  return (
    <div className="relative overflow-hidden">
      <motion.div animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }} transition={{ duration: 22, repeat: Infinity, ease: "linear" }} className="flex w-max gap-3">
        {[...items, ...items].map((it, i) => (
          <span key={i} className="shrink-0 rounded-full border border-ink/10 bg-paper px-5 py-2.5 text-sm font-semibold text-ink/70 shadow-card whitespace-nowrap">{it}</span>
        ))}
      </motion.div>
    </div>
  );
}
function TrustMarquee() {
  const row1 = ["Stripe", "Notion", "Figma", "Linear", "Vercel", "Shopify", "Webflow", "HubSpot", "Framer", "Perplexity"];
  const row2 = ["4.9★ on Clutch", "Top 10 — Agency Awards", "Google Partner", "Meta Partner", "4.9★ on Google", "50+ five-star reviews"];
  return (
    <section className="py-6">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="rounded-[1.75rem] bg-paper border border-ink/5 p-5 shadow-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
            <div className="text-xs font-bold tracking-[0.14em] text-ink/35">TRUSTED BY GROWTH TEAMS AT</div>
            <div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-500" />)}<span className="ml-2 text-xs font-bold text-ink">4.9/5 — Clutch & Google</span></div>
          </div>
          <Marquee items={row1} /><div className="h-3" /><Marquee items={row2} reverse />
        </div>
      </div>
    </section>
  );
}

// ─── SERVICES ─────────────────────────────────────────────────
function Services() {
  const [active, setActive] = useState(null);
  const items = [
    { icon: Layers, title: "Develop", kicker: "Brand & web", desc: "Positioning, identity & site that converts on first scroll.", bullets: ["Brand strategy & identity", "Web & landing pages", "Messaging & content pillars"], color: "bg-brand", accent: "from-brand to-[#3B82F6]", stats: "Avg. +68% CVR post-launch" },
    { icon: Target, title: "Optimize", kicker: "Performance", desc: "Every dollar tuned. Paid, SEO & lifecycle — compounding.", bullets: ["Paid social & search", "CRO & funnel analytics", "SEO & lifecycle"], color: "bg-ink", accent: "from-ink to-zinc-700", stats: "Avg. −33% CAC" },
    { icon: Palette, title: "Produce", kicker: "Creative", desc: "Creative that stops the scroll. Built for the feed.", bullets: ["Video, UGC & motion", "Design systems", "Campaign production"], color: "bg-violet-600", accent: "from-violet-600 to-fuchsia-500", stats: "Avg. 3.1× thumb-stop" },
    { icon: Rocket, title: "Expand", kicker: "Scale", desc: "Scale without chaos. New markets, partners & retention.", bullets: ["Market expansion", "Partnerships & affiliates", "Retention & community"], color: "bg-emerald-600", accent: "from-emerald-600 to-teal-500", stats: "Avg. +41% LTV" },
  ];
  return (
    <section id="services" className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 text-brand px-3 py-1.5 text-xs font-bold tracking-wide"><Zap className="h-3.5 w-3.5" /> WHAT WE DO</div>
            <h2 className="mt-3 font-display font-bold tracking-tight text-[32px] sm:text-[44px] leading-none">One agency. <span className="text-brand">Full stack growth.</span></h2>
            <p className="mt-3 max-w-[60ch] text-ink/60">Pick one pillar or plug into the DOPE system. Every engagement starts with a 7-day Growth Audit — free, no deck. Or let AI draft it in seconds.</p>
          </div>
          <div className="hidden sm:flex gap-2">
            <MagneticButton to="/#ai-studio" variant="ai"><Wand2 className="h-4 w-4" /> Try AI Studio</MagneticButton>
            <MagneticButton to="/#contact" variant="dark">Explore services <ArrowRight className="h-4 w-4" /></MagneticButton>
          </div>
        </div>
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it, idx) => (
            <motion.button key={it.title} onClick={() => setActive(it)}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.06 }}
              whileHover={{ y: -6 }} className="group text-left rounded-[1.75rem] bg-paper border border-ink/5 p-6 shadow-card hover:shadow-soft transition text-ink overflow-hidden relative">
              <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${it.accent} opacity-0 group-hover:opacity-100 transition`} />
              <div className="flex items-center gap-2">
                <span className={`h-11 w-11 grid place-items-center rounded-2xl text-white ${it.color} group-hover:scale-105 transition`}><it.icon className="h-5 w-5" /></span>
                <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-cream border border-ink/5 px-2.5 py-1 text-[11px] font-bold text-ink/60">{it.kicker} <ArrowUpRight className="h-3 w-3 opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" /></span>
              </div>
              <h3 className="mt-4 font-display font-bold text-xl">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{it.desc}</p>
              <ul className="mt-4 space-y-2">
                {it.bullets.map(b => (<li key={b} className="flex items-center gap-2 text-sm"><span className="h-6 w-6 grid place-items-center rounded-full bg-cream border border-ink/5 shrink-0"><Check className="h-3.5 w-3.5" /></span>{b}</li>))}
              </ul>
              <div className="mt-4 inline-flex rounded-full bg-brand/10 text-brand px-3 py-1 text-xs font-bold">{it.stats}</div>
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">Explore <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" /></div>
            </motion.button>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] grid place-items-center p-4 bg-ink/60 backdrop-blur-sm" onClick={() => setActive(null)}>
            <motion.div initial={{ scale: 0.96, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 12 }} onClick={e => e.stopPropagation()} className="w-full max-w-xl rounded-[1.75rem] bg-paper p-6 sm:p-7 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <span className={`h-12 w-12 grid place-items-center rounded-2xl text-white ${active.color}`}><active.icon className="h-6 w-6" /></span>
                <button onClick={() => setActive(null)} className="h-9 w-9 grid place-items-center rounded-full bg-cream border border-ink/5"><X className="h-4 w-4" /></button>
              </div>
              <h3 className="mt-4 font-display font-bold text-2xl">{active.title} — {active.kicker}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{active.desc} Typical sprint is 2–3 weeks with daily async updates and a live dashboard.</p>
              <ul className="mt-4 grid gap-2">{active.bullets.map(b => <li key={b} className="flex items-center gap-2 text-sm rounded-xl bg-cream border border-ink/5 px-3 py-2.5"><Check className="h-4 w-4 text-emerald-600" />{b}</li>)}</ul>
              <div className="mt-6 flex gap-3"><MagneticButton to="/#contact" onClick={() => setActive(null)} className="flex-1 justify-center">Start with {active.title} <ArrowRight className="h-4 w-4" /></MagneticButton></div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ROICalculator() {
  const [spend, setSpend] = useState(150000);
  const [cvr, setCvr] = useState(2.4);
  const leads = Math.round((spend / 180) * (cvr / 2.2));
  const revenue = Math.round(leads * 0.22 * 18000);
  const roas = (revenue / Math.max(spend, 1)).toFixed(1);
  return (
    <section className="py-8">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="rounded-[2rem] bg-ink text-white p-6 sm:p-8 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="grid lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold tracking-wide"><Calculator className="h-3.5 w-3.5" /> INTERACTIVE</div>
              <h2 className="mt-3 font-display font-bold text-[28px] sm:text-[36px] leading-none">See what DOPE could do for your funnel.</h2>
              <p className="mt-3 text-white/60 text-sm leading-relaxed">Drag the sliders. Numbers update live — based on our median lifts across 250+ campaigns.</p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5">Avg. −33% CAC</span><span className="rounded-full bg-white/10 border border-white/10 px-3 py-1.5">+68% CVR</span><span className="rounded-full bg-brand px-3 py-1.5 font-bold">3.2× ROAS lift</span></div>
            </div>
            <div className="lg:col-span-7">
              <div className="rounded-[1.5rem] bg-paper text-ink p-5 sm:p-6 shadow-soft">
                <div className="grid sm:grid-cols-2 gap-6">
                  <label className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-wide text-ink/60">MONTHLY AD SPEND</span><span className="text-sm font-bold">₹{spend.toLocaleString("en-IN")}</span></div>
                    <input type="range" min={30000} max={500000} step={10000} value={spend} onChange={e => setSpend(Number(e.target.value))} className="w-full accent-brand h-2" />
                    <div className="flex justify-between text-[11px] text-ink/40"><span>₹30k</span><span>₹5L</span></div>
                  </label>
                  <label className="space-y-3">
                    <div className="flex items-center justify-between"><span className="text-xs font-bold tracking-wide text-ink/60">CURRENT CVR</span><span className="text-sm font-bold">{cvr.toFixed(1)}%</span></div>
                    <input type="range" min={0.8} max={5} step={0.1} value={cvr} onChange={e => setCvr(Number(e.target.value))} className="w-full accent-brand h-2" />
                    <div className="flex justify-between text-[11px] text-ink/40"><span>0.8%</span><span>5.0%</span></div>
                  </label>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-cream border border-ink/5 p-4 text-center"><div className="text-xs text-ink/60 flex items-center justify-center gap-1"><Users className="h-3.5 w-3.5" /> Leads / mo</div><div className="font-display font-bold text-xl mt-1">{leads.toLocaleString("en-IN")}</div></div>
                  <div className="rounded-2xl bg-cream border border-ink/5 p-4 text-center"><div className="text-xs text-ink/60 flex items-center justify-center gap-1"><DollarSign className="h-3.5 w-3.5" /> Revenue</div><div className="font-display font-bold text-xl mt-1">₹{(revenue / 100000).toFixed(1)}L</div></div>
                  <div className="rounded-2xl bg-brand text-white p-4 text-center"><div className="text-xs text-white/80">ROAS</div><div className="font-display font-bold text-xl mt-1">{roas}×</div></div>
                </div>
                <div className="mt-5 flex flex-wrap gap-3"><MagneticButton to="/#contact" className="flex-1 justify-center">Get my growth plan <ArrowUpRight className="h-4 w-4" /></MagneticButton><span className="text-xs text-ink/50 self-center">Takes 60 seconds • Free audit</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsStrip() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const stats = [{ n: 250, suffix: "+", label: "Campaigns launched", icon: Rocket }, { n: 98, suffix: "%", label: "Client retention", icon: Users }, { n: 42, suffix: "M+", label: "Ad spend managed", icon: DollarSign }, { n: 18, suffix: "", label: "Awards won", icon: Star }];
  return (
    <section ref={ref} className="py-6">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="rounded-[1.75rem] bg-ink text-white p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
          {stats.map(s => {
            const v = useCountUp(s.n, inView);
            return <div key={s.label} className="relative text-center lg:text-left border-white/10 lg:border-r last:border-0 px-2"><div className="hidden lg:flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 border border-white/10 mb-2"><s.icon className="h-4 w-4" /></div><div className="font-display font-bold text-3xl sm:text-4xl">{v}{s.suffix}</div><div className="text-xs tracking-[0.14em] text-white/60 mt-1">{s.label.toUpperCase()}</div></div>;
          })}
        </div>
      </div>
    </section>
  );
}

// ─── WORK ─────────────────────────────────────────────────────
function Work() {
  const [filter, setFilter] = useState("All");
  const cats = ["All", "D2C", "SaaS", "B2B"];
  const filtered = filter === "All" ? CASES : CASES.filter(p => p.cat === filter);
  return (
    <section id="work" className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-ink text-white px-3 py-1.5 text-xs font-bold tracking-wide"><Globe className="h-3.5 w-3.5" /> SELECTED WORK</div>
            <h2 className="mt-3 font-display font-bold tracking-tight text-[32px] sm:text-[44px] leading-none">Work that <span className="text-brand">moves the needle.</span></h2>
            <p className="mt-2 text-sm text-ink/60">Click any card for the full case study — challenge, solution, results.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {cats.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`rounded-full px-4 py-2 text-xs font-bold border transition ${filter === c ? "bg-ink text-white border-ink" : "bg-paper border-ink/10 text-ink/60 hover:text-ink hover:bg-cream"}`}>{c}</button>
            ))}
          </div>
        </div>
        <motion.div layout className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div key={p.slug} layout initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ delay: i * 0.04 }}>
                <Link to={`/work/${p.slug}`} className="group relative overflow-hidden rounded-[1.75rem] bg-paper border border-ink/5 shadow-card hover:shadow-soft transition block">
                  <TiltCard intensity={7}>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={p.thumb} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.07] transition duration-700" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent" />
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition bg-gradient-to-t ${p.accent} to-transparent`} />
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 backdrop-blur px-2.5 py-1 text-[11px] font-bold"><Eye className="h-3.5 w-3.5" /> {p.cat}</span>
                      <span className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full bg-white text-ink opacity-0 group-hover:opacity-100 transition"><ArrowUpRight className="h-4 w-4" /></span>
                    </div>
                    <div className="absolute bottom-0 p-5 text-white">
                      <div className="inline-flex rounded-full bg-white/15 backdrop-blur border border-white/10 px-2.5 py-1 text-[11px] font-semibold tracking-wide">{p.tag}</div>
                      <div className="mt-2 font-display font-bold text-lg leading-tight">{p.title}</div>
                      <div className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90">{p.metric} <ArrowUpRight className="h-4 w-4" /></div>
                    </div>
                  </TiltCard>
                </Link>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

function Process() {
  const steps = [
    { n: "01", title: "Discover", desc: "Audit, audience & opportunity mapping. We find the leverage before we spend a dollar.", icon: Search, stat: "7-day audit" },
    { n: "02", title: "Build", desc: "Strategy, creative & funnel in one sprint. Ship fast, learn faster.", icon: Layers, stat: "Week 1 wins" },
    { n: "03", title: "Launch", desc: "Live across paid, owned & earned. Daily optimization, weekly wins.", icon: Megaphone, stat: "Daily tuning" },
    { n: "04", title: "Scale", desc: "Double down on winners. Expand channels, markets & lifetime value.", icon: BarChart3, stat: "Compounding" },
  ];
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start 0.6", "end 0.6"] });
  const lineH = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  return (
    <section id="process" ref={containerRef} className="py-16 sm:py-20 bg-paper border-y border-ink/5">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <div className="inline-flex items-center gap-2 rounded-full bg-cream border border-ink/5 px-3 py-1.5 text-xs font-bold tracking-wide"><Rocket className="h-3.5 w-3.5" /> HOW WE WORK</div>
            <h2 className="mt-3 font-display font-bold tracking-tight text-[32px] sm:text-[44px] leading-none">From idea to <span className="text-brand">impact — in 30 days.</span></h2>
            <p className="mt-4 text-ink/60">A proven 4-step system. No black boxes — you see the board, the backlog and the burn.</p>
            <MagneticButton to="/#contact" className="mt-6">See a sample roadmap <ArrowRight className="h-4 w-4" /></MagneticButton>
            <div className="mt-8 hidden lg:flex items-center gap-3 rounded-2xl bg-ink text-white p-4">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop" alt="" className="h-12 w-12 rounded-full object-cover" />
              <div className="text-sm"><div className="font-semibold">Weekly Loom + live dashboard</div><div className="text-white/60 text-xs mt-0.5">You always know what shipped and what moved.</div></div>
            </div>
          </div>
          <div className="lg:col-span-7 relative">
            <div className="absolute left-4 sm:left-6 top-2 bottom-2 w-px bg-ink/10 hidden sm:block" />
            <motion.div style={{ height: lineH }} className="absolute left-4 sm:left-6 top-2 w-px bg-brand origin-top hidden sm:block" />
            <div className="space-y-5">
              {steps.map((s, i) => (
                <motion.div key={s.n} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} className="relative pl-0 sm:pl-16">
                  <span className="hidden sm:grid absolute left-0 top-6 h-12 w-12 place-items-center rounded-2xl bg-paper border border-ink/10 shadow-card"><s.icon className="h-5 w-5" /></span>
                  <div className="rounded-[1.5rem] bg-cream border border-ink/5 p-6 relative overflow-hidden group hover:bg-paper hover:shadow-card transition">
                    <div className="absolute -right-6 -top-6 text-[84px] font-display font-bold leading-none text-ink/[0.04] group-hover:text-brand/[0.06] transition">{s.n}</div>
                    <div className="flex items-center gap-2"><span className="sm:hidden h-9 w-9 grid place-items-center rounded-xl bg-paper border border-ink/5"><s.icon className="h-4 w-4" /></span><span className="text-xs font-bold tracking-[0.14em] text-brand">{s.n}</span><span className="ml-auto rounded-full bg-brand text-white px-2.5 py-1 text-[11px] font-bold">{s.stat}</span></div>
                    <h3 className="mt-2 font-display font-bold text-xl">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-ink/60">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { name: "Aarav Mehta", role: "Founder, Lumen", quote: "DOPE rebuilt our funnel and creative in 3 weeks. Revenue up 212%. The team feels like an in-house growth partner.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop", metric: "+212% revenue" },
    { name: "Sofia Chen", role: "CMO, Vault", quote: "Finally an agency that speaks both brand and performance. Our CAC dropped 38% while signups tripled.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80&auto=format&fit=crop", metric: "−38% CAC" },
    { name: "Daniel Park", role: "CEO, Aero", quote: "From audit to pipeline in 30 days. The dashboard alone is worth the retainer.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80&auto=format&fit=crop", metric: "3.4× pipeline" },
    { name: "Neha Rao", role: "Founder, Bloom", quote: "8.2M organic views in one quarter. Their UGC system is unreal.", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80&auto=format&fit=crop", metric: "8.2M views" },
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => { const t = setInterval(() => setIdx(v => (v + 1) % items.length), 4200); return () => clearInterval(t); }, []);
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="rounded-[2rem] bg-ink text-white p-6 sm:p-10 overflow-hidden relative">
          <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-brand/30 blur-3xl" />
          <div className="grid lg:grid-cols-12 gap-8 items-center relative">
            <div className="lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-3 py-1.5 text-xs font-bold tracking-wide"><Quote className="h-3.5 w-3.5" /> CLIENT LOVE</div>
              <h2 className="mt-3 font-display font-bold text-[28px] sm:text-[36px] leading-none">What founders say when we leave the room.</h2>
              <div className="mt-6 flex items-center gap-3">
                <button onClick={() => setIdx(v => (v - 1 + items.length) % items.length)} className="h-9 w-9 grid place-items-center rounded-full bg-white/10 border border-white/10 hover:bg-white/15"><ChevronLeft className="h-4 w-4" /></button>
                <button onClick={() => setIdx(v => (v + 1) % items.length)} className="h-9 w-9 grid place-items-center rounded-full bg-white text-ink hover:bg-cream"><ChevronRight className="h-4 w-4" /></button>
                <span className="ml-2 text-xs text-white/60 flex items-center gap-1.5"><MousePointer2 className="h-3.5 w-3.5" /> Drag to explore</span>
              </div>
              <div className="mt-4 flex gap-2">{items.map((_, i) => (<button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? "w-8 bg-white" : "w-6 bg-white/30"}`} aria-label={`Go to ${i + 1}`} />))}</div>
            </div>
            <div className="lg:col-span-7">
              <motion.div drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={(_, info) => {
                if (info.offset.x < -60) setIdx(v => (v + 1) % items.length);
                if (info.offset.x > 60) setIdx(v => (v - 1 + items.length) % items.length);
              }} className="cursor-grab active:cursor-grabbing">
                <div className="relative min-h-[240px]">
                  <AnimatePresence mode="wait">
                    <motion.div key={idx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }} className="rounded-[1.5rem] bg-paper text-ink p-6 sm:p-7 shadow-soft">
                      <div className="flex items-center justify-between"><div className="flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-500" />)}</div><span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 text-xs font-bold">{items[idx].metric}</span></div>
                      <p className="mt-3 text-[18px] leading-relaxed font-medium">“{items[idx].quote}”</p>
                      <div className="mt-5 flex items-center gap-3"><img src={items[idx].avatar} alt={items[idx].name} className="h-10 w-10 rounded-full object-cover" /><div><div className="text-sm font-semibold">{items[idx].name}</div><div className="text-xs text-ink/60">{items[idx].role}</div></div><span className="ml-auto hidden sm:grid h-9 w-9 place-items-center rounded-full bg-cream border border-ink/5"><Quote className="h-4 w-4" /></span></div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const tiers = [
    { name: "Launch", priceM: 49000, priceA: 42000, cadence: "/month", desc: "For founders who need momentum — fast.", features: ["Growth audit & roadmap", "2 campaigns / month", "Weekly reporting", "Slack support"], cta: "Start with Launch", featured: false },
    { name: "Scale", priceM: 120000, priceA: 99000, cadence: "/month", desc: "Most popular — full funnel, every week.", features: ["Everything in Launch", "Full-funnel management", "Creative production (8 assets/mo)", "CRO & lifecycle", "Dedicated strategist"], cta: "Choose Scale", featured: true },
    { name: "Expand", priceM: null, priceA: null, cadence: "", desc: "For teams entering new markets & channels.", features: ["Multi-market & channel scale", "Partnership & affiliate engine", "Executive dashboard", "On-site workshops"], cta: "Talk to us", featured: false },
  ];
  const fmt = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)}L` : `₹${(n / 1000).toFixed(0)}k`;
  return (
    <section id="pricing" className="py-16 sm:py-20 bg-cream">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-paper border border-ink/5 px-3 py-1.5 text-xs font-bold tracking-wide">PRICING — NO SURPRISES</div>
          <h2 className="mt-3 font-display font-bold tracking-tight text-[32px] sm:text-[44px] leading-none">Invest in growth, <span className="text-brand">not overhead.</span></h2>
          <p className="mt-3 text-ink/60">Month-to-month. Cancel anytime. Every plan starts with a free 7-day audit.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-paper border border-ink/5 p-1.5 shadow-card">
            <button onClick={() => setAnnual(false)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${!annual ? "bg-ink text-white" : "text-ink/60"}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${annual ? "bg-ink text-white" : "text-ink/60"}`}>Annual <span className="ml-1 rounded-full bg-emerald-500 text-white px-1.5 py-0.5 text-[10px]">Save 18%</span></button>
          </div>
        </div>
        <div className="mt-8 grid lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {tiers.map(t => (
            <motion.div key={t.name} whileHover={{ y: -4 }} className={`rounded-[1.75rem] border p-6 sm:p-7 flex flex-col relative overflow-hidden ${t.featured ? "bg-ink text-white border-ink shadow-soft scale-[1.02]" : "bg-paper border-ink/5 shadow-card"}`}>
              {t.featured && <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-brand to-[#3B82F6]" />}
              {t.featured && <div className="inline-flex self-start rounded-full bg-brand text-white px-3 py-1 text-xs font-bold tracking-wide">MOST POPULAR</div>}
              <h3 className="mt-3 font-display font-bold text-xl">{t.name}</h3>
              <p className={`text-sm mt-1 ${t.featured ? "text-white/60" : "text-ink/60"}`}>{t.desc}</p>
              <div className="mt-5 flex items-baseline gap-1">
                <AnimatePresence mode="wait"><motion.span key={annual ? "a" : "m"} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }} className="font-display font-bold text-3xl">{t.priceM == null ? "Custom" : fmt(annual ? t.priceA : t.priceM)}</motion.span></AnimatePresence>
                <span className={`text-sm ${t.featured ? "text-white/60" : "text-ink/60"}`}>{t.cadence}</span>
              </div>
              {t.priceM != null && <div className={`text-xs mt-1 ${t.featured ? "text-white/40" : "text-ink/40"}`}>{annual ? "billed annually" : "billed monthly"}</div>}
              <ul className="mt-6 space-y-2.5 flex-1">{t.features.map(f => (<li key={f} className="flex items-center gap-2 text-sm"><span className={`h-6 w-6 grid place-items-center rounded-full shrink-0 ${t.featured ? "bg-white/10" : "bg-cream border border-ink/5"}`}><Check className="h-3.5 w-3.5" /></span>{f}</li>))}</ul>
              <MagneticButton to="/#contact" variant={t.featured ? "primary" : "dark"} className="mt-7 w-full justify-center">{t.cta} <ArrowRight className="h-4 w-4" /></MagneticButton>
              <p className={`text-center text-xs mt-3 ${t.featured ? "text-white/50" : "text-ink/50"}`}>No lock-in · 7-day free audit</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    { q: "How fast can we start?", a: "Kickoff within 72 hours. First wins ship in week one; full roadmap in 7 days." },
    { q: "Do you require long contracts?", a: "No. Month-to-month. We earn retention with results, not paperwork." },
    { q: "What makes DOPE different?", a: "Strategy, performance and creative under one roof — no handoffs, no finger-pointing. One dashboard, one team, one goal: growth. Plus AI Studio to draft work in seconds." },
    { q: "How does the AI work?", a: "Mock mode works instantly — no key needed. Add VITE_ANTHROPIC_API_KEY (Claude) or VITE_OPENAI_API_KEY in .env for live LLM. For production, proxy the calls via your server so keys stay secret." },
  ];
  const [open, setOpen] = useState(0);
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <h2 className="font-display font-bold tracking-tight text-[30px] sm:text-[40px] leading-none">Questions? <br /><span className="text-brand">We’ve got answers.</span></h2>
            <p className="mt-3 text-ink/60">Still unsure? Book a 15-min call — we’ll audit one of your funnels live.</p>
            <MagneticButton to="/#contact" variant="ghost" className="mt-6">Talk to a strategist <ArrowUpRight className="h-4 w-4" /></MagneticButton>
          </div>
          <div className="lg:col-span-7">
            <div className="rounded-[1.75rem] bg-paper border border-ink/5 divide-y divide-ink/5 overflow-hidden shadow-card">
              {faqs.map((f, i) => (
                <div key={f.q}>
                  <button onClick={() => setOpen(open === i ? -1 : i)} className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left hover:bg-cream/50 transition">
                    <span className="font-semibold pr-2">{f.q}</span>
                    <span className={`h-8 w-8 grid place-items-center rounded-full border shrink-0 transition ${open === i ? "bg-ink text-white border-ink rotate-180" : "bg-cream border-ink/5"}`}><ChevronDown className="h-4 w-4" /></span>
                  </button>
                  <AnimatePresence>{open === i && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 sm:px-6 pb-6 text-sm leading-relaxed text-ink/60">{f.a}</p></motion.div>)}</AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CONTACT — Formspree / Web3Forms ──────────────────────────
function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", budget: "₹50k – ₹1L / mo", message: "" });
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const valid = form.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email) && form.message.trim().length >= 10;
  const isConfigured = !!(FORMSPREE_ID || WEB3FORMS_KEY);

  const submit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setStatus("sending"); setErrorMsg("");
    if (!isConfigured) {
      await new Promise(r => setTimeout(r, 700));
      setStatus("success");
      setTimeout(() => setStatus("idle"), 5000);
      return;
    }
    try {
      let res;
      if (FORMSPREE_ID) {
        res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...form, _subject: `New DOPE enquiry — ${form.company || form.name}` }),
        });
      } else {
        const fd = new FormData();
        fd.append("access_key", WEB3FORMS_KEY);
        fd.append("subject", `New DOPE enquiry — ${form.company || form.name}`);
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        res = await fetch("https://api.web3forms.com/submit", { method: "POST", body: fd });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
      setStatus("success");
      setForm({ name: "", email: "", company: "", budget: "₹50k – ₹1L / mo", message: "" });
      setTimeout(() => setStatus("idle"), 6000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong. Try hello@dopemedia.in");
    }
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-paper border-t border-ink/5">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand text-white px-3 py-1.5 text-xs font-bold tracking-wide">LET’S TALK</div>
            <h2 className="mt-3 font-display font-bold tracking-tight text-[32px] sm:text-[44px] leading-none">Tell us where you want to go. <span className="text-brand">We’ll map the route.</span></h2>
            <p className="mt-3 text-ink/60">Free 7-day growth audit. No deck, no fluff — just a Loom and a plan. Or ask DOPE AI to draft it first.</p>
            {!isConfigured && (
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 text-xs leading-relaxed text-amber-900">
                <b>Demo mode:</b> form shows success without sending. Add <code className="bg-white px-1 py-0.5 rounded border">VITE_FORMSPREE_ID</code> to <code className="bg-white px-1 py-0.5 rounded border">.env</code> — see <code className="bg-white px-1 py-0.5 rounded border">.env.example</code>.
              </div>
            )}
            <div className="mt-6 space-y-3">
              {[
                { icon: Mail, label: "Email us", value: "hello@dopemedia.in", href: "mailto:hello@dopemedia.in" },
                { icon: Phone, label: "Call / WhatsApp", value: "+91 99XXX XXXXX", href: "tel:+919999999999" },
                { icon: MapPin, label: "Studio", value: "Bengaluru · Remote worldwide", href: null },
              ].map(r => {
                const El = r.href ? "a" : "div";
                return <El key={r.label} href={r.href} className="flex items-center gap-3 rounded-2xl bg-cream border border-ink/5 p-4 hover:bg-paper hover:shadow-card transition"><span className="h-10 w-10 grid place-items-center rounded-xl bg-paper border border-ink/5 shadow-card"><r.icon className="h-5 w-5" /></span><div><div className="text-xs text-ink/60">{r.label}</div><div className="font-semibold">{r.value}</div></div>{r.href && <ArrowUpRight className="ml-auto h-4 w-4 text-ink/30" />}</El>;
              })}
            </div>
          </div>
          <div className="lg:col-span-7">
            <form onSubmit={submit} className="rounded-[1.75rem] bg-ink text-white p-6 sm:p-8 shadow-soft relative overflow-hidden">
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-brand/20 blur-3xl pointer-events-none" />
              <div className="grid sm:grid-cols-2 gap-4 relative">
                <label className="space-y-1.5"><span className="text-xs tracking-wide text-white/60">Full name *</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Aarav Mehta" className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/[0.12] transition" required /></label>
                <label className="space-y-1.5"><span className="text-xs tracking-wide text-white/60">Work email *</span><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="aarav@company.com" className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/[0.12] transition" required /></label>
                <label className="space-y-1.5"><span className="text-xs tracking-wide text-white/60">Company</span><input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Lumen" className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/25 transition" /></label>
                <label className="space-y-1.5"><span className="text-xs tracking-wide text-white/60">Monthly budget</span><select value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white/25"><option className="text-ink">₹25k – ₹50k / mo</option><option className="text-ink">₹50k – ₹1L / mo</option><option className="text-ink">₹1L – ₹3L / mo</option><option className="text-ink">₹3L+ / mo</option></select></label>
              </div>
              <label className="block mt-4 space-y-1.5 relative">
                <span className="text-xs tracking-wide text-white/60">What are you trying to grow? *</span>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} placeholder="Tell us about your goals, channels and constraints…" className="w-full rounded-xl bg-white/10 border border-white/10 px-4 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/25 focus:bg-white/[0.12] transition resize-none" required />
                <span className={`absolute right-3 -bottom-5 text-[11px] ${form.message.length >= 10 ? "text-emerald-300" : "text-white/40"}`}>{form.message.length}/10 min</span>
              </label>
              <button type="submit" disabled={status === "sending"} className={`mt-8 w-full inline-flex justify-center items-center gap-2 rounded-full py-3.5 font-semibold transition ${status === "sending" ? "bg-white/20 text-white cursor-wait" : valid ? "bg-brand hover:bg-brandHover text-white" : "bg-white/15 text-white/60 cursor-not-allowed"}`}>
                {status === "sending" ? <><span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending…</>
                  : status === "success" ? <><Check className="h-4 w-4" /> Request sent — we’ll reply within 24h</>
                    : <>Send request <ArrowUpRight className="h-4 w-4" /></>}
              </button>
              <p className="text-center text-xs text-white/50 mt-3">By sending, you agree to our Terms & Privacy. No spam — ever.</p>
              <AnimatePresence>
                {status === "success" && (<motion.div initial={{ opacity: 0, y: 8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl bg-emerald-500 text-white px-4 py-3 text-sm font-medium flex items-center gap-2"><Check className="h-4 w-4" /> Thanks! {isConfigured ? "We got your message — Calendly link incoming." : "Demo: no email was sent. Add VITE_FORMSPREE_ID to .env to go live."}</motion.div>)}
                {status === "error" && (<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 rounded-xl bg-red-500 text-white px-4 py-3 text-sm font-medium">{errorMsg}</motion.div>)}
              </AnimatePresence>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10 justify-between">
          <div className="max-w-sm">
            <img src="/logo.svg" alt="DOPE" className="h-7 w-auto brightness-0 invert" />
            <div className="text-xs tracking-[0.18em] text-white/50 font-semibold mt-2">DEVELOP · OPTIMIZE · PRODUCE · EXPAND</div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">We help ambitious brands turn attention into revenue. Strategy, creative & performance — one team, one dashboard — now with AI that drafts while you sleep.</p>
            <div className="mt-5 flex gap-2"><a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 transition">𝕏</a><a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 transition">in</a><a href="#" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 transition">◎</a><a href="mailto:hello@dopemedia.in" className="h-9 w-9 grid place-items-center rounded-full bg-white/10 hover:bg-white/15 transition"><Mail className="h-4 w-4" /></a></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm flex-1 lg:max-w-2xl">
            <div><div className="font-semibold">Explore</div><ul className="mt-3 space-y-2 text-white/60"><li><Link to="/#ai-studio" className="hover:text-white transition">AI Studio</Link></li><li><Link to="/#services" className="hover:text-white transition">Services</Link></li><li><Link to="/#work" className="hover:text-white transition">Work</Link></li><li><Link to="/#pricing" className="hover:text-white transition">Pricing</Link></li></ul></div>
            <div><div className="font-semibold">Company</div><ul className="mt-3 space-y-2 text-white/60"><li><a href="#" className="hover:text-white transition">About</a></li><li><a href="#" className="hover:text-white transition">Careers</a></li><li><Link to="/#contact" className="hover:text-white transition">Contact</Link></li><li><a href="#" className="hover:text-white transition">Privacy</a></li></ul></div>
            <div className="col-span-2 sm:col-span-1">
              <div className="font-semibold">Newsletter</div><p className="mt-3 text-white/60 text-xs leading-relaxed">Growth tactics every Tuesday. No spam.</p>
              <form onSubmit={e => { e.preventDefault(); if (email.includes("@")) { setJoined(true); setTimeout(() => setJoined(false), 3000); setEmail(""); } }} className="mt-3 flex gap-2">
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email" className="flex-1 min-w-0 rounded-full bg-white/10 border border-white/10 px-4 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-white/20" />
                <button className="shrink-0 rounded-full bg-white text-ink px-5 py-2.5 text-sm font-semibold hover:bg-cream transition">{joined ? "✓" : "Join"}</button>
              </form>
              {joined && <p className="text-xs text-emerald-300 mt-2">You’re in — welcome!</p>}
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 justify-between text-xs text-white/40"><span>© {new Date().getFullYear()} DOPE Media Pvt. Ltd. All rights reserved.</span><span>Made with obsession in Bengaluru • <a href="#" className="underline decoration-white/20 hover:text-white">Terms</a> · <a href="#" className="underline decoration-white/20 hover:text-white">Privacy</a></span></div>
      </div>
    </footer>
  );
}

// ─── HOME ─────────────────────────────────────────────────────
function HomePage() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <Services />
      <AIStudio />
      <ROICalculator />
      <StatsStrip />
      <Work />
      <Process />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Contact />
    </>
  );
}

// ─── CASE STUDY ───────────────────────────────────────────────
function CaseStudyPage() {
  const { slug } = useParams();
  const c = CASES.find(x => x.slug === slug);
  const navigate = useNavigate();
  if (!c) {
    return (
      <div className="pt-28 pb-20 text-center px-4">
        <p className="text-sm text-ink/60">Case study not found.</p>
        <Link to="/#work" className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink text-white px-6 py-3 font-semibold">Back to work <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }
  const others = CASES.filter(x => x.slug !== slug).slice(0, 3);
  return (
    <div className="pt-20">
      <div className="relative overflow-hidden">
        <img src={c.hero} alt={c.title} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10" />
        <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6 py-10 sm:py-16">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/15 text-white px-3 py-1.5 text-xs font-semibold hover:bg-white/15 transition"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur border border-white/10 px-3 py-1.5 text-xs font-bold text-white">{c.tag} <span className="h-1 w-1 rounded-full bg-white/60" /> {c.cat}</div>
          <h1 className="mt-3 font-display font-bold tracking-tight text-[32px] sm:text-[48px] leading-none text-white max-w-3xl">{c.title}</h1>
          <p className="mt-3 text-white/70 max-w-2xl text-[15px] sm:text-[17px] leading-relaxed">{c.summary}</p>
          <div className="mt-4 inline-flex rounded-full bg-brand text-white px-4 py-2 text-sm font-bold shadow-soft">{c.metric} — in 90 days</div>
          <div className="mt-6 flex flex-wrap gap-2">{c.stack.map(s => (<span key={s} className="rounded-full bg-white/10 backdrop-blur border border-white/15 px-3 py-1.5 text-xs font-semibold text-white">{s}</span>))}</div>
        </div>
      </div>
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {c.results.map(r => (<div key={r.l} className="rounded-2xl bg-cream border border-ink/5 p-4 text-center"><div className="font-display font-bold text-xl leading-none">{r.k}</div><div className="text-xs text-ink/60 mt-1 leading-tight">{r.l}</div></div>))}
            </div>
            <div className="rounded-[1.5rem] bg-paper border border-ink/5 p-6 sm:p-7 shadow-card">
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><span className="h-8 w-8 grid place-items-center rounded-xl bg-amber-500 text-white text-xs font-bold">!</span> Challenge</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink/65">{c.challenge}</p>
            </div>
            <div className="rounded-[1.5rem] bg-ink text-white p-6 sm:p-7 shadow-soft">
              <h2 className="font-display font-bold text-xl flex items-center gap-2"><span className="h-8 w-8 grid place-items-center rounded-xl bg-brand text-white"><Zap className="h-4 w-4" /></span> Solution</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">{c.solution}</p>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">{c.gallery.map(src => (<img key={src} src={src} alt="" loading="lazy" className="rounded-2xl w-full h-48 object-cover border border-white/10" />))}</div>
              <Link to="/#ai-studio" className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-4 py-2 text-sm font-semibold hover:bg-white/15 transition"><Bot className="h-4 w-4" /> Generate a similar plan in AI Studio <ArrowUpRight className="h-4 w-4" /></Link>
            </div>
            <div className="rounded-[1.5rem] bg-cream border border-ink/5 p-6 sm:p-7">
              <div className="flex gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-500" />)}</div>
              <p className="mt-3 text-[17px] leading-relaxed font-medium">“{c.testimonial.quote}”</p>
              <p className="mt-2 text-sm text-ink/60">— {c.testimonial.author}</p>
            </div>
          </div>
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-28 space-y-4">
              <div className="rounded-[1.5rem] bg-brand text-white p-6 shadow-soft">
                <h3 className="font-display font-bold text-lg leading-tight">Want the same playbook for your brand?</h3>
                <p className="mt-2 text-sm text-white/80 leading-relaxed">We’ll audit one funnel live on a 15-min call — free, no deck. Or draft it now in AI Studio.</p>
                <Link to="/#contact" className="mt-4 inline-flex w-full justify-center items-center gap-2 rounded-full bg-white text-ink px-6 py-3 font-semibold hover:bg-cream transition">Book a strategy call <ArrowUpRight className="h-4 w-4" /></Link>
                <Link to="/#ai-studio" className="mt-2 inline-flex w-full justify-center items-center gap-2 rounded-full bg-white/15 border border-white/20 text-white px-6 py-3 font-semibold hover:bg-white/20 transition"><Wand2 className="h-4 w-4" /> Open AI Studio</Link>
                <p className="text-center text-xs text-white/60 mt-2">Avg. reply in 4h · 12 spots left this quarter</p>
              </div>
              <div className="rounded-[1.5rem] bg-paper border border-ink/5 p-5 shadow-card">
                <div className="text-xs font-bold tracking-[0.14em] text-ink/40">STACK</div>
                <div className="mt-3 flex flex-wrap gap-2">{c.stack.map(s => (<span key={s} className="rounded-full bg-cream border border-ink/5 px-3 py-1.5 text-xs font-semibold">{s}</span>))}</div>
                <a href="#" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">Visit live site <ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-14">
          <h3 className="font-display font-bold text-xl">More work</h3>
          <div className="mt-4 grid md:grid-cols-3 gap-5">
            {others.map(p => (
              <Link key={p.slug} to={`/work/${p.slug}`} className="group relative overflow-hidden rounded-[1.75rem] bg-paper border border-ink/5 shadow-card hover:shadow-soft transition block">
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={p.thumb} alt={p.title} className="h-full w-full object-cover group-hover:scale-[1.06] transition duration-700" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                </div>
                <div className="absolute bottom-0 p-5 text-white">
                  <div className="inline-flex rounded-full bg-white/15 backdrop-blur px-2.5 py-1 text-[11px] font-semibold">{p.tag}</div>
                  <div className="mt-2 font-display font-bold leading-tight">{p.title}</div>
                  <div className="mt-1 text-sm font-semibold text-white/90">{p.metric}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────
export default function App() {
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 850); return () => clearTimeout(t); }, []);
  return (
    <div className="min-h-screen bg-cream">
      <style>{`section[id]{scroll-margin-top:96px} html{scrollbar-width:thin; scrollbar-color:#1D4ED8 #F7F7F5} html.dark{scrollbar-color:#1D4ED8 #14161c}`}</style>
      <AnimatePresence>
        {loading && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-[100] grid place-items-center bg-ink">
            <div className="text-center">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display font-bold text-5xl tracking-tight text-[#2b5cff]">DOPE</motion.div>
              <div className="mt-2 text-xs tracking-[0.2em] text-white/50 font-semibold">DEVELOP · OPTIMIZE · PRODUCE · EXPAND</div>
              <div className="mt-6 mx-auto h-1 w-24 rounded-full bg-white/10 overflow-hidden">
                <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }} className="h-full w-1/2 bg-brand" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <ScrollToTop />
      <CustomCursor />
      <ScrollProgress />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/work/:slug" element={<CaseStudyPage />} />
          <Route path="*" element={<div className="pt-32 pb-20 text-center px-4"><h1 className="font-display font-bold text-3xl">Page not found</h1><p className="text-ink/60 mt-2">That page doesn’t exist.</p><Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand text-white px-6 py-3 font-semibold">Go home <ArrowRight className="h-4 w-4" /></Link></div>} />
        </Routes>
      </main>
      <AIChat />
      <Footer />
    </div>
  );
}
