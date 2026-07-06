"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Check,
  CreditCard,
  Info,
  Luggage,
  Plane,
  Armchair,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { useBooking } from "@/stores/booking";
import { usePreferences } from "@/stores/preferences";
import { convert, formatMoney } from "@/lib/currency";
import { findAirport } from "@/lib/airports";
import { findDestinationByIata } from "@/content/destinations";
import { trackEvent } from "@/lib/analytics";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { contentLocale } from "@/lib/locale";
import { SALES_MODE } from "@/lib/affiliate";

const passengerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gender: z.enum(["m", "f"]),
  documentType: z.enum(["id", "passport"]),
  documentNumber: z.string().min(5).max(20),
});

const formSchema = z.object({
  passengers: z.array(passengerSchema).min(1),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
});

type FormValues = z.infer<typeof formSchema>;

function makeBookingCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "AW";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function BookingClient() {
  const t = useTranslations("booking");
  const tc = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { offer, search, clear } = useBooking();
  const { currency } = usePreferences();

  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [processing, setProcessing] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState<string | null>(null);

  const paxCount = search ? search.adults + search.children + search.infants : 1;
  const paxTypes: string[] = useMemo(() => {
    if (!search) return ["adult"];
    return [
      ...Array(search.adults).fill("adult"),
      ...Array(search.children).fill("child"),
      ...Array(search.infants).fill("infant"),
    ];
  }, [search]);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      passengers: Array.from({ length: paxCount }, () => ({
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "m" as const,
        documentType: "id" as const,
        documentNumber: "",
      })),
      email: "",
      phone: "",
    },
  });

  // Affiliate mode: no internal checkout — payment happens on the partner
  // site. Anyone landing here (old link, manual URL) goes back home.
  if (SALES_MODE === "affiliate") {
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 text-center">
        <p className="font-display text-2xl text-ink">{t("errors.expired")}</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-cream"
        >
          {t("backHome")}
        </Link>
      </div>
    );
  }

  if (!offer || !search) {
    if (confirmedCode) return null; // cleared after confirmation
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 text-center">
        <p className="font-display text-2xl text-ink">{t("errors.expired")}</p>
        <Link
          href="/"
          className="mt-6 inline-flex h-11 items-center rounded-full bg-ink px-6 text-sm font-medium text-cream"
        >
          {t("backHome")}
        </Link>
      </div>
    );
  }

  const price = convert(offer.price.total, offer.price.currency, currency);
  const fromCity =
    findAirport(search.origin)?.city[contentLocale(locale)] ?? search.origin;
  const toCity =
    findAirport(search.destination)?.city[contentLocale(locale)] ??
    search.destination;

  const steps = [t("steps.passengers"), t("steps.review"), t("steps.payment")];

  async function completePayment() {
    setProcessing(true);
    trackEvent("purchase", {
      transaction_id: offer!.id,
      value: offer!.price.total,
      currency: offer!.price.currency,
    });

    const code = makeBookingCode();
    const values = getValues();

    // Persist for signed-in users when Supabase is configured (best effort)
    try {
      const supabase = getSupabaseBrowser();
      if (supabase) {
        const { data } = await supabase.auth.getUser();
        if (data.user) {
          await supabase.from("bookings").insert({
            user_id: data.user.id,
            reference: code,
            origin: search!.origin,
            destination: search!.destination,
            depart_date: search!.departDate,
            return_date: search!.returnDate ?? null,
            passengers: values.passengers.map((p) => ({
              firstName: p.firstName,
              lastName: p.lastName,
            })),
            total: offer!.price.total,
            currency: offer!.price.currency,
            is_demo: true,
          });
        }
      }
    } catch {
      // demo flow — never block confirmation on persistence
    }

    // Simulated processing for the demo payment
    await new Promise((r) => setTimeout(r, 2200));
    setConfirmedCode(code);
    setProcessing(false);
    clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ——— Confirmation ——— */
  if (confirmedCode) {
    const destGuide = findDestinationByIata(search.destination);
    return (
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-32 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf-soft"
        >
          <Check className="h-9 w-9 text-leaf" strokeWidth={2.5} />
        </motion.div>

        {/* Flight path flourish */}
        <svg viewBox="0 0 400 60" className="mx-auto mt-6 w-72 opacity-60" aria-hidden>
          <motion.path
            d="M10 50 Q 200 -20 390 45"
            fill="none"
            stroke="#c9a96e"
            strokeWidth="1.5"
            strokeDasharray="3 7"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: 0.3, ease: "easeInOut" }}
          />
        </svg>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-4 font-display text-3xl text-ink sm:text-4xl"
        >
          {t("confirmedTitle")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-3 text-[15px] text-ink-soft"
        >
          {t("confirmedText", { code: confirmedCode })}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="mt-2 text-[13px] text-ink-faint"
        >
          {t("confirmedDemo")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="mt-8 flex flex-wrap justify-center gap-3"
        >
          <Button onClick={() => router.push("/")} variant="outline">
            {t("backHome")}
          </Button>
          {destGuide && (
            <Button variant="gold" onClick={() => router.push(`/destinations/${destGuide.slug}`)}>
              {t("viewDestination")}
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  const errFor = (i: number, key: keyof z.infer<typeof passengerSchema>) =>
    errors.passengers?.[i]?.[key] ? t("errors.required") : undefined;

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-24 sm:px-6">
      <h1 className="font-display text-3xl text-ink">{t("title")}</h1>

      {/* Progress */}
      <div className="mt-6 flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors",
                i < step
                  ? "bg-leaf text-white"
                  : i === step
                    ? "bg-ink text-cream"
                    : "bg-sand text-ink-faint"
              )}
            >
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-[13px] font-medium sm:block",
                i === step ? "text-ink" : "text-ink-faint"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div className={cn("h-px flex-1", i < step ? "bg-leaf" : "bg-ink/10")} />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <AnimatePresence mode="wait">
            {/* ——— Step 1: passengers ——— */}
            {step === 0 && (
              <motion.div
                key="pax"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {paxTypes.map((type, i) => (
                  <section
                    key={i}
                    className="rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft"
                  >
                    <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
                      {t("passengerTitle", { index: i + 1 })}
                      <span className="rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-medium text-ink-soft">
                        {t(type as "adult" | "child" | "infant")}
                      </span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label={t("firstName")} error={errFor(i, "firstName")}>
                        <Input {...register(`passengers.${i}.firstName`)} autoComplete="given-name" />
                      </Field>
                      <Field label={t("lastName")} error={errFor(i, "lastName")}>
                        <Input {...register(`passengers.${i}.lastName`)} autoComplete="family-name" />
                      </Field>
                      <Field
                        label={t("birthDate")}
                        error={errors.passengers?.[i]?.birthDate ? t("errors.invalidDate") : undefined}
                      >
                        <Input type="date" {...register(`passengers.${i}.birthDate`)} />
                      </Field>
                      <Field label={t("gender")}>
                        <select
                          {...register(`passengers.${i}.gender`)}
                          className="h-12 w-full rounded-xl border border-ink/10 bg-surface px-3 text-[15px] text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        >
                          <option value="m">{t("male")}</option>
                          <option value="f">{t("female")}</option>
                        </select>
                      </Field>
                      <Field label={t("documentType")}>
                        <select
                          {...register(`passengers.${i}.documentType`)}
                          className="h-12 w-full rounded-xl border border-ink/10 bg-surface px-3 text-[15px] text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20"
                        >
                          <option value="id">{t("nationalId")}</option>
                          <option value="passport">{t("passport")}</option>
                        </select>
                      </Field>
                      <Field
                        label={t("documentNumber")}
                        error={
                          errors.passengers?.[i]?.documentNumber
                            ? t("errors.invalidDocument")
                            : undefined
                        }
                      >
                        <Input {...register(`passengers.${i}.documentNumber`)} />
                      </Field>
                    </div>
                  </section>
                ))}

                <section className="rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft">
                  <h2 className="font-semibold text-ink">{t("contactTitle")}</h2>
                  <p className="mb-4 mt-1 text-[13px] text-ink-faint">{t("contactText")}</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label={t("email")}
                      error={errors.email ? t("errors.invalidEmail") : undefined}
                    >
                      <Input type="email" {...register("email")} autoComplete="email" />
                    </Field>
                    <Field
                      label={t("phone")}
                      error={errors.phone ? t("errors.invalidPhone") : undefined}
                    >
                      <Input type="tel" {...register("phone")} autoComplete="tel" placeholder="+90 5xx xxx xx xx" />
                    </Field>
                  </div>
                </section>

                <Button
                  size="lg"
                  className="w-full sm:w-auto"
                  onClick={handleSubmit(() => {
                    trackEvent("add_payment_info_step", {});
                    setStep(1);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  })}
                >
                  {t("continueToReview")}
                </Button>
              </motion.div>
            )}

            {/* ——— Step 2: review ——— */}
            {step === 1 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <section className="rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft">
                  <h2 className="mb-4 font-semibold text-ink">{t("reviewTitle")}</h2>
                  {offer.itineraries.map((it, ii) => {
                    const f = it.segments[0];
                    const l = it.segments[it.segments.length - 1];
                    return (
                      <div
                        key={ii}
                        className="mb-3 flex items-center gap-4 rounded-xl bg-sand/50 p-4 last:mb-0"
                      >
                        <Plane
                          className={cn("h-5 w-5 text-gold-deep", ii === 1 && "rotate-180")}
                        />
                        <div className="flex-1 text-sm">
                          <p className="font-medium text-ink">
                            {ii === 0 ? fromCity : toCity} → {ii === 0 ? toCity : fromCity}
                          </p>
                          <p className="text-ink-faint">
                            {f.departureTime.slice(0, 10)} · {f.departureTime.slice(11, 16)}–
                            {l.arrivalTime.slice(11, 16)} ·{" "}
                            {formatDuration(it.durationMinutes, locale)} · {f.airlineName}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </section>

                <section className="rounded-2xl border border-dashed border-gold/40 bg-gold-soft/30 p-6">
                  <h2 className="flex items-center gap-2 font-semibold text-ink">
                    {t("extras")}
                  </h2>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13px] text-ink-faint shadow-soft">
                      <Luggage className="h-4 w-4" /> {t("extraBaggage")}
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-[13px] text-ink-faint shadow-soft">
                      <Armchair className="h-4 w-4" /> {t("seatSelection")}
                    </span>
                  </div>
                  <p className="mt-3 text-[13px] text-gold-deep">{t("extrasSoon")}</p>
                </section>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>
                    ← {steps[0]}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      trackEvent("begin_checkout", { value: offer.price.total });
                      setStep(2);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    {t("continueToPayment")}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ——— Step 3: payment (demo) ——— */}
            {step === 2 && (
              <motion.div
                key="pay"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-2.5 rounded-xl border border-sky/15 bg-sky-soft px-4 py-3 text-[13px] text-sky">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>{t("demoPayment")}:</strong> {t("demoPaymentText")}
                  </span>
                </div>

                <section className="rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft">
                  <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink">
                    <CreditCard className="h-4.5 w-4.5 text-gold-deep" />
                    {t("paymentTitle")}
                  </h2>
                  <div className="grid gap-4">
                    <Field label={t("cardNumber")}>
                      <Input disabled placeholder="•••• •••• •••• ••••" />
                    </Field>
                    <Field label={t("cardName")}>
                      <Input disabled placeholder="—" />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field label={t("expiry")}>
                        <Input disabled placeholder="MM/YY" />
                      </Field>
                      <Field label={t("cvv")}>
                        <Input disabled placeholder="•••" />
                      </Field>
                    </div>
                  </div>
                </section>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} disabled={processing}>
                    ← {steps[1]}
                  </Button>
                  <Button size="lg" variant="gold" onClick={completePayment} disabled={processing}>
                    {processing ? (
                      <span className="flex items-center gap-2.5">
                        <motion.span
                          animate={{ x: [0, 6, 0] }}
                          transition={{ repeat: Infinity, duration: 1.1 }}
                        >
                          <Plane className="h-4 w-4" />
                        </motion.span>
                        {t("processing")}
                      </span>
                    ) : (
                      `${t("payNow")} · ${formatMoney(price, currency, locale)}`
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Fare summary */}
        <aside>
          <div className="sticky top-24 rounded-2xl border border-ink/5 bg-surface p-6 shadow-soft">
            <h2 className="font-semibold text-ink">{t("fareSummary")}</h2>
            <div className="mt-4 space-y-2.5 text-sm">
              <div className="flex justify-between text-ink-soft">
                <span>
                  {fromCity} → {toCity}
                  {search.returnDate ? " ⇄" : ""}
                </span>
              </div>
              <div className="flex justify-between text-ink-soft">
                <span>{t("farePassengers")}</span>
                <span>{paxCount}</span>
              </div>
              <div className="my-3 h-px bg-ink/5" />
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-ink">{tc("total")}</span>
                <span className="font-display text-2xl text-ink">
                  {formatMoney(price, currency, locale)}
                </span>
              </div>
              <p className="text-[12px] text-ink-faint">{t("fareTaxes")}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
