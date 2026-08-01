"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { ArrowLeft, Plus, Trash2, X, CheckCircle2, Link2, Search, Image as ImageIcon, Check } from "lucide-react";
import { QuestionDialog, QuestionData, textFor } from "./question-dialog";

export function TopicDetail({ topicId }: { topicId: string }) {
  const { t, locale } = useLanguage();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [qDialogOpen, setQDialogOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/topics/${topicId}`);
      const data = await res.json();
      setTitle(textFor(data.topic?.titleJson, locale));
      setQuestions(data.topic?.questions ?? []);
    } finally { setLoading(false); }
  }, [topicId, locale]);

  useEffect(() => { load(); }, [load]);

  async function handleUnlink(questionId: string) {
    setBusyId(questionId);
    try {
      await fetch(`/api/admin/topics/${topicId}/link`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId }),
      });
      load();
    } finally { setBusyId(null); }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/bosqichli" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.bosqichli.backToTopics")}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          <div className="flex gap-2">
            <button type="button" onClick={() => setLinkDialogOpen(true)} className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground hover:bg-secondary">
              <Link2 className="h-4 w-4" strokeWidth={1.75} />
              {t("admin.bosqichli.linkQuestionsButton")}
            </button>
            <button type="button" onClick={() => setQDialogOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              {t("admin.questions.addQuestionButton")}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{t("admin.bosqichli.linkedQuestionsTitle")}</h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : questions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.bosqichli.linkedEmpty")}</p>
        ) : (
          <div className="space-y-3">
            {questions.map((q, idx) => (
              <div key={q.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-muted-foreground">{idx + 1}</span>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">{textFor(q.textJson, locale)}</p>
                    {q.imageUrl && <img src={q.imageUrl} alt="" className="h-20 w-auto rounded-lg border border-border object-cover" />}
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {q.options.map((o, i) => (
                        <div key={i} className={"flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs " + (o.isCorrect ? "bg-primary/10 text-primary" : "bg-secondary/50 text-muted-foreground")}>
                          {o.isCorrect && <CheckCircle2 className="h-3 w-3 shrink-0" />}
                          {textFor(o.optionTextJson, locale)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button type="button" disabled={busyId === q.id} onClick={() => handleUnlink(q.id)}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {linkDialogOpen && <LinkQuestionsDialog topicId={topicId} onClose={() => setLinkDialogOpen(false)} onDone={() => { setLinkDialogOpen(false); load(); }} />}
      {qDialogOpen && <QuestionDialog addUrl={`/api/admin/topics/${topicId}/questions`} onClose={() => setQDialogOpen(false)} onDone={() => { setQDialogOpen(false); load(); }} />}
    </div>
  );
}

function LinkQuestionsDialog({ topicId, onClose, onDone }: { topicId: string; onClose: () => void; onDone: () => void }) {
  const { t, locale } = useLanguage();
  const [bank, setBank] = useState<(QuestionData & { isLinked: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initiallyLinked, setInitiallyLinked] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/bank?topicId=${topicId}`);
      const data = await res.json();
      const items: (QuestionData & { isLinked: boolean })[] = data.questions ?? [];
      setBank(items);
      const linkedIds = new Set(items.filter((q) => q.isLinked).map((q) => q.id));
      setSelected(new Set(linkedIds));
      setInitiallyLinked(linkedIds);
    } finally { setLoading(false); }
  }, [topicId]);

  useEffect(() => { load(); }, [load]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    const toLink = [...selected].filter((id) => !initiallyLinked.has(id));
    const toUnlink = [...initiallyLinked].filter((id) => !selected.has(id));

    await Promise.all([
      ...toLink.map((questionId) =>
        fetch(`/api/admin/topics/${topicId}/link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId }),
        })
      ),
      ...toUnlink.map((questionId) =>
        fetch(`/api/admin/topics/${topicId}/link`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId }),
        })
      ),
    ]);

    setSaving(false);
    onDone();
  }

  const filtered = bank.filter((q) => textFor(q.textJson, locale).toLowerCase().includes(search.toLowerCase()));
  const selectedCount = selected.size;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{t("admin.bosqichli.linkDialogTitle")}</h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("admin.bosqichli.searchPlaceholder")}
            className="w-full rounded-xl border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
        </div>

        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{filtered.length} / {bank.length}</span>
          <span className="font-medium text-primary">{selectedCount} tanlandi</span>
        </div>

        <div className="flex-1 space-y-1.5 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.bosqichli.bankEmpty")}</p>
          ) : (
            filtered.map((q) => {
              const isChecked = selected.has(q.id);
              return (
                <label
                  key={q.id}
                  className={
                    "flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-colors " +
                    (isChecked ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50")
                  }
                >
                  <input type="checkbox" checked={isChecked} onChange={() => toggle(q.id)} className="hidden" />
                  <div
                    className={
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors " +
                      (isChecked ? "border-primary bg-primary" : "border-border")
                    }
                  >
                    {isChecked && <Check className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={3} />}
                  </div>
                  {q.imageUrl ? (
                    <img src={q.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover" />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                  <p className="flex-1 text-sm text-foreground line-clamp-2">{textFor(q.textJson, locale)}</p>
                </label>
              );
            })
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onClose} disabled={saving} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50">
            {t("common.cancel")}
          </button>
          <button type="button" onClick={handleSave} disabled={saving} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
            {saving ? t("common.loading") : t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}
