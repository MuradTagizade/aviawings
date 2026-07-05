"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  Bell,
  Heart,
  LogOut,
  Plane,
  Ticket,
  Trash2,
  UserRound,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";
import { useAuthUser } from "@/hooks/use-auth-user";
import { findDestination } from "@/content/destinations";
import { AIRPORTS, findAirport } from "@/lib/airports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { cn } from "@/lib/utils";

type Tab = "trips" | "favorites" | "alerts" | "profile";

interface BookingRow {
  id: string;
  reference: string;
  origin: string;
  destination: string;
  depart_date: string;
  return_date: string | null;
  total: number;
  currency: string;
  is_demo: boolean;
}

interface FavoriteRow {
  id: string;
  kind: string;
  ref: string;
}

interface AlertRow {
  id: string;
  origin: string;
  destination: string;
  target_price: number;
  currency: string;
}

export function AccountClient() {
  const t = useTranslations("account");
  const ta = useTranslations("auth");
  const tn = useTranslations("nav");
  const locale = useLocale() as "tr" | "en";
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const [tab, setTab] = useState<Tab>("trips");
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [fullName, setFullName] = useState("");
  const [saved, setSaved] = useState(false);

  const [alertFrom, setAlertFrom] = useState("IST");
  const [alertTo, setAlertTo] = useState("GYD");
  const [alertPrice, setAlertPrice] = useState("150");

  useEffect(() => {
    if (!loading && !user && isSupabaseConfigured()) {
      router.replace("/auth/sign-in");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase || !user) return;
    supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setBookings((data as BookingRow[]) ?? []));
    supabase
      .from("favorites")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setFavorites((data as FavoriteRow[]) ?? []));
    supabase
      .from("price_alerts")
      .select("*")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAlerts((data as AlertRow[]) ?? []));
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setFullName(data?.full_name ?? ""));
  }, [user]);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 pb-24 pt-36 text-center">
        <p className="rounded-2xl bg-sand p-6 text-[15px] text-ink-soft">
          {ta("notConfigured")}
        </p>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-4xl px-4 pb-24 pt-32">
        <div className="skeleton h-10 w-64 rounded-xl" />
        <div className="skeleton mt-6 h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const supabase = getSupabaseBrowser()!;

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  async function removeFavorite(id: string) {
    setFavorites((f) => f.filter((x) => x.id !== id));
    await supabase.from("favorites").delete().eq("id", id);
  }

  async function removeAlert(id: string) {
    setAlerts((a) => a.filter((x) => x.id !== id));
    await supabase.from("price_alerts").delete().eq("id", id);
  }

  async function createAlert() {
    const price = parseFloat(alertPrice);
    if (!price || alertFrom === alertTo) return;
    const { data } = await supabase
      .from("price_alerts")
      .insert({
        user_id: user!.id,
        origin: alertFrom,
        destination: alertTo,
        target_price: price,
        currency: "USD",
      })
      .select()
      .single();
    if (data) setAlerts((a) => [data as AlertRow, ...a]);
  }

  async function saveProfile() {
    await supabase
      .from("profiles")
      .upsert({ id: user!.id, full_name: fullName, updated_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const displayName = fullName || user.email?.split("@")[0] || "";

  const tabs: { key: Tab; icon: typeof Ticket; label: string }[] = [
    { key: "trips", icon: Ticket, label: t("tabs.trips") },
    { key: "favorites", icon: Heart, label: t("tabs.favorites") },
    { key: "alerts", icon: Bell, label: t("tabs.alerts") },
    { key: "profile", icon: UserRound, label: t("tabs.profile") },
  ];

  function EmptyState({ title, sub }: { title: string; sub: string }) {
    return (
      <div className="rounded-2xl border border-ink/5 bg-white p-12 text-center shadow-soft">
        <p className="font-display text-xl text-ink">{title}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{sub}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-28 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl text-ink">
          {t("welcome", { name: displayName })}
        </h1>
        <button
          onClick={signOut}
          className="flex h-10 items-center gap-2 rounded-full border border-ink/10 px-4 text-sm text-ink-soft transition-colors hover:border-coral/40 hover:text-coral"
        >
          <LogOut className="h-4 w-4" />
          {tn("signOut")}
        </button>
      </div>

      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto">
        {tabs.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={cn(
              "flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all",
              tab === key ? "bg-ink text-cream" : "bg-sand text-ink-soft hover:text-ink"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6"
      >
        {tab === "trips" &&
          (bookings.length === 0 ? (
            <EmptyState title={t("noTrips")} sub={t("noTripsSub")} />
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => {
                const from = findAirport(b.origin)?.city[locale] ?? b.origin;
                const to = findAirport(b.destination)?.city[locale] ?? b.destination;
                return (
                  <div
                    key={b.id}
                    className="flex items-center gap-4 rounded-2xl border border-ink/5 bg-white p-5 shadow-soft"
                  >
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-soft">
                      <Plane className="h-5 w-5 text-gold-deep" />
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-ink">
                        {from} → {to}
                        {b.return_date ? " ⇄" : ""}
                      </p>
                      <p className="text-sm text-ink-faint">
                        {b.depart_date}
                        {b.return_date ? ` – ${b.return_date}` : ""} · {t("bookingRef")}:{" "}
                        <span className="font-mono">{b.reference}</span>
                      </p>
                    </div>
                    {b.is_demo && (
                      <span className="rounded-full bg-sky-soft px-2.5 py-1 text-[11px] font-semibold text-sky">
                        {t("demoBooking")}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

        {tab === "favorites" &&
          (favorites.length === 0 ? (
            <EmptyState title={t("noFavorites")} sub={t("noFavoritesSub")} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {favorites.map((f) => {
                const dest = f.kind === "destination" ? findDestination(f.ref) : undefined;
                const label = dest
                  ? `${dest.city[locale]}, ${dest.country[locale]}`
                  : f.ref.replace("-", " → ");
                const href = dest ? `/destinations/${dest.slug}` : "/";
                return (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-2xl border border-ink/5 bg-white p-4 shadow-soft"
                  >
                    <Heart className="h-4.5 w-4.5 shrink-0 fill-coral text-coral" />
                    <Link href={href} className="flex-1 font-medium text-ink hover:underline">
                      {label}
                    </Link>
                    <button
                      onClick={() => removeFavorite(f.id)}
                      className="rounded-full p-2 text-ink-faint transition-colors hover:bg-coral-soft hover:text-coral"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}

        {tab === "alerts" && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-ink/5 bg-white p-6 shadow-soft">
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto] sm:items-end">
                <Field label={locale === "tr" ? "Nereden" : "From"}>
                  <select
                    value={alertFrom}
                    onChange={(e) => setAlertFrom(e.target.value)}
                    className="h-12 w-full rounded-xl border border-ink/10 bg-white px-3 text-[15px]"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.iata} value={a.iata}>
                        {a.city[locale]} ({a.iata})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={locale === "tr" ? "Nereye" : "To"}>
                  <select
                    value={alertTo}
                    onChange={(e) => setAlertTo(e.target.value)}
                    className="h-12 w-full rounded-xl border border-ink/10 bg-white px-3 text-[15px]"
                  >
                    {AIRPORTS.map((a) => (
                      <option key={a.iata} value={a.iata}>
                        {a.city[locale]} ({a.iata})
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="≤ USD">
                  <Input
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(e.target.value)}
                    min={1}
                  />
                </Field>
                <Button onClick={createAlert} className="h-12">
                  <Bell className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 text-xs text-ink-faint">{t("alertsSoon")}</p>
            </div>

            {alerts.length === 0 ? (
              <EmptyState title={t("noAlerts")} sub={t("noAlertsSub")} />
            ) : (
              <div className="space-y-3">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 rounded-2xl border border-ink/5 bg-white p-4 shadow-soft"
                  >
                    <Bell className="h-4.5 w-4.5 shrink-0 text-gold-deep" />
                    <p className="flex-1 text-sm font-medium text-ink">
                      {findAirport(a.origin)?.city[locale] ?? a.origin} →{" "}
                      {findAirport(a.destination)?.city[locale] ?? a.destination}
                      <span className="ml-2 text-ink-faint">
                        ≤ {a.target_price} {a.currency}
                      </span>
                    </p>
                    <button
                      onClick={() => removeAlert(a.id)}
                      className="rounded-full p-2 text-ink-faint transition-colors hover:bg-coral-soft hover:text-coral"
                      aria-label="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="max-w-md rounded-2xl border border-ink/5 bg-white p-6 shadow-soft">
            <div className="space-y-4">
              <Field label={t("profileName")}>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </Field>
              <Field label={t("profileEmail")}>
                <Input value={user.email ?? ""} disabled />
              </Field>
            </div>
            <Button className="mt-5" onClick={saveProfile}>
              {saved ? t("saved") : t("save")}
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
