import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { textFor } from "@/lib/text-for";
import { Users, FileQuestion, ClipboardCheck, Percent, ChevronRight } from "lucide-react";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export default async function AdminDashboardPage() {
  const session = await auth();
  const locale = await getLocaleServer((session?.user as any)?.preferredLang);
  const dict = getDictionary(locale);

  const [totalStudents, totalQuestions, testResults] = await Promise.all([
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.stageQuestion.findMany({
      where: { stage: { type: "VARIANT" } },
      select: { questionId: true },
      distinct: ["questionId"],
    }).then((rows) => rows.length),
    prisma.testResult.findMany({
      select: {
        score: true,
        totalQuestions: true,
        createdAt: true,
        stageId: true,
        user: { select: { fullName: true } },
        stage: { select: { titleJson: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const testsTaken = testResults.length;
  const averageScorePct =
    testsTaken > 0
      ? Math.round(
          (testResults.reduce((sum, r) => sum + r.score / (r.totalQuestions || 1), 0) / testsTaken) * 100
        )
      : 0;

  // Haftalik faollik (oxirgi 7 kun)
  const today = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString(locale === "ru" ? "ru-RU" : "uz-UZ", { day: "2-digit", month: "2-digit" });
    const count = testResults.filter((r) => {
      const rd = new Date(r.createdAt);
      return rd.toDateString() === d.toDateString();
    }).length;
    return { day: dayStr, count };
  });

  // Natijalar taqsimoti
  const passCount = testResults.filter((r) => r.score / (r.totalQuestions || 1) >= 0.7).length;
  const failCount = testsTaken - passCount;
  const distributionData = [
    { name: dict.admin.passLabel, value: passCount, color: "#22c55e" },
    { name: dict.admin.failLabel, value: failCount, color: "#ef4444" },
  ];

  // Eng faol variantlar/bosqichlar (top 5)
  const stageCounts = new Map<string, { title: string; count: number }>();
  for (const r of testResults) {
    if (!r.stage) continue;
    const key = r.stageId!;
    const title = textFor(r.stage.titleJson, locale);
    const existing = stageCounts.get(key);
    stageCounts.set(key, { title, count: (existing?.count ?? 0) + 1 });
  }
  const topVariants = [...stageCounts.values()].sort((a, b) => b.count - a.count).slice(0, 5);

  // So'nggi natijalar (10 ta)
  const recent = testResults.slice(0, 10);

  const stats = [
    { icon: Users, label: dict.admin.stats.totalStudents, value: totalStudents, href: "/admin/talabalar" },
    { icon: FileQuestion, label: dict.admin.stats.totalQuestions, value: totalQuestions, href: "/admin/savollar" },
    { icon: ClipboardCheck, label: dict.admin.stats.testsTaken, value: testsTaken, href: "#recent-results" },
    { icon: Percent, label: dict.admin.stats.averageScore, value: `${averageScorePct}%`, href: "#score-chart" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.overviewTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{dict.admin.overviewDesc}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/40"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-2xl font-semibold text-foreground">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </Link>
        ))}
      </div>

      <DashboardCharts
        weeklyData={weeklyData}
        distributionData={distributionData}
        topVariants={topVariants}
        weeklyTitle={dict.admin.weeklyActivity}
        scoreTitle={dict.admin.scoreDistribution}
        variantsTitle={dict.admin.topVariants}
        noDataText={dict.admin.noData}
      />

      <div id="recent-results" className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">{dict.admin.recentResults}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-5 py-3">{dict.admin.colStudent}</th>
                <th className="px-5 py-3">{dict.admin.colModule}</th>
                <th className="px-5 py-3">{dict.admin.colScore}</th>
                <th className="px-5 py-3">{dict.admin.colDate}</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">{dict.admin.noData}</td></tr>
              ) : (
                recent.map((r, i) => {
                  const pct = Math.round((r.score / (r.totalQuestions || 1)) * 100);
                  return (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-5 py-3 font-medium text-foreground">{r.user.fullName}</td>
                      <td className="px-5 py-3 text-muted-foreground">{r.stage ? textFor(r.stage.titleJson, locale) : "—"}</td>
                      <td className="px-5 py-3">
                        <span className={"font-semibold " + (pct >= 70 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                          {r.score}/{r.totalQuestions} ({pct}%)
                        </span>
                      </td>
                      <td className="px-5 py-3 text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString(locale === "ru" ? "ru-RU" : "uz-UZ")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
