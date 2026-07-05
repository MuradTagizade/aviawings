"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link, useRouter } from "@/i18n/navigation";
import { Logo } from "@/components/logo";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowser, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "sign-in" | "sign-up" | "reset";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.9-.1-1.5-.3-2.2H12v4.1h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.6 2.8c2.2-2 3.8-5 3.8-8.5Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.6-2.8c-1 .7-2.4 1.2-4.3 1.2-3.1 0-5.8-2-6.8-4.9L1.5 17.4C3.4 21.3 7.4 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.2 14.6c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2L1.5 7.4C.8 8.8.4 10.4.4 12s.4 3.2 1.1 4.6l3.7-2Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.9 0 3.3.8 4.2 1.6l3.1-3C17.4 1.6 15.2.4 12 .4 7.4.4 3.4 3.1 1.5 7l3.7 2.9c1-2.9 3.7-5.1 6.8-5.1Z"
      />
    </svg>
  );
}

export function AuthClient({ mode }: { mode: Mode }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <div className="mx-auto max-w-md px-4 pb-24 pt-36 text-center">
        <Logo className="justify-center" />
        <p className="mt-8 rounded-2xl bg-sand p-6 text-[15px] text-ink-soft">
          {t("notConfigured")}
        </p>
      </div>
    );
  }

  async function withGoogle() {
    const supabase = getSupabaseBrowser()!;
    setBusy(true);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/account`,
      },
    });
  }

  async function submit() {
    const supabase = getSupabaseBrowser()!;
    setError(null);
    setNotice(null);

    if (mode !== "reset" && password.length < 8) {
      setError(t("errors.weakPassword"));
      return;
    }
    if (mode === "sign-up" && password !== passwordConfirm) {
      setError(t("errors.passwordMismatch"));
      return;
    }

    setBusy(true);
    try {
      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw new Error("invalid");
        router.push("/account");
      } else if (mode === "sign-up") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/${locale}/account`,
          },
        });
        if (error) throw new Error("generic");
        setNotice(t("checkEmail"));
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/account`,
        });
        if (error) throw new Error("generic");
        setNotice(t("resetSent"));
      }
    } catch (e) {
      setError(
        e instanceof Error && e.message === "invalid"
          ? t("errors.invalidCredentials")
          : t("errors.generic")
      );
    } finally {
      setBusy(false);
    }
  }

  const title =
    mode === "sign-in" ? t("signInTitle") : mode === "sign-up" ? t("signUpTitle") : t("resetTitle");
  const subtitle =
    mode === "sign-in" ? t("signInSubtitle") : mode === "sign-up" ? t("signUpSubtitle") : t("resetText");

  return (
    <div className="mx-auto max-w-md px-4 pb-24 pt-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-ink/5 bg-surface p-8 shadow-card"
      >
        <h1 className="font-display text-3xl text-ink">{title}</h1>
        <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>

        {mode !== "reset" && (
          <>
            <button
              onClick={withGoogle}
              disabled={busy}
              className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-full border border-ink/10 bg-surface text-sm font-medium text-ink transition-all hover:border-ink/30 hover:shadow-soft"
            >
              <GoogleIcon />
              {t("signInWithGoogle")}
            </button>
            <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-ink-faint">
              <span className="h-px flex-1 bg-ink/10" />
              {t("or")}
              <span className="h-px flex-1 bg-ink/10" />
            </div>
          </>
        )}

        <div className="space-y-4">
          <Field label={t("email")}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          {mode !== "reset" && (
            <Field label={t("password")}>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
              />
            </Field>
          )}
          {mode === "sign-up" && (
            <Field label={t("passwordConfirm")}>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                autoComplete="new-password"
              />
            </Field>
          )}
        </div>

        {error && <p className="mt-4 text-sm text-coral">{error}</p>}
        {notice && <p className="mt-4 rounded-xl bg-leaf-soft p-3 text-sm text-leaf">{notice}</p>}

        <Button className="mt-6 w-full" size="lg" onClick={submit} disabled={busy || !email}>
          {mode === "sign-in" ? t("signIn") : mode === "sign-up" ? t("signUp") : t("sendReset")}
        </Button>

        <div className="mt-5 space-y-2 text-center text-sm text-ink-soft">
          {mode === "sign-in" && (
            <>
              <p>
                {t("noAccount")}{" "}
                <Link href="/auth/sign-up" className="font-medium text-gold-deep underline underline-offset-4">
                  {t("signUp")}
                </Link>
              </p>
              <p>
                <Link href="/auth/reset" className="text-ink-faint underline underline-offset-4">
                  {t("forgotPassword")}
                </Link>
              </p>
            </>
          )}
          {mode === "sign-up" && (
            <p>
              {t("haveAccount")}{" "}
              <Link href="/auth/sign-in" className="font-medium text-gold-deep underline underline-offset-4">
                {t("signIn")}
              </Link>
            </p>
          )}
          {mode === "reset" && (
            <p>
              <Link href="/auth/sign-in" className="font-medium text-gold-deep underline underline-offset-4">
                {t("signIn")}
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
