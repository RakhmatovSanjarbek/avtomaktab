"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/lib/text-for";
import { CheckCircle2, AlertTriangle, Play, Loader2 } from "lucide-react";
import { enterFullscreen } from "@/lib/fullscreen";

type Option = { id: string; optionTextJson: any; isCorrect: boolean };
type Question = { id: string; textJson: any; imageUrl: string | null; options: Option[] };
type MistakeItem = { question: Question; mistakeCount: number };

export function MistakesView() {
  const { t, locale } = useLanguage();
  const [items, setItems] = useState<MistakeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/student/mistakes")
      .then((res) => res.json())
      .then((data) => setItems(data.mistakes ?? []))
      .finally(() => setLoading(false));
  }, []);

  function startPractice() {
    enterFullscreen();
    setStarting(true);
    window.location.href = "/student/profil/xatolar/test";
  }

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;
  if (items.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{t("studentMistakes.empty")}</p>;

  return (
    <div className="space-y-6 pb-24">
      <div className="space-y-3">
        {items.map(({ question: q, mistakeCount }, idx) => (
          <div key={q.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-muted-foreground">
                {idx + 1}
              </span>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{textFor(q.textJson, locale)}</p>
                  <span className="flex shrink-0 items-center gap-1 rounded-lg bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    {mistakeCount} {t("studentMistakes.mistakeCountLabel")}
                  </span>
                </div>
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
            </div>
          </div>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
        <div className="mx-auto flex max-w-3xl justify-center">
          <button
            type="button"
            disabled={starting}
            onClick={startPractice}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-50"
          >
            {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {t("studentMistakes.startTestButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
