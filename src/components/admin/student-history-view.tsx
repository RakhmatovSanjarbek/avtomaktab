"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "./question-dialog";
import { ArrowLeft, Trophy, Target, TrendingUp } from "lucide-react";

type Result = {
  id: string;
  stageTitle: any;
  stageType: string | null;
  totalQuestions: number;
  score: number;
  timeSpentSec: number;
  createdAt: string;
};

export function StudentHistoryView({ studentId }: { studentId: string }) {
  const { t, locale } = useLanguage();
  const [student, setStudent] = useState<{ fullName: string; phone: string; groupName: string | null } | null>(null);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/students/${studentId}/history`)
      .then((res) => res.json())
      .then((data) => {
        setStudent(data.student ?? null);
        setResults(data.results ?? []);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  function moduleLabel(type: string | null) {
    switch (type) {
      case "VARIANT": return t("studentStats.moduleVariant");
      case "STAGE": return t("studentStats.moduleTopic");
      case "EXAM": return t("studentStats.moduleExam");
      case "TRAINING": return t("studentStats.moduleTraining");
      default: return "—";
    }
  }

  function formatDuration(sec: number) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;

  const totalTests = results.length;
  const avgPct = totalTests > 0
    ? Math.round(results.reduce((sum, r) => sum + r.score / (r.totalQuestions || 1), 0) / totalTests * 100)
    : 0;
  const bestPct = totalTests > 0
    ? Math.round(Math.max(...results.map((r) => r.score / (r.totalQuestions || 1))) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/talabalar" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.adminStudentHistory.backToStudents")}
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{student?.fullName}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{student?.phone} {student?.groupName ? `· ${student.groupName}` : ""}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Target className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <p className="text-2xl font-semibold text-foreground">{totalTests}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("studentStats.totalTests")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <TrendingUp className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <p className="text-2xl font-semibold text-foreground">{avgPct}%</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("studentStats.averageScore")}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Trophy className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <p className="text-2xl font-semibold text-foreground">{bestPct}%</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("studentStats.bestScore")}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">{t("admin.adminStudentHistory.historyTitle")}</h2>
        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">{t("studentStats.colModule")}</th>
                <th className="px-4 py-3">{t("studentStats.colDate")}</th>
                <th className="px-4 py-3">{t("studentStats.colScore")}</th>
                <th className="px-4 py-3">{t("studentStats.colDuration")}</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">{t("studentStats.empty")}</td></tr>
              ) : (
                results.map((r) => {
                  const pct = Math.round((r.score / (r.totalQuestions || 1)) * 100);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">
                        {r.stageTitle ? textFor(r.stageTitle, locale) : moduleLabel(r.stageType)}
                        <span className="ml-1.5 text-xs text-muted-foreground">({moduleLabel(r.stageType)})</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {new Date(r.createdAt).toLocaleString(locale === "ru" ? "ru-RU" : "uz-UZ")}
                      </td>
                      <td className="px-4 py-3">
                        <span className={"font-semibold " + (pct >= 70 ? "text-green-600 dark:text-green-400" : "text-destructive")}>
                          {r.score}/{r.totalQuestions} ({pct}%)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDuration(r.timeSpentSec)}</td>
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
