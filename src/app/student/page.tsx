import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import {
  BookOpen,
  ListChecks,
  Layers,
  Trophy,
  Bookmark,
  XCircle,
  ChevronRight,
  BarChart3,
  Sparkles,
  Target,
  Flame,
} from "lucide-react";

function getGreeting(locale: string) {
  const hour = new Date().getHours();
  const map: Record<string, [string, string, string]> = {
    "uz-latin": ["Xayrli tong", "Xayrli kun", "Xayrli kech"],
    "uz-cyrl": ["Хайрли тонг", "Хайрли кун", "Хайрли кеч"],
    ru: ["Доброе утро", "Добрый день", "Добрый вечер"],
  };
  const [morning, day, evening] = map[locale] ?? map["uz-latin"];
  if (hour < 11) return morning;
  if (hour < 18) return day;
  return evening;
}

export default async function StudentDashboardPage() {
  const session = await auth();
  const userId = (session?.user as any)?.id as string;
  const locale = await getLocaleServer((session?.user as any)?.preferredLang);
  const dict = getDictionary(locale);
  const fullName = session?.user?.name ?? "";

  const [savedCount, mistakeCount, testResults] = await Promise.all([
    prisma.savedQuestion.count({ where: { userId } }),
    prisma.userMistake.count({ where: { userId, isResolved: false } }),
    prisma.testResult.findMany({
      where: { userId },
      select: { score: true, totalQuestions: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const testsTaken = testResults.length;
  const avgPct =
    testsTaken > 0
      ? Math.round(
          (testResults.reduce((sum, r) => sum + r.score / (r.totalQuestions || 1), 0) / testsTaken) * 100
        )
      : null;

  const modules = [
    {
      href: "/student/talim",
      icon: BookOpen,
      ...dict.dashboard.modules.talim,
      accent: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    },
    {
      href: "/student/variantli-test",
      icon: ListChecks,
      ...dict.dashboard.modules.variantli,
      accent: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    },
    {
      href: "/student/bosqichli-test",
      icon: Layers,
      ...dict.dashboard.modules.bosqichli,
      accent: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      href: "/student/yakuniy-imtihon",
      icon: Trophy,
      ...dict.dashboard.modules.yakuniy,
      accent: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
  ];

  const profileLinks = [
    { href: "/student/statistika", icon: BarChart3, title: "Statistika", count: null },
    { href: "/student/profil/saqlangan", icon: Bookmark, title: dict.dashboard.saved, count: savedCount },
    { href: "/student/profil/xatolar", icon: XCircle, title: dict.dashboard.mistakes, count: mistakeCount },
  ];

  return (
    <div className="space-y-10">
      {/* HERO / SALOMLASHUV */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-violet-600 px-6 py-8 text-white shadow-lg sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative">
          <div className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-white/70">
            <Sparkles className="h-3.5 w-3.5" />
            {getGreeting(locale)}
          </div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{fullName || dict.dashboard.welcome}</h1>
          <p className="mt-1.5 max-w-md text-sm text-white/80">{dict.dashboard.welcomeDesc}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <Target className="h-5 w-5 text-white/80" strokeWidth={1.75} />
              <div>
                <p className="text-lg font-semibold leading-none">{testsTaken}</p>
                <p className="mt-1 text-[11px] text-white/70">Topshirilgan testlar</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <Flame className="h-5 w-5 text-white/80" strokeWidth={1.75} />
              <div>
                <p className="text-lg font-semibold leading-none">{avgPct !== null ? `${avgPct}%` : "—"}</p>
                <p className="mt-1 text-[11px] text-white/70">O'rtacha natija</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODULLAR */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Test modullari</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${m.accent}`}>
                <m.icon className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{m.title}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{m.desc}</p>
              </div>
              <ChevronRight className="mt-1.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* SHAXSIY KABINET */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">{dict.dashboard.profileTitle}</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {profileLinks.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                <p.icon className="h-4.5 w-4.5 text-muted-foreground" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">{p.title}</h3>
                {p.count !== null && (
                  <p className="text-xs text-muted-foreground">
                    {p.count} {dict.dashboard.questionsCountSuffix}
                  </p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
