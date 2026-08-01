"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLanguage } from "@/i18n/language-provider";

export function AdminHeader({ fullName }: { fullName: string }) {
  const { t } = useLanguage();

  return (
    <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">{fullName}</p>
        <p className="text-xs text-muted-foreground">{t("topbar.admin")}</p>
      </div>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label={t("topbar.logout")}
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
