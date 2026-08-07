"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { localeOptions } from "@/i18n/dictionaries";
import { ArrowLeft, Plus, Pencil, Trash2, X, Upload, Loader2, CheckCircle2, ImageIcon } from "lucide-react";
import { QuestionDialog, QuestionData, textFor } from "./question-dialog";
import { latinToCyrillic } from "@/lib/uzbek-transliterate";

type Material = { id: string; titleJson: any; descriptionJson: any; imageUrl: string | null };

export function StageDetail({ stageId }: { stageId: string }) {
  const { t, locale } = useLanguage();
  const [title, setTitle] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [matDialogOpen, setMatDialogOpen] = useState(false);
  const [editMaterial, setEditMaterial] = useState<Material | null>(null);
  const [qDialogOpen, setQDialogOpen] = useState(false);
  const [editQuestion, setEditQuestion] = useState<QuestionData | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stages/${stageId}`);
      const data = await res.json();
      setTitle(textFor(data.stage?.titleJson, locale));
      setMaterials(data.stage?.materials ?? []);
      setQuestions(data.stage?.questions ?? []);
    } finally {
      setLoading(false);
    }
  }, [stageId, locale]);

  useEffect(() => { load(); }, [load]);

  async function handleDeleteMaterial(id: string) {
    if (!window.confirm(t("admin.talim.deleteMaterialConfirm"))) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/materials/${id}`, { method: "DELETE" });
      load();
    } finally { setBusyId(null); }
  }

  async function handleDeleteQuestion(id: string) {
    if (!window.confirm(t("admin.questions.deleteConfirm"))) return;
    setBusyId(id);
    try {
      await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
      load();
    } finally { setBusyId(null); }
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/talim" className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("admin.talim.backToStages")}
        </Link>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      </div>

      {/* MATERIALLAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t("admin.talim.materialsTitle")}</h2>
          <button type="button" onClick={() => setMatDialogOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> {t("admin.talim.addMaterialButton")}
          </button>
        </div>
        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : materials.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("admin.talim.materialsEmpty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {materials.map((m) => (
              <div key={m.id} className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                {m.imageUrl ? (
                  <img src={m.imageUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg border border-border object-cover" />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm text-foreground">{textFor(m.titleJson, locale)}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-1.5">
                  <button type="button" onClick={() => setEditMaterial(m)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
                    <Pencil className="h-3 w-3" />
                  </button>
                  <button type="button" disabled={busyId === m.id} onClick={() => handleDeleteMaterial(m.id)} className="flex h-7 w-7 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SAVOLLAR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">{t("admin.talim.questionsTitle")}</h2>
          <button type="button" onClick={() => setQDialogOpen(true)} className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" /> {t("admin.questions.addQuestionButton")}
          </button>
        </div>
        {loading ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("common.loading")}</p>
        ) : questions.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("admin.questions.emptyQuestions")}</p>
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
                    <button type="button" onClick={() => setEditQuestion(q)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" disabled={busyId === q.id} onClick={() => handleDeleteQuestion(q.id)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 disabled:opacity-40">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {matDialogOpen && <MaterialDialog stageId={stageId} onClose={() => setMatDialogOpen(false)} onDone={() => { setMatDialogOpen(false); load(); }} />}
      {editMaterial && <MaterialDialog stageId={stageId} material={editMaterial} onClose={() => setEditMaterial(null)} onDone={() => { setEditMaterial(null); load(); }} />}
      {qDialogOpen && <QuestionDialog addUrl={`/api/admin/stages/${stageId}/questions`} onClose={() => setQDialogOpen(false)} onDone={() => { setQDialogOpen(false); load(); }} />}
      {editQuestion && <QuestionDialog addUrl="" question={editQuestion} onClose={() => setEditQuestion(null)} onDone={() => { setEditQuestion(null); load(); }} />}
    </div>
  );
}

function MaterialDialog({
  stageId,
  material,
  onClose,
  onDone,
}: {
  stageId: string;
  material?: Material;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const isEdit = !!material;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"uz-latin" | "uz-cyrl" | "ru">("uz-latin");
  const [content, setContent] = useState<Record<string, string>>(() => {
    const base: Record<string, string> = { "uz-latin": "", "uz-cyrl": "", ru: "" };
    if (material) {
      (["uz-latin", "uz-cyrl", "ru"] as const).forEach((loc) => {
        base[loc] = textFor(material.titleJson, loc);
      });
    }
    return base;
  });
  const [imageUrl, setImageUrl] = useState(material?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const autoGenRef = useRef<Record<string, string>>({});

  function updateContent(value: string) {
    let cyrOverride: string | null = null;
    if (activeTab === "uz-latin") {
      const currentCyr = content["uz-cyrl"];
      const wasUntouched = !currentCyr || currentCyr === autoGenRef.current["desc"];
      if (wasUntouched) {
        cyrOverride = latinToCyrillic(value);
        autoGenRef.current["desc"] = cyrOverride;
      }
    }
    setContent((prev) => {
      const next = { ...prev, [activeTab]: value };
      if (cyrOverride !== null) next["uz-cyrl"] = cyrOverride;
      return next;
    });
  }

  function handleCyrRegenerate() {
    setContent((prev) => {
      const generated = latinToCyrillic(prev["uz-latin"]);
      autoGenRef.current["desc"] = generated;
      return { ...prev, "uz-cyrl": generated };
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      setImageUrl(data.url);
    } finally { setUploading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const allFilled = (["uz-latin", "uz-cyrl", "ru"] as const).every((loc) => content[loc].trim());
    if (!allFilled) {
      setError(t("admin.questions.saveError"));
      return;
    }

    setSubmitting(true);
    const payload = {
      titleJson: { uzLatin: content["uz-latin"], uzCyrl: content["uz-cyrl"], ru: content["ru"] },
      descriptionJson: null,
      imageUrl: imageUrl || null,
    };
    const url = isEdit ? `/api/admin/materials/${material!.id}` : `/api/admin/stages/${stageId}/materials`;
    const method = isEdit ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">{t("admin.talim.materialDialogTitle")}</h3>
          <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 flex gap-1 rounded-xl border border-border bg-background p-1">
          {localeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setActiveTab(opt.value)}
              className={"flex-1 rounded-lg py-1.5 text-xs font-medium transition-colors " + (activeTab === opt.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
            >
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
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.talim.materialDescLabel")}</label>
            <textarea
              value={content[activeTab]}
              onChange={(e) => updateContent(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.questions.imageUrlLabel")}</label>
            {imageUrl ? (
              <div className="relative inline-block">
                <img src={imageUrl} alt="" className="h-24 w-auto rounded-xl border border-border object-cover" />
                <button type="button" onClick={() => setImageUrl("")} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background py-4 text-sm text-muted-foreground hover:bg-secondary/50">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? t("common.loading") : "JPG / PNG"}
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-medium text-foreground hover:bg-secondary">{t("common.cancel")}</button>
            <button type="submit" disabled={submitting || uploading} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50">{t("common.save")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
