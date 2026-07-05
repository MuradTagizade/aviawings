"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  Landmark,
  Lightbulb,
  Martini,
  Minus,
  Moon,
  MountainSnow,
  Palette,
  Plane,
  Plus,
  Send,
  ShoppingBag,
  Sparkles,
  Sun,
  Sunset,
  TreePine,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DESTINATIONS, findDestination } from "@/content/destinations";
import { trackEvent } from "@/lib/analytics";
import { addDays, cn, formatDateISO } from "@/lib/utils";

/* ——— Types ——— */

interface PlanItem {
  part: "morning" | "afternoon" | "evening";
  title: string;
  description: string;
  category: string;
}

interface Plan {
  title: string;
  destination: string;
  summary: string;
  days: { day: number; theme: string; items: PlanItem[] }[];
  tips: string[];
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type Stage = "quiz" | "generating" | "plan" | "unavailable";

const CATEGORY_ICONS: Record<string, typeof Landmark> = {
  landmark: Landmark,
  museum: Palette,
  nature: TreePine,
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  nightlife: Martini,
  history: Compass,
};

const PART_ICONS = { morning: Sun, afternoon: Sunset, evening: Moon } as const;

export function PlannerClient() {
  const t = useTranslations("planner");
  const tq = useTranslations("planner.quiz");
  const locale = useLocale() as "tr" | "en";
  const sp = useSearchParams();

  const presetDest = sp.get("destination");
  const preset = presetDest ? findDestination(presetDest) : undefined;

  const [stage, setStage] = useState<Stage>("quiz");
  const [step, setStep] = useState(preset ? 1 : 0);
  const [answers, setAnswers] = useState({
    destination: preset ? preset.city.en : "",
    style: "",
    pace: "",
    company: "",
    budget: "",
    days: 4,
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState(false);

  /* Chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const styleOptions = useMemo(
    () => [
      { key: "culture", icon: Landmark, label: tq("styleCulture"), text: tq("styleCultureText") },
      { key: "food", icon: UtensilsCrossed, label: tq("styleFood"), text: tq("styleFoodText") },
      { key: "adventure", icon: MountainSnow, label: tq("styleAdventure"), text: tq("styleAdventureText") },
      { key: "nightlife", icon: Martini, label: tq("styleNightlife"), text: tq("styleNightlifeText") },
      { key: "relax", icon: Sun, label: tq("styleRelax"), text: tq("styleRelaxText") },
    ],
    [tq]
  );

  const paceOptions = [
    { key: "relaxed", label: tq("paceRelaxed"), text: tq("paceRelaxedText") },
    { key: "balanced", label: tq("paceBalanced"), text: tq("paceBalancedText") },
    { key: "full", label: tq("paceFull"), text: tq("paceFullText") },
  ];
  const companyOptions = [
    { key: "solo", label: tq("companySolo") },
    { key: "couple", label: tq("companyCouple") },
    { key: "family", label: tq("companyFamily") },
    { key: "friends", label: tq("companyFriends") },
  ];
  const budgetOptions = [
    { key: "smart", label: tq("budgetSmart"), text: tq("budgetSmartText") },
    { key: "comfort", label: tq("budgetComfort"), text: tq("budgetComfortText") },
    { key: "luxury", label: tq("budgetLuxury"), text: tq("budgetLuxuryText") },
  ];

  const TOTAL_STEPS = 6;

  async function generate(finalAnswers: typeof answers) {
    setStage("generating");
    setError(false);
    trackEvent("ai_plan_requested", { destination: finalAnswers.destination });
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "plan", locale, answers: finalAnswers }),
      });
      if (res.status === 503) {
        setStage("unavailable");
        return;
      }
      if (!res.ok) throw new Error("plan_failed");
      const data = await res.json();
      setPlan(data.plan);
      setMessages([]);
      setStage("plan");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError(true);
      setStage("quiz");
      setStep(TOTAL_STEPS - 1);
    }
  }

  async function sendChat() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setStreaming(true);

    const planContext = plan
      ? JSON.stringify({
          title: plan.title,
          destination: plan.destination,
          days: plan.days.map((d) => ({
            day: d.day,
            theme: d.theme,
            items: d.items.map((i) => i.title),
          })),
        }).slice(0, 4000)
      : undefined;

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "chat",
          locale,
          planContext,
          messages: nextMessages.slice(-12),
        }),
      });
      if (!res.ok || !res.body) throw new Error("chat_failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...nextMessages, { role: "assistant", content: acc }]);
        chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    } catch {
      setMessages(nextMessages);
    } finally {
      setStreaming(false);
    }
  }

  /* Find flights link for the plan's destination */
  const planDest = useMemo(() => {
    if (!plan) return undefined;
    const norm = plan.destination.toLocaleLowerCase();
    return DESTINATIONS.find(
      (d) =>
        norm.includes(d.city.en.toLocaleLowerCase()) ||
        norm.includes(d.city.tr.toLocaleLowerCase("tr-TR"))
    );
  }, [plan]);

  /* ——— Render ——— */

  if (stage === "unavailable") {
    return (
      <div className="mx-auto max-w-xl px-4 pb-24 pt-36 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gold-soft">
          <Sparkles className="h-7 w-7 text-gold-deep" />
        </span>
        <h1 className="mt-6 font-display text-3xl text-ink">{t("notConfigured")}</h1>
        <p className="mt-3 text-[15px] text-ink-soft">{t("notConfiguredText")}</p>
      </div>
    );
  }

  if (stage === "generating") {
    return (
      <div className="mx-auto max-w-xl px-4 pb-24 pt-40 text-center">
        <div className="relative mx-auto h-24 w-64">
          <svg viewBox="0 0 260 80" className="absolute inset-0">
            <path
              id="flightpath"
              d="M10 65 Q 130 -10 250 55"
              fill="none"
              stroke="#c9a96e"
              strokeWidth="1.5"
              strokeDasharray="2 8"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          <motion.div
            className="absolute"
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{ offsetPath: `path("M10 65 Q 130 -10 250 55")`, offsetRotate: "auto" }}
          >
            <Plane className="h-6 w-6 text-gold-deep" />
          </motion.div>
        </div>
        <h1 className="mt-4 font-display text-3xl text-ink">{t("generating")}</h1>
        <p className="mt-2 text-[15px] text-ink-soft">{t("generatingSub")}</p>
      </div>
    );
  }

  if (stage === "plan" && plan) {
    const depart = formatDateISO(addDays(new Date(), 14));
    const ret = formatDateISO(addDays(new Date(), 14 + answers.days));
    return (
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-deep">
            {t("yourPlan")} · {plan.destination}
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink sm:text-5xl">{plan.title}</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            {plan.summary}
          </p>
        </motion.div>

        <div className="mt-10 space-y-6">
          {plan.days.map((day, di) => (
            <motion.section
              key={day.day}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: Math.min(di * 0.08, 0.3) }}
              className="overflow-hidden rounded-2xl border border-ink/5 bg-white shadow-soft"
            >
              <div className="flex items-center gap-4 border-b border-ink/5 bg-sand/50 px-6 py-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink font-display text-lg text-cream">
                  {day.day}
                </span>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                    {t("day", { day: day.day })}
                  </p>
                  <h2 className="font-semibold text-ink">{day.theme}</h2>
                </div>
              </div>
              <div className="divide-y divide-ink/5">
                {day.items.map((item, ii) => {
                  const CatIcon = CATEGORY_ICONS[item.category] ?? Compass;
                  const PartIcon = PART_ICONS[item.part] ?? Sun;
                  return (
                    <div key={ii} className="flex gap-4 px-6 py-4">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold-soft">
                        <PartIcon className="h-4 w-4 text-gold-deep" />
                      </span>
                      <div>
                        <h3 className="flex items-center gap-2 font-medium text-ink">
                          {item.title}
                          <CatIcon className="h-3.5 w-3.5 text-ink-faint" />
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </div>

        {plan.tips?.length > 0 && (
          <div className="mt-8 rounded-2xl bg-gold-soft/40 p-6">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <Lightbulb className="h-4.5 w-4.5 text-gold-deep" />
              {locale === "tr" ? "Yerel ipuçları" : "Local tips"}
            </h2>
            <ul className="mt-3 space-y-2">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {planDest && (
            <Link
              href={`/flights?from=${planDest.iata === "GYD" || planDest.iata === "GNJ" ? "IST" : "GYD"}&to=${planDest.iata}&depart=${depart}&return=${ret}&adults=1&children=0&infants=0&cabin=economy`}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-[15px] font-semibold text-white transition-all hover:bg-gold-deep hover:shadow-lift"
            >
              <Plane className="h-4 w-4" />
              {t("findFlights")}
            </Link>
          )}
          <button
            onClick={() => {
              setPlan(null);
              setStage("quiz");
              setStep(0);
            }}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-ink/15 px-7 text-[15px] font-medium text-ink transition-all hover:border-ink/40"
          >
            <Wand2 className="h-4 w-4" />
            {t("regenerate")}
          </button>
        </div>

        {/* ——— Chat ——— */}
        <div className="mt-14 rounded-2xl border border-ink/5 bg-white shadow-soft">
          <div className="border-b border-ink/5 px-6 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <Sparkles className="h-4 w-4 text-gold-deep" />
              {t("askAnything")}
            </h2>
          </div>
          <div className="max-h-96 space-y-4 overflow-y-auto p-6">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-md bg-ink text-cream"
                      : "rounded-bl-md bg-sand text-ink"
                  )}
                >
                  {m.content ||
                    (streaming && i === messages.length - 1 ? (
                      <motion.span
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                      >
                        ···
                      </motion.span>
                    ) : (
                      ""
                    ))}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center gap-2 border-t border-ink/5 p-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendChat()}
              placeholder={t("chatPlaceholder")}
              className="h-11 flex-1 rounded-full border border-ink/10 bg-cream px-4 text-sm text-ink outline-none placeholder:text-ink-faint focus:border-gold"
              maxLength={2000}
            />
            <button
              onClick={sendChat}
              disabled={streaming || !input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-white transition-all hover:bg-gold-deep disabled:opacity-40"
              aria-label={t("send")}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ink-faint">{t("disclaimer")}</p>
      </div>
    );
  }

  /* ——— Quiz ——— */
  const canProceed = [
    answers.destination !== "",
    answers.style !== "",
    answers.pace !== "",
    answers.company !== "",
    answers.budget !== "",
    true,
  ][step];

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-28 sm:px-6">
      <div className="text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-soft">
          <Sparkles className="h-5 w-5 text-gold-deep" />
        </span>
        <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">{t("title")}</h1>
        <p className="mx-auto mt-2 max-w-md text-[15px] text-ink-soft">{t("subtitle")}</p>
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === step ? "w-8 bg-gold" : i < step ? "w-4 bg-gold/50" : "w-4 bg-ink/10"
            )}
          />
        ))}
      </div>

      {error && (
        <p className="mt-6 rounded-xl bg-coral-soft px-4 py-3 text-center text-sm text-coral">
          {locale === "tr"
            ? "Plan oluşturulamadı. Lütfen tekrar deneyin."
            : "Couldn't create the plan. Please try again."}
        </p>
      )}

      <div className="mt-10 min-h-[380px]">
        <AnimatePresence mode="wait">
          {/* Step 0: destination */}
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-center font-display text-2xl text-ink">
                {tq("destination")}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {DESTINATIONS.map((d) => (
                  <button
                    key={d.slug}
                    onClick={() => setAnswers((a) => ({ ...a, destination: d.city.en }))}
                    className={cn(
                      "group relative h-32 overflow-hidden rounded-2xl text-left transition-all",
                      answers.destination === d.city.en
                        ? "ring-3 ring-gold ring-offset-2 ring-offset-cream"
                        : "hover:scale-[1.02]"
                    )}
                  >
                    <Image
                      src={d.cardImage}
                      alt={d.city[locale]}
                      fill
                      sizes="200px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
                    <span className="absolute bottom-3 left-3 font-display text-lg text-white">
                      {d.city[locale]}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setAnswers((a) => ({ ...a, destination: "surprise" }))}
                  className={cn(
                    "flex h-32 flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-ink to-sky text-cream transition-all",
                    answers.destination === "surprise"
                      ? "ring-3 ring-gold ring-offset-2 ring-offset-cream"
                      : "hover:scale-[1.02]"
                  )}
                >
                  <Wand2 className="h-5 w-5 text-gold" />
                  <span className="font-display text-lg">{tq("destinationAny")}</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 1: style */}
          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-center font-display text-2xl text-ink">{tq("style")}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {styleOptions.map(({ key, icon: Icon, label, text }) => (
                  <button
                    key={key}
                    onClick={() => setAnswers((a) => ({ ...a, style: key }))}
                    className={cn(
                      "flex items-start gap-4 rounded-2xl border bg-white p-5 text-left transition-all",
                      answers.style === key
                        ? "border-gold bg-gold-soft/50 shadow-card"
                        : "border-ink/8 hover:border-ink/25 hover:shadow-soft"
                    )}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-soft">
                      <Icon className="h-5 w-5 text-gold-deep" />
                    </span>
                    <span>
                      <span className="block font-semibold text-ink">{label}</span>
                      <span className="mt-0.5 block text-[13px] text-ink-soft">{text}</span>
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: pace */}
          {step === 2 && (
            <motion.div
              key="s2"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-center font-display text-2xl text-ink">{tq("pace")}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {paceOptions.map(({ key, label, text }) => (
                  <button
                    key={key}
                    onClick={() => setAnswers((a) => ({ ...a, pace: key }))}
                    className={cn(
                      "rounded-2xl border bg-white p-6 text-center transition-all",
                      answers.pace === key
                        ? "border-gold bg-gold-soft/50 shadow-card"
                        : "border-ink/8 hover:border-ink/25 hover:shadow-soft"
                    )}
                  >
                    <span className="block font-semibold text-ink">{label}</span>
                    <span className="mt-1 block text-[13px] text-ink-soft">{text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: company */}
          {step === 3 && (
            <motion.div
              key="s3"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-center font-display text-2xl text-ink">
                {tq("company")}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {companyOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setAnswers((a) => ({ ...a, company: key }))}
                    className={cn(
                      "rounded-2xl border bg-white p-6 text-center font-semibold text-ink transition-all",
                      answers.company === key
                        ? "border-gold bg-gold-soft/50 shadow-card"
                        : "border-ink/8 hover:border-ink/25 hover:shadow-soft"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 4: budget */}
          {step === 4 && (
            <motion.div
              key="s4"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-center font-display text-2xl text-ink">{tq("budget")}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {budgetOptions.map(({ key, label, text }) => (
                  <button
                    key={key}
                    onClick={() => setAnswers((a) => ({ ...a, budget: key }))}
                    className={cn(
                      "rounded-2xl border bg-white p-6 text-center transition-all",
                      answers.budget === key
                        ? "border-gold bg-gold-soft/50 shadow-card"
                        : "border-ink/8 hover:border-ink/25 hover:shadow-soft"
                    )}
                  >
                    <span className="block font-semibold text-ink">{label}</span>
                    <span className="mt-1 block text-[13px] text-ink-soft">{text}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 5: days */}
          {step === 5 && (
            <motion.div
              key="s5"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <h2 className="mb-8 font-display text-2xl text-ink">{tq("days")}</h2>
              <div className="mx-auto flex w-fit items-center gap-6">
                <button
                  onClick={() => setAnswers((a) => ({ ...a, days: Math.max(2, a.days - 1) }))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-gold hover:text-gold-deep"
                  aria-label="-"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className="w-20 font-display text-6xl text-ink">{answers.days}</span>
                <button
                  onClick={() => setAnswers((a) => ({ ...a, days: Math.min(7, a.days + 1) }))}
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:border-gold hover:text-gold-deep"
                  aria-label="+"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quiz nav */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-ink-soft transition-colors hover:bg-sand disabled:opacity-0"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "tr" ? "Geri" : "Back"}
        </button>
        {step < TOTAL_STEPS - 1 ? (
          <button
            onClick={() => canProceed && setStep((s) => s + 1)}
            disabled={!canProceed}
            className="flex h-11 items-center gap-2 rounded-full bg-ink px-6 text-sm font-semibold text-cream transition-all hover:bg-ink/90 disabled:opacity-40"
          >
            {locale === "tr" ? "Devam" : "Continue"}
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => generate(answers)}
            className="flex h-12 items-center gap-2 rounded-full bg-gold px-7 text-[15px] font-semibold text-white transition-all hover:bg-gold-deep hover:shadow-lift"
          >
            <Wand2 className="h-4 w-4" />
            {t("start")}
          </button>
        )}
      </div>
    </div>
  );
}
