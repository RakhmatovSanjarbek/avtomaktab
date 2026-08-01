"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, Locale } from "./dictionaries";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const COOKIE_NAME = "app_locale";

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax`;
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale ?? "uz-latin");

  useEffect(() => {
    const stored = readCookie(COOKIE_NAME) as Locale | null;
    if (stored && dictionaries[stored]) {
      setLocaleState(stored);
    } else if (initialLocale) {
      writeCookie(COOKIE_NAME, initialLocale);
    }
  }, [initialLocale]);

  const setLocale = useCallback(
    (l: Locale) => {
      setLocaleState(l);
      writeCookie(COOKIE_NAME, l);
      fetch("/api/user/language", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: l }),
      }).catch(() => {});
      // To'liq reload emas — faqat server komponentlarni yumshoq yangilaydi
      router.refresh();
    },
    [router]
  );

  const t = useCallback(
    (key: string) => {
      const dict = dictionaries[locale] as any;
      const value = key.split(".").reduce((acc, part) => (acc ? acc[part] : undefined), dict);
      return typeof value === "string" ? value : key;
    },
    [locale]
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
