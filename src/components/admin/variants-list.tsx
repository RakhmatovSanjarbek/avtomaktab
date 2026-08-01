"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { Plus, FileQuestion, Trash2, X, ChevronRight } from "lucide-react";

type Variant = { id: string; titleJson: any; questionsCount: number };

export function VariantsList() {
  const { t, locale } = useLanguage();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/variants");
      const data = await res.json();
      setVariants(data.variants ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function titleFor(v: Variant) {
    const map: Record<string, string> = { "uz-latin": "uzLatin", "uz-cyrl": "uzCyrl", ru: "ru" };
    return v.titleJson?.[map[locale]] ?? v.titleJson?.uzLatin ?? "";
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("admin.questions.deleteVariantConfirm"))) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/variants/${id}`, { method: "DELETE" });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          {t("admin.questions.addVariantButton")}
        </button>
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground py-8">{t("common.loading")}</p>
      ) : variants.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-8">{t("admin.questions.empty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {variants.map((v) => (
            <div key={v.id} className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm">
              <Link href={`/admin/savollar/${v.id}`} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <FileQuestion className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{titleFor(v)}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {v.questionsCount} {t("admin.questions.questionsCountSuffix")}
                  </p>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
              <button
                type="button"
                disabled={busyId === v.id}
                onClick={() => handleDelete(v.id)}
                className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
            </div>
          ))}
        </div>
      )}

      {dialogOpen && (
        <AddVariantDialog
          onClose={() => setDialogOpen(false)}
          onCreated={() => { setDialogOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function AddVariantDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api/admin/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    onCreated();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{t("admin.questions.variantDialogTitle")}</h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.questions.variantNameLabel")}</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Variant 1"
              required
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary">
              {t("common.cancel")}
            </button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
