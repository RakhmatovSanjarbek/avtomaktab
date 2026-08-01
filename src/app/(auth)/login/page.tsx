"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useLanguage } from "@/i18n/language-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GraduationCap, AlertCircle, Loader2, Eye, EyeOff, Send, Phone } from "lucide-react";

const ADMIN_TELEGRAM = "https://t.me/avtomaktab_admin";
const ADMIN_PHONE = "+998901234567";

export default function LoginPage() {
  const router = useRouter();
  const deviceId = useDeviceId();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Avval maxsus tekshiruv — aniq xato sababini olish uchun
    const precheckRes = await fetch("/api/auth/precheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password, deviceId }),
    });
    const precheck = await precheckRes.json();

    if (!precheck.ok) {
      setLoading(false);
      if (precheck.code === "RATE_LIMITED") {
        const minutes = Math.max(Math.ceil((precheck.retryAfterSec ?? 0) / 60), 1);
        setError(t("auth.errorRateLimited").replace("{minutes}", String(minutes)));
      } else if (precheck.code === "DEVICE_MISMATCH") {
        setError(t("auth.errorDeviceMismatch"));
      } else {
        setError(t("auth.errorInvalid"));
      }
      return;
    }

    const result = await signIn("credentials", {
      phone,
      password,
      deviceId,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError(t("auth.errorInvalid"));
      return;
    }

    const session = await getSession();
    const role = (session?.user as any)?.role;

    setLoading(false);
    router.push(role === "ADMIN" ? "/admin" : "/student");
    router.refresh();
  }

  function openTelegram() {
    window.open(ADMIN_TELEGRAM, "_blank", "noopener,noreferrer");
  }

  function callAdmin() {
    window.location.href = "tel:" + ADMIN_PHONE;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <GraduationCap className="h-7 w-7 text-primary" strokeWidth={1.75} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{t("auth.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.phoneLabel")}
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("auth.phonePlaceholder")}
                required
                className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/50"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                {t("auth.passwordLabel")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 pr-10 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  aria-label="toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 px-3.5 py-2.5">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={1.75} />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !deviceId}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t("auth.loggingIn") : t("auth.loginButton")}
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground">{t("auth.noAccount")}</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openTelegram}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
            >
              <Send className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              Telegram
            </button>
            <button
              type="button"
              onClick={callAdmin}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
            >
              <Phone className="h-3.5 w-3.5 text-primary" strokeWidth={1.75} />
              {ADMIN_PHONE}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
