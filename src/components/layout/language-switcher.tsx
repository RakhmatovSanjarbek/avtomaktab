"use client";

import { useLanguage } from "@/i18n/language-provider";
import { localeOptions } from "@/i18n/dictionaries";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
      {localeOptions.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          className={
            "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors " +
            (locale === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground")
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
