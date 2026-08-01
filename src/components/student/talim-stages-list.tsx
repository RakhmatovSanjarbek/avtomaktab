"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/components/admin/question-dialog";
import { BookOpen, ChevronRight } from "lucide-react";

type Stage = { id: string; titleJson: any; descJson: any; questionsCount: number; materialsCount: number };

export function TalimStagesList() {
  const { t, locale } = useLanguage();
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/talim")
      .then((res) => res.json())
      .then((data) => setStages(data.stages ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (stages.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{t("studentTalim.empty")}</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stages.map((s) => (
        <Link
          key={s.id}
          href={`/student/talim/${s.id}`}
          className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{textFor(s.titleJson, locale)}</h3>
            {s.descJson && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{textFor(s.descJson, locale)}</p>}
            <p className="mt-1 text-xs text-muted-foreground">{s.questionsCount} savol · {s.materialsCount} material</p>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
