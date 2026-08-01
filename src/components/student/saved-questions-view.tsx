"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/lib/text-for";
import { CheckCircle2, Bookmark } from "lucide-react";

type Option = { id: string; optionTextJson: any; isCorrect: boolean };
type Question = { id: string; textJson: any; imageUrl: string | null; options: Option[] };

export function SavedQuestionsView() {
  const { t, locale } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/student/saved-questions")
      .then((res) => res.json())
      .then((data) => setQuestions(data.questions ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleRemove(questionId: string) {
    setBusyId(questionId);
    try {
      await fetch("/api/saved-questions/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (questions.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{t("studentSaved.empty")}</p>;

  return (
    <div className="space-y-3">
      {questions.map((q, idx) => (
        <div key={q.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-muted-foreground">
              {idx + 1}
            </span>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-foreground">{textFor(q.textJson, locale)}</p>
              {q.imageUrl && <img src={q.imageUrl} alt="" className="h-24 w-auto rounded-lg border border-border object-cover" />}
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {q.options.map((o, i) => (
                  <div
                    key={i}
                    className={
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs " +
                      (o.isCorrect
                        ? "bg-green-500/10 text-green-700 dark:text-green-400 font-medium ring-1 ring-green-500/20"
                        : "bg-secondary/50 text-muted-foreground")
                    }
                  >
                    {o.isCorrect && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                    {textFor(o.optionTextJson, locale)}
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              disabled={busyId === q.id}
              onClick={() => handleRemove(q.id)}
              className="flex shrink-0 items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-400/20 disabled:opacity-40 dark:text-amber-400"
            >
              <Bookmark className="h-3.5 w-3.5" fill="currentColor" />
              {t("studentSaved.removeButton")}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
