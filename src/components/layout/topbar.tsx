"use client";

import { signOut } from "next-auth/react";
import { LogOut, GraduationCap } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "./theme-toggle";
import { useLanguage } from "@/i18n/language-provider";

export function Topbar({
  fullName,
  role,
}: {
  fullName: string;
  role: string;
}) {
  const { t } = useLanguage();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <span className="text-sm font-semibold text-foreground">Avtomaktab</span>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-foreground">{fullName}</p>
            <p className="text-xs text-muted-foreground">
              {role === "ADMIN" ? t("topbar.admin") : t("topbar.student")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label={t("topbar.logout")}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </header>
  );
}
