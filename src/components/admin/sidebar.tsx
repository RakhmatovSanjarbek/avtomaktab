"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, FileQuestion, BookOpen, Layers, GraduationCap, Settings } from "lucide-react";
import { useLanguage } from "@/i18n/language-provider";

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const items = [
    { href: "/admin", icon: LayoutDashboard, label: t("admin.nav.dashboard") },
    { href: "/admin/talabalar", icon: Users, label: t("admin.nav.students") },
    { href: "/admin/savollar", icon: FileQuestion, label: t("admin.bosqichli.title") === t("admin.bosqichli.title") ? t("admin.questions.title") : t("admin.nav.questions") },
    { href: "/admin/talim", icon: BookOpen, label: t("admin.talim.title") },
    { href: "/admin/bosqichli", icon: Layers, label: t("admin.bosqichli.title") },
    { href: "/admin/sozlamalar", icon: Settings, label: t("admin.settings.title") },
  ];

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <GraduationCap className="h-4 w-4 text-primary" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Avtomaktab</p>
          <p className="text-[11px] text-muted-foreground">{t("admin.panelTitle")}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const isActive =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors " +
                (isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground")
              }
            >
              <item.icon className="h-4 w-4" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
