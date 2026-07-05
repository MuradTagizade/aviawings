"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  CalendarHeart,
  Compass,
  Download,
  ExternalLink,
  FileText,
  Landmark,
  Languages,
  Lightbulb,
  Luggage,
  MapPin,
  Martini,
  MessageCircleHeart,
  Minus,
  Moon,
  MountainSnow,
  Palette,
  Plane,
  Plus,
  Route,
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
import { findAirport } from "@/lib/airports";
import { trackEvent } from "@/lib/analytics";
import {
  buildExportHtml,
  downloadHtmlFile,
  printAsPdf,
  type ExportPlan,
} from "@/lib/plan-export";
import { addDays, cn, formatDateISO } from "@/lib/utils";

/* ——— Types ——— */

interface PlanItem {
  part: "morning" | "afternoon" | "evening";
  title: string;
  description: string;
  category: string;
  wikiQuery?: string;
  mapQuery?: string;
  durationHint?: string;
}

interface Plan {
  title: string;
  destination: string;
  country: string;
  heroWikiQuery?: string;
  summary: string;
  stats: { bestTime: string; language: string; currency: string };
  days: { day: number; theme: string; items: PlanItem[] }[];
  budget?: { currency: string; perDayLow: number; perDayHigh: number; note: string };
  packing?: string[];
  phrases?: { local: string; meaning: string }[];
  tips?: string[];
}

interface WikiInfo {
  title: string;
  extract: string;
  thumbnail?: string;
  url?: string;
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

const DESTINATION_SUGGESTIONS = [
  "Bakü", "İstanbul", "Kapadokya", "Antalya", "Tiflis", "Dubai",
  "Paris", "Roma", "Barselona", "Londra", "Prag", "Viyana",
  "Tokyo", "Bali", "New York", "Santorini", "Maldivler", "İsviçre",
];

/* ——— Component ——— */

export function PlannerClient() {
  const t = useTranslations("planner");
  const tq = useTranslations("planner.quiz");
  const locale = useLocale() as "tr" | "en";
  const sp = useSearchParams();

  const presetDest = sp.get("destination");

  const [stage, setStage] = useState<Stage>("quiz");
  const [step, setStep] = useState(presetDest ? 1 : 0);
  const [answers, setAnswers] = useState({
    destination: presetDest ?? "",
    when: "flexible",
    style: "",
    pace: "",
    company: "",
    budget: "",
    days: 4,
  });
  const [plan, setPlan] = useState<Plan | null>(null);
  const [wiki, setWiki] = useState<Record<string, WikiInfo>>({});
  const [error, setError] = useState(false);

  /* Chat state */
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-US", {
      month: "long",
    });
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) =>
      fmt.format(new Date(now.getFullYear(), now.getMonth() + i, 1))
    );
  }, [locale]);

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

  const TOTAL_STEPS = 7;

  /* ——— Plan generation ——— */

  async function generate(finalAnswers: typeof answers) {
    setStage("generating");
    setError(false);
    setWiki({});
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

  /* ——— Wikipedia enrichment (images + extracts) ——— */

  useEffect(() => {
    if (!plan) return;
    const queries = new Set<string>();
    if (plan.heroWikiQuery) queries.add(plan.heroWikiQuery);
    plan.days.forEach((d) =>
      d.items.forEach((i) => i.wikiQuery && queries.add(i.wikiQuery))
    );
    let cancelled = false;
    const list = [...queries];
    let idx = 0;

    async function worker() {
      while (idx < list.length && !cancelled) {
        const q = list[idx++];
        try {
          const res = await fetch(`/api/wiki?q=${encodeURIComponent(q)}&lang=${locale}`);
          if (res.ok) {
            const info: WikiInfo = await res.json();
            if (!cancelled) setWiki((w) => ({ ...w, [q]: info }));
          }
        } catch {
          // enrichment is best-effort
        }
      }
    }
    Promise.all(Array.from({ length: 4 }, worker));
    return () => {
      cancelled = true;
    };
  }, [plan, locale]);

  /* ——— Chat ——— */

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
          country: plan.country,
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

  /* ——— Flights link + export ——— */

  const flightDest = useMemo(() => {
    if (!plan) return undefined;
    const norm = `${plan.destination} ${plan.country}`.toLocaleLowerCase();
    const codes = ["GYD", "GNJ", "IST", "ESB", "ADB", "AYT", "TBS", "DXB", "LHR", "CDG", "FCO", "BCN", "AMS", "VIE", "BER", "FRA", "JFK", "DOH"];
    for (const code of codes) {
      const a = findAirport(code);
      if (!a) continue;
      if (
        norm.includes(a.city.en.toLocaleLowerCase()) ||
        norm.includes(a.city.tr.toLocaleLowerCase("tr-TR"))
      ) {
        return a;
      }
    }
    return undefined;
  }, [plan]);

  function toExportPlan(): ExportPlan | null {
    if (!plan) return null;
    return {
      title: plan.title,
      destination: plan.destination,
      country: plan.country,
      summary: plan.summary,
      heroImage: plan.heroWikiQuery ? wiki[plan.heroWikiQuery]?.thumbnail : undefined,
      stats: plan.stats,
      days: plan.days.map((d) => ({
        day: d.day,
        theme: d.theme,
        items: d.items.map((i) => ({
          part: i.part,
          title: i.title,
          description: i.description,
          durationHint: i.durationHint,
          mapQuery: i.mapQuery,
          image: i.wikiQuery ? wiki[i.wikiQuery]?.thumbnail : undefined,
        })),
      })),
      budget: plan.budget,
      packing: plan.packing ?? [],
      phrases: plan.phrases ?? [],
      tips: plan.tips ?? [],
    };
  }

  function exportLabels() {
    return {
      day: t("day1"),
      bestTime: t("statsBestTime"),
      language: t("statsLanguage"),
      currency: t("statsCurrency"),
      budgetTitle: t("budgetTitle"),
      budgetPerPerson: t("budgetPerPerson"),
      packingTitle: t("packingTitle"),
      phrasesTitle: t("phrasesTitle"),
      tipsTitle: t("tipsTitle"),
      viewOnMap: t("viewOnMap"),
      preparedBy: t("preparedBy"),
      disclaimer: t("disclaimer"),
      duration: t("duration"),
    };
  }

  function handleDownloadHtml() {
    const ep = toExportPlan();
    if (!ep) return;
    trackEvent("plan_export", { format: "html" });
    const slug = ep.destination
      .toLocaleLowerCase()
      .replace(/[^a-z0-9ğüşöçıə]+/gi, "-");
    downloadHtmlFile(buildExportHtml(ep, exportLabels(), locale), `aviawings-${slug}.html`);
  }

  function handleDownloadPdf() {
    const ep = toExportPlan();
    if (!ep) return;
    trackEvent("plan_export", { format: "pdf" });
    printAsPdf(buildExportHtml(ep, exportLabels(), locale));
  }

  /* ═══════════ Render ═══════════ */

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

  /* ——— Plan view ——— */
  if (stage === "plan" && plan) {
    const hero = plan.heroWikiQuery ? wiki[plan.heroWikiQuery] : undefined;
    const depart = formatDateISO(addDays(new Date(), 14));
    const ret = formatDateISO(addDays(new Date(), 14 + answers.days));
    const totalQueries =
      (plan.heroWikiQuery ? 1 : 0) +
      plan.days.reduce((a, d) => a + d.items.filter((i) => i.wikiQuery).length, 0);
    const enriching = Object.keys(wiki).length < Math.min(totalQueries, 4);

    return (
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-24 sm:px-6">
        {/* ——— Hero card ——— */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-3xl border border-ink/5 bg-surface shadow-card"
        >
          <div className="relative h-56 bg-sand sm:h-72">
            {hero?.thumbnail ? (
              <Image
                src={hero.thumbnail}
                alt={plan.destination}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Plane className="h-10 w-10 text-ink-faint/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                {plan.destination} · {plan.country}
              </p>
              <h1 className="mt-1 font-display text-3xl text-white sm:text-4xl">
                {plan.title}
              </h1>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <p className="text-[15px] leading-relaxed text-ink-soft">{plan.summary}</p>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: CalendarHeart, label: t("statsBestTime"), value: plan.stats.bestTime },
                { icon: Languages, label: t("statsLanguage"), value: plan.stats.language },
                { icon: Banknote, label: t("statsCurrency"), value: plan.stats.currency },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl bg-sand/70 px-4 py-3"
                >
                  <Icon className="h-4.5 w-4.5 shrink-0 text-gold-deep" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-faint">
                      {label}
                    </p>
                    <p className="truncate text-sm font-medium text-ink">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadPdf}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-cream transition-all hover:bg-ink/90 hover:shadow-lift"
              >
                <FileText className="h-4 w-4" />
                {t("downloadPdf")}
              </button>
              <button
                onClick={handleDownloadHtml}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-ink/15 px-5 text-[13px] font-medium text-ink transition-all hover:border-ink/40"
              >
                <Download className="h-4 w-4" />
                {t("downloadHtml")}
              </button>
              {flightDest && (
                <Link
                  href={`/flights?from=${flightDest.iata === "GYD" || flightDest.iata === "GNJ" ? "IST" : "GYD"}&to=${flightDest.iata}&depart=${depart}&return=${ret}&adults=1&children=0&infants=0&cabin=economy`}
                  className="inline-flex h-10 items-center gap-2 rounded-full bg-gold px-5 text-[13px] font-semibold text-white transition-all hover:bg-gold-deep hover:shadow-lift"
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
                className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-medium text-ink-soft transition-colors hover:bg-sand"
              >
                <Wand2 className="h-4 w-4" />
                {t("regenerate")}
              </button>
            </div>
            <p className="mt-2 text-xs text-ink-faint">{t("exportNote")}</p>
            {enriching && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gold-deep">
                <motion.span
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                >
                  ✦
                </motion.span>
                {t("enriching")}
              </p>
            )}
          </div>
        </motion.div>

        {/* ——— Days ——— */}
        <div className="mt-8 space-y-6">
          {plan.days.map((day, di) => {
            const routeUrl = `https://www.google.com/maps/dir/${day.items
              .filter((i) => i.mapQuery)
              .map((i) => encodeURIComponent(i.mapQuery!))
              .join("/")}`;
            return (
              <motion.section
                key={day.day}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: Math.min(di * 0.06, 0.25) }}
                className="overflow-hidden rounded-2xl border border-ink/5 bg-surface shadow-soft"
              >
                <div className="flex flex-wrap items-center gap-4 border-b border-ink/5 bg-sand/50 px-6 py-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink font-display text-lg text-cream">
                    {day.day}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-faint">
                      {t("day", { day: day.day })}
                    </p>
                    <h2 className="truncate font-semibold text-ink">{day.theme}</h2>
                  </div>
                  <a
                    href={routeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/40 bg-gold-soft/50 px-4 text-[12px] font-semibold text-gold-deep transition-all hover:bg-gold hover:text-white"
                  >
                    <Route className="h-3.5 w-3.5" />
                    {t("openDayRoute")}
                  </a>
                </div>

                <div className="divide-y divide-ink/5">
                  {day.items.map((item, ii) => {
                    const CatIcon = CATEGORY_ICONS[item.category] ?? Compass;
                    const PartIcon = PART_ICONS[item.part] ?? Sun;
                    const info = item.wikiQuery ? wiki[item.wikiQuery] : undefined;
                    return (
                      <div key={ii} className="flex gap-4 p-5 sm:gap-5 sm:p-6">
                        <div className="relative hidden h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-sand sm:block">
                          {info?.thumbnail ? (
                            <Image
                              src={info.thumbnail}
                              alt={item.title}
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <CatIcon className="h-6 w-6 text-ink-faint/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-soft">
                              <PartIcon className="h-3.5 w-3.5 text-gold-deep" />
                            </span>
                            <h3 className="truncate font-semibold text-ink">{item.title}</h3>
                          </div>
                          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                            {item.description}
                          </p>
                          {info?.extract && (
                            <p className="mt-2 line-clamp-2 border-l-2 border-gold/40 pl-3 text-[13px] italic leading-relaxed text-ink-faint">
                              {info.extract}
                            </p>
                          )}
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-faint">
                            {item.durationHint && <span>⏱ {item.durationHint}</span>}
                            {item.mapQuery && (
                              <a
                                href={`https://www.google.com/maps/search/${encodeURIComponent(item.mapQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-gold-deep hover:underline"
                              >
                                <MapPin className="h-3 w-3" />
                                {t("viewOnMap")}
                              </a>
                            )}
                            {info?.url && (
                              <a
                                href={info.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 hover:underline"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {t("wikiSource")}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* ——— Embedded map ——— */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          className="mt-8 overflow-hidden rounded-2xl border border-ink/5 bg-surface shadow-soft"
        >
          <h2 className="flex items-center gap-2 px-6 pt-5 font-semibold text-ink">
            <MapPin className="h-4.5 w-4.5 text-gold-deep" />
            {t("mapTitle")}
          </h2>
          <div className="mt-4 h-80">
            <iframe
              title={t("mapTitle")}
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${plan.destination}, ${plan.country}`)}&z=12&hl=${locale}&output=embed`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </motion.section>

        {/* ——— Budget & Packing ——— */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {plan.budget && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft"
            >
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <Banknote className="h-4.5 w-4.5 text-gold-deep" />
                {t("budgetTitle")}
              </h2>
              <p className="mt-3 font-display text-3xl text-ink">
                {plan.budget.perDayLow}–{plan.budget.perDayHigh}{" "}
                <span className="text-xl">{plan.budget.currency}</span>
              </p>
              <p className="text-xs text-ink-faint">{t("budgetPerPerson")}</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">{plan.budget.note}</p>
            </motion.section>
          )}

          {plan.packing && plan.packing.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.06 }}
              className="rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft"
            >
              <h2 className="flex items-center gap-2 font-semibold text-ink">
                <Luggage className="h-4.5 w-4.5 text-gold-deep" />
                {t("packingTitle")}
              </h2>
              <ul className="mt-3 space-y-1.5">
                {plan.packing.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-soft">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.section>
          )}
        </div>

        {/* ——— Phrases ——— */}
        {plan.phrases && plan.phrases.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft"
          >
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <MessageCircleHeart className="h-4.5 w-4.5 text-gold-deep" />
              {t("phrasesTitle")}
            </h2>
            <div className="mt-3 divide-y divide-ink/5">
              {plan.phrases.map((p, i) => (
                <div key={i} className="flex items-baseline justify-between gap-4 py-2.5">
                  <span className="font-medium text-ink">{p.local}</span>
                  <span className="text-right text-sm text-ink-soft">{p.meaning}</span>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ——— Tips ——— */}
        {plan.tips && plan.tips.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 rounded-2xl bg-gold-soft/40 p-6"
          >
            <h2 className="flex items-center gap-2 font-semibold text-ink">
              <Lightbulb className="h-4.5 w-4.5 text-gold-deep" />
              {t("tipsTitle")}
            </h2>
            <ul className="mt-3 space-y-2">
              {plan.tips.map((tip, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {tip}
                </li>
              ))}
            </ul>
          </motion.section>
        )}

        {/* ——— Chat ——— */}
        <div className="mt-10 rounded-2xl border border-ink/5 bg-surface shadow-soft">
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
    answers.destination.trim().length >= 2,
    true, // month is optional (defaults to flexible)
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

      <div className="mt-10 min-h-[340px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="s0"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-2 text-center font-display text-2xl text-ink">
                {t("quizDestination")}
              </h2>
              <p className="mb-6 text-center text-sm text-ink-faint">
                {t("destinationHint")}
              </p>
              <div className="mx-auto max-w-lg">
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gold-deep" />
                  <input
                    value={answers.destination}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, destination: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && answers.destination.trim().length >= 2) {
                        setStep(1);
                      }
                    }}
                    placeholder={t("destinationPlaceholder")}
                    className="h-16 w-full rounded-2xl border border-ink/10 bg-surface pl-12 pr-4 text-lg text-ink shadow-soft outline-none transition-colors placeholder:text-ink-faint focus:border-gold focus:ring-2 focus:ring-gold/20"
                    autoFocus
                  />
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  {DESTINATION_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setAnswers((a) => ({ ...a, destination: s }))}
                      className={cn(
                        "rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all",
                        answers.destination === s
                          ? "border-gold bg-gold-soft text-gold-deep"
                          : "border-ink/10 bg-surface text-ink-soft hover:border-gold/50"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="s1"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -32 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="mb-6 text-center font-display text-2xl text-ink">
                {t("quizWhen")}
              </h2>
              <div className="mx-auto grid max-w-lg grid-cols-3 gap-2 sm:grid-cols-4">
                {months.map((m) => (
                  <button
                    key={m}
                    onClick={() => setAnswers((a) => ({ ...a, when: m }))}
                    className={cn(
                      "rounded-xl border px-2 py-3 text-sm font-medium capitalize transition-all",
                      answers.when === m
                        ? "border-gold bg-gold-soft text-gold-deep"
                        : "border-ink/10 bg-surface text-ink-soft hover:border-ink/25"
                    )}
                  >
                    {m}
                  </button>
                ))}
                <button
                  onClick={() => setAnswers((a) => ({ ...a, when: "flexible" }))}
                  className={cn(
                    "col-span-3 rounded-xl border px-3 py-3 text-sm font-medium transition-all sm:col-span-4",
                    answers.when === "flexible"
                      ? "border-gold bg-gold-soft text-gold-deep"
                      : "border-ink/10 bg-surface text-ink-soft hover:border-ink/25"
                  )}
                >
                  {t("whenFlexible")}
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="s2"
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
                      "flex items-start gap-4 rounded-2xl border bg-surface p-5 text-left transition-all",
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

          {step === 3 && (
            <motion.div
              key="s3"
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
                      "rounded-2xl border bg-surface p-6 text-center transition-all",
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

          {step === 4 && (
            <motion.div
              key="s4"
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
                      "rounded-2xl border bg-surface p-6 text-center font-semibold text-ink transition-all",
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

          {step === 5 && (
            <motion.div
              key="s5"
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
                      "rounded-2xl border bg-surface p-6 text-center transition-all",
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

          {step === 6 && (
            <motion.div
              key="s6"
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
                  onClick={() => setAnswers((a) => ({ ...a, days: Math.min(10, a.days + 1) }))}
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
