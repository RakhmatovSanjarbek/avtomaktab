"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useDeviceId } from "@/hooks/useDeviceId";
import { useLanguage } from "@/i18n/language-provider";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { GraduationCap, AlertCircle, Loader2, Eye, EyeOff, Send, Phone, Camera, MessageCircle } from "lucide-react";

type SiteContact = {
  adminPhone: string | null;
  adminTelegram: string | null;
  instagramUrl: string | null;
  telegramChannel: string | null;
};

export default function LoginPage() {
  const router = useRouter();
  const deviceId = useDeviceId();
  const { t } = useLanguage();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState<SiteContact>({
    adminPhone: null,
    adminTelegram: null,
    instagramUrl: null,
    telegramChannel: null,
  });

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setContact({
            adminPhone: data.settings.adminPhone,
            adminTelegram: data.settings.adminTelegram,
            instagramUrl: data.settings.instagramUrl,
            telegramChannel: data.settings.telegramChannel,
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

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

  function openLink(url: string | null) {
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  function callAdmin() {
    if (contact.adminPhone) window.location.href = "tel:" + contact.adminPhone;
  }

  const links = [
    contact.adminTelegram && { icon: Send, label: "Telegram", onClick: () => openLink(contact.adminTelegram) },
    contact.adminPhone && { icon: Phone, label: contact.adminPhone, onClick: callAdmin },
    contact.instagramUrl && { icon: Camera, label: "Instagram", onClick: () => openLink(contact.instagramUrl) },
    contact.telegramChannel && { icon: MessageCircle, label: "Kanal", onClick: () => openLink(contact.telegramChannel) },
  ].filter(Boolean) as { icon: any; label: string; onClick: () => void }[];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="absolute right-5 top-5 flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10">
            <GraduationCap className="h-8 w-8 text-primary" strokeWidth={1.6} />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">{t("auth.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("auth.subtitle")}</p>
        </div>

        <div className="rounded-[2rem] border border-border bg-card p-9 shadow-xl shadow-black/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-foreground">
                {t("auth.phoneLabel")}
              </label>
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("auth.phonePlaceholder")}
                required
                className="w-full rounded-2xl border border-input bg-background px-5 py-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-ring/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-foreground">
                {t("auth.passwordLabel")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-input bg-background px-5 py-3.5 pr-12 text-base text-foreground outline-none transition-colors focus:border-primary focus:ring-4 focus:ring-ring/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground"
                  aria-label="toggle password"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" strokeWidth={1.75} />
                  ) : (
                    <Eye className="h-5 w-5" strokeWidth={1.75} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-2xl bg-destructive/10 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" strokeWidth={1.75} />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !deviceId}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3.5 text-base font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:opacity-90 hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? t("auth.loggingIn") : t("auth.loginButton")}
            </button>
          </form>
        </div>

        {links.length > 0 && (
          <div className="mt-8 flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/70">{t("auth.noAccount")}</p>
            <div className="flex items-center gap-3">
              {links.map((link, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={link.onClick}
                  title={link.label}
                  aria-label={link.label}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary hover:shadow-md"
                >
                  <link.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
