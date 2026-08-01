"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { ArrowLeft, Plus, Pencil, Trash2, ImageIcon, CheckCircle2 } from "lucide-react";
import { QuestionDialog, QuestionData, textFor } from "./question-dialog";

export function QuestionsList({ variantId }: { variantId: string }) {
  const { t, locale } = useLanguage();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionData | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/variants/${variantId}`);
      const data = await res.json();
      setTitle(textFor(data.variant?.titleJson, locale));
      setQuestions(data.variant?.questions ?? []);
    } finally {
      setLoading(false);
    }
  }, [variantId, locale]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!window.confirm(t("admin.questions.deleteConfirm"))) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/savollar" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.questions.backToVariants")}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <button type="button" onClick={() => setDialogOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            {t("admin.questions.addQuestionButton")}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : questions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.questions.emptyQuestions")}</p>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-muted-foreground">{idx + 1}</span>
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-medium text-foreground">{textFor(q.textJson, locale)}</p>
                  {q.imageUrl && <img src={q.imageUrl} alt="" className="h-24 w-auto rounded-lg border border-border object-cover" />}
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {q.options.map((o, i) => (
                      <div key={i} className={"flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs " + (o.isCorrect ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground")}>
                        {o.isCorrect && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                        {textFor(o.optionTextJson, locale)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 gap-1.5">
                  <button type="button" onClick={() => setEditTarget(q)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button type="button" disabled={busyId === q.id} onClick={() => handleDelete(q.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {dialogOpen && (
        <QuestionDialog addUrl={`/api/admin/variants/${variantId}/questions`} onClose={() => setDialogOpen(false)} onDone={() => { setDialogOpen(false); load(); }} />
      )}
      {editTarget && (
        <QuestionDialog addUrl="" question={editTarget} onClose={() => setEditTarget(null)} onDone={() => { setEditTarget(null); load(); }} />
      )}
    </div>
  );
}
