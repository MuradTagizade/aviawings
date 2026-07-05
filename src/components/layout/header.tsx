"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Sparkles, User2, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { CurrencySwitcher } from "./currency-switcher";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";
import { useAuthUser } from "@/hooks/use-auth-user";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { key: "flights", href: "/" },
  { key: "destinations", href: "/destinations" },
  { key: "visa", href: "/visa" },
  { key: "planner", href: "/planner", icon: Sparkles },
] as const;

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuthUser();
  const authEnabled = isSupabaseConfigured();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "safe-top fixed inset-x-0 top-0 z-40 transition-all duration-300",
          scrolled
            ? "border-b border-ink/5 bg-cream/85 shadow-soft backdrop-blur-xl"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Aviawings" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV_ITEMS.map(({ key, href, ...rest }) => {
              const active =
                href === "/" ? pathname === "/" : pathname.startsWith(href);
              const Icon = "icon" in rest ? rest.icon : undefined;
              return (
                <Link
                  key={key}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-sand text-ink"
                      : "text-ink-soft hover:bg-sand/70 hover:text-ink"
                  )}
                >
                  {Icon && <Icon className="h-3.5 w-3.5 text-gold-deep" />}
                  {t(key)}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <CurrencySwitcher />
            <LocaleSwitcher />
            {authEnabled && (
              <Link
                href={user ? "/account" : "/auth/sign-in"}
                className="ml-1 flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-sm font-medium text-cream transition-all hover:bg-ink/90 hover:shadow-lift"
              >
                <User2 className="h-3.5 w-3.5" />
                {user ? t("account") : t("signIn")}
              </Link>
            )}
          </div>

          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={t("menu")}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-cream md:hidden"
          >
            <motion.nav
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05 }}
              className="flex h-full flex-col px-6 pt-24 pb-10"
              aria-label="Mobile"
            >
              {NAV_ITEMS.map(({ key, href }, i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                >
                  <Link
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-ink/5 py-5 font-display text-3xl text-ink"
                  >
                    {t(key)}
                  </Link>
                </motion.div>
              ))}
              {authEnabled && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.26 }}
                >
                  <Link
                    href={user ? "/account" : "/auth/sign-in"}
                    onClick={() => setMobileOpen(false)}
                    className="block border-b border-ink/5 py-5 font-display text-3xl text-ink"
                  >
                    {user ? t("account") : t("signIn")}
                  </Link>
                </motion.div>
              )}
              <div className="mt-auto flex items-center justify-between gap-3 pt-8">
                <ThemeToggle />
                <CurrencySwitcher />
                <LocaleSwitcher />
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
