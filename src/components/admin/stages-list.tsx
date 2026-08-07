"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { localeOptions } from "@/i18n/dictionaries";
import { BookOpen, Plus, Trash2, X, ChevronRight, FileQuestion, Image as ImageIcon, Pencil } from "lucide-react";
import { latinToCyrillic } from "@/lib/uzbek-transliterate";

type Stage = { id: string; titleJson: any; descJson: any; questionsCount: number; materialsCount: number };
const LOCALE_KEY: Record<string, string> = { "uz-latin": "uzLatin", "uz-cyrl": "uzCyrl", ru: "ru" };
function textFor(json: any, locale: string) {
  if (!json) return "";
  return json[LOCALE_KEY[locale]] ?? json.uzLatin ?? "";
}

type LangForm = { name: string; description: string };
function emptyLangForm(): LangForm {
  return { name: "", description: "" };
}

export function StagesList() {
  const { t, locale } = useLanguage();
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stages");
      const data = await res.json();
      setStages(data.stages ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id: string) {
    if (!window.confirm(t("admin.talim.deleteStageConfirm"))) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/stages/${id}`, { method: "DELETE" });
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
          onClick={() => { setEditingStage(null); setDialogOpen(true); }}
          className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={1.75} />
          {t("admin.talim.addStageButton")}
        </button>
      </div>

      {loading ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
      ) : stages.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{t("admin.talim.stagesEmpty")}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((s) => (
            <div key={s.id} className="group relative rounded-2xl border border-border bg-card p-5 shadow-sm">
              <Link href={`/admin/talim/${s.id}`} className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <BookOpen className="h-5 w-5 text-primary" strokeWidth={1.75} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">{textFor(s.titleJson, locale)}</h3>
                  {s.descJson && <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{textFor(s.descJson, locale)}</p>}
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><FileQuestion className="h-3 w-3" />{s.questionsCount}</span>
                    <span className="flex items-center gap-1"><ImageIcon className="h-3 w-3" />{s.materialsCount}</span>
                  </div>
                </div>
                <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </Link>
              <div className="absolute right-3 top-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => { setEditingStage(s); setDialogOpen(true); }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
                <button
                  type="button"
                  disabled={busyId === s.id}
                  onClick={() => handleDelete(s.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {dialogOpen && (
        <StageDialog
          stage={editingStage}
          onClose={() => setDialogOpen(false)}
          onSaved={() => { setDialogOpen(false); load(); }}
        />
      )}
    </div>
  );
}

function StageDialog({
  stage,
  onClose,
  onSaved,
}: {
  stage: Stage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { t } = useLanguage();
  const isEdit = !!stage;

  const [activeTab, setActiveTab] = useState<"uz-latin" | "uz-cyrl" | "ru">("uz-latin");
  const [langs, setLangs] = useState<Record<string, LangForm>>(() => {
    const base: Record<string, LangForm> = { "uz-latin": emptyLangForm(), "uz-cyrl": emptyLangForm(), ru: emptyLangForm() };
    if (stage) {
      (["uz-latin", "uz-cyrl", "ru"] as const).forEach((loc) => {
        base[loc] = { name: textFor(stage.titleJson, loc), description: stage.descJson ? textFor(stage.descJson, loc) : "" };
      });
    }
    return base;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const autoGenRef = useState<Record<string, string>>({})[0];

  function updateField(field: "name" | "description", value: string) {
    let cyrOverride: string | null = null;
    if (activeTab === "uz-latin") {
      const key = `field-${field}`;
      const currentCyr = langs["uz-cyrl"][field];
      const wasUntouched = !currentCyr || currentCyr === autoGenRef[key];
      if (wasUntouched) {
        cyrOverride = latinToCyrillic(value);
        autoGenRef[key] = cyrOverride;
      }
    }
    setLangs((prev) => {
      const next = { ...prev, [activeTab]: { ...prev[activeTab], [field]: value } };
      if (cyrOverride !== null) {
        next["uz-cyrl"] = { ...next["uz-cyrl"], [field]: cyrOverride };
      }
      return next;
    });
  }

  function handleCyrRegenerate() {
    setLangs((prev) => {
      const genName = latinToCyrillic(prev["uz-latin"].name);
      const genDesc = latinToCyrillic(prev["uz-latin"].description);
      autoGenRef["field-name"] = genName;
      autoGenRef["field-description"] = genDesc;
      return { ...prev, "uz-cyrl": { name: genName, description: genDesc } };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!langs["uz-latin"].name.trim()) {
      setError(t("admin.questions.saveError"));
      return;
    }

    setSubmitting(true);
    const titleJson = { uzLatin: langs["uz-latin"].name, uzCyrl: langs["uz-cyrl"].name, ru: langs["ru"].name };
    const hasDesc = (["uz-latin", "uz-cyrl", "ru"] as const).some((loc) => langs[loc].description.trim());
    const descJson = hasDesc
      ? { uzLatin: langs["uz-latin"].description, uzCyrl: langs["uz-cyrl"].description, ru: langs["ru"].description }
      : null;

    const url = isEdit ? `/api/admin/stages/${stage!.id}` : "/api/admin/stages";
    const method = isEdit ? "PATCH" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titleJson, descJson }),
    });
    onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{t("admin.talim.stageDialogTitle")}</h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-2 flex gap-1 rounded-xl border border-border bg-background p-1">
          {localeOptions.map((opt) => (
            <button key={opt.value} type="button" onClick={() => setActiveTab(opt.value)}
              className={"flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors " + (activeTab === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>
              {opt.label}
            </button>
          ))}
        </div>

        {activeTab === "uz-cyrl" && (
          <button type="button" onClick={handleCyrRegenerate} className="mb-3 text-xs font-medium text-primary hover:opacity-80">
            ↻ Lotin asosida qayta hosil qilish
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.talim.stageNameLabel")}</label>
            <input
              value={langs[activeTab].name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="1-bosqich"
              className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.talim.stageDescLabel")}</label>
            <textarea
              value={langs[activeTab].description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={2}
              className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary">{t("common.cancel")}</button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">{t("common.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
