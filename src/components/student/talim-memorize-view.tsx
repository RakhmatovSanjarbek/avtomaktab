"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/components/admin/question-dialog";
import { ArrowLeft, CheckCircle2, Play } from "lucide-react";
import { enterFullscreen } from "@/lib/fullscreen";

type Option = { id: string; optionTextJson: any; isCorrect: boolean };
type Question = { id: string; textJson: any; explanationJson: any; imageUrl: string | null; options: Option[] };

export function TalimMemorizeView({ stageId }: { stageId: string }) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/talim/${stageId}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(textFor(data.stage?.titleJson, locale));
        setQuestions(data.stage?.questions ?? []);
      })
      .finally(() => setLoading(false));
  }, [stageId, locale]);

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;

  return (
    <div className="space-y-6 pb-28">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("studentTalim.backToStage")}
        </button>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("studentTalim.memorizeDesc")}</p>
      </div>

      {questions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("studentTalim.questionsEmpty")}</p>
      ) : (
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
                  {q.explanationJson && textFor(q.explanationJson, locale) && (
                    <p className="text-xs text-muted-foreground">{textFor(q.explanationJson, locale)}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl justify-center">
            <Link
              href={`/student/talim/${stageId}/test`}
              onClick={() => enterFullscreen()}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
            >
              <Play className="h-4 w-4" />
              {t("studentTalim.startTestButton")}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
