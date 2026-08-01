"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/components/admin/question-dialog";
import { Layers, ChevronRight } from "lucide-react";

type Topic = { id: string; titleJson: any; questionsCount: number };

export function TopicsListStudent() {
  const { t, locale } = useLanguage();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bosqichli")
      .then((res) => res.json())
      .then((data) => setTopics(data.topics ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (topics.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{t("studentBosqichli.empty")}</p>;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {topics.map((tp) => (
        <Link
          key={tp.id}
          href={`/student/bosqichli-test/${tp.id}`}
          className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/50"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Layers className="h-5 w-5 text-primary" strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">{textFor(tp.titleJson, locale)}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{tp.questionsCount} savol</p>
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>
      ))}
    </div>
  );
}
