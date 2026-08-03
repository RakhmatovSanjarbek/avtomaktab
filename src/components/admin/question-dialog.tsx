"use client";

import { useState, useRef } from "react";
import { useLanguage } from "@/i18n/language-provider";
import { localeOptions } from "@/i18n/dictionaries";
import { X, CheckCircle2, Upload, Loader2, Plus } from "lucide-react";
import { latinToCyrillic } from "@/lib/uzbek-transliterate";

type Option = { id?: string; optionTextJson: any; isCorrect: boolean };
export type QuestionData = { id: string; textJson: any; explanationJson: any; imageUrl: string | null; options: Option[] };

const LOCALE_KEY: Record<string, string> = { "uz-latin": "uzLatin", "uz-cyrl": "uzCyrl", ru: "ru" };
const MIN_OPTIONS = 2;

export function textFor(json: any, locale: string) {
  if (!json) return "";
  return json[LOCALE_KEY[locale]] ?? json.uzLatin ?? "";
}

type LangForm = { text: string; explanation: string; options: string[] };
function emptyLangForm(count: number): LangForm {
  return { text: "", explanation: "", options: Array.from({ length: count }, () => "") };
}

export function QuestionDialog({
  addUrl,
  question,
  onClose,
  onDone,
}: {
  addUrl: string;
  question?: QuestionData;
  onClose: () => void;
  onDone: () => void;
}) {
  const { t } = useLanguage();
  const isEdit = !!question;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialCount = question ? Math.max(question.options.length, MIN_OPTIONS) : MIN_OPTIONS + 2;

  const [activeTab, setActiveTab] = useState<"uz-latin" | "uz-cyrl" | "ru">("uz-latin");
  const [imageUrl, setImageUrl] = useState(question?.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [optionsCount, setOptionsCount] = useState(initialCount);
  const [correctIndex, setCorrectIndex] = useState<number>(
    question ? Math.max(question.options.findIndex((o) => o.isCorrect), 0) : 0
  );
  const [langs, setLangs] = useState<Record<string, LangForm>>(() => {
    const base: Record<string, LangForm> = {
      "uz-latin": emptyLangForm(initialCount),
      "uz-cyrl": emptyLangForm(initialCount),
      ru: emptyLangForm(initialCount),
    };
    if (question) {
      (["uz-latin", "uz-cyrl", "ru"] as const).forEach((loc) => {
        const opts = Array.from({ length: initialCount }, (_, i) =>
          question.options[i] ? textFor(question.options[i].optionTextJson, loc) : ""
        );
        base[loc] = { text: textFor(question.textJson, loc), explanation: textFor(question.explanationJson, loc), options: opts };
      });
    }
    return base;
  });

  const autoGenRef = useRef<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: "text" | "explanation", value: string) {
    let cyrOverride: string | null = null;
    if (activeTab === "uz-latin") {
      const key = `field-${field}`;
      const currentCyr = langs["uz-cyrl"][field];
      const wasUntouched = !currentCyr || currentCyr === autoGenRef.current[key];
      if (wasUntouched) {
        cyrOverride = latinToCyrillic(value);
        autoGenRef.current[key] = cyrOverride;
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

  function updateOption(i: number, value: string) {
    let cyrOverride: string | null = null;
    if (activeTab === "uz-latin") {
      const key = `option-${i}`;
      const currentCyr = langs["uz-cyrl"].options[i] ?? "";
      const wasUntouched = !currentCyr || currentCyr === autoGenRef.current[key];
      if (wasUntouched) {
        cyrOverride = latinToCyrillic(value);
        autoGenRef.current[key] = cyrOverride;
      }
    }

    setLangs((prev) => {
      const opts = [...prev[activeTab].options];
      opts[i] = value;
      const next = { ...prev, [activeTab]: { ...prev[activeTab], options: opts } };
      if (cyrOverride !== null) {
        const cyrOpts = [...next["uz-cyrl"].options];
        cyrOpts[i] = cyrOverride;
        next["uz-cyrl"] = { ...next["uz-cyrl"], options: cyrOpts };
      }
      return next;
    });
  }

  function addOption() {
    setLangs((prev) => {
      const next = { ...prev };
      (["uz-latin", "uz-cyrl", "ru"] as const).forEach((loc) => { next[loc] = { ...next[loc], options: [...next[loc].options, ""] }; });
      return next;
    });
    setOptionsCount((c) => c + 1);
  }

  function removeOption(i: number) {
    if (optionsCount <= MIN_OPTIONS) return;
    setLangs((prev) => {
      const next = { ...prev };
      (["uz-latin", "uz-cyrl", "ru"] as const).forEach((loc) => { next[loc] = { ...next[loc], options: next[loc].options.filter((_, idx) => idx !== i) }; });
      return next;
    });
    setOptionsCount((c) => c - 1);
    setCorrectIndex((ci) => (i === ci ? 0 : i < ci ? ci - 1 : ci));
  }

  function handleCyrRegenerate() {
    setLangs((prev) => {
      const genText = latinToCyrillic(prev["uz-latin"].text);
      const genExpl = latinToCyrillic(prev["uz-latin"].explanation);
      const genOpts = prev["uz-latin"].options.map((o) => latinToCyrillic(o));
      autoGenRef.current["field-text"] = genText;
      autoGenRef.current["field-explanation"] = genExpl;
      genOpts.forEach((g, i) => { autoGenRef.current[`option-${i}`] = g; });
      return { ...prev, "uz-cyrl": { text: genText, explanation: genExpl, options: genOpts } };
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
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const allFilled = (["uz-latin", "uz-cyrl", "ru"] as const).every(
      (loc) => langs[loc].text.trim() && langs[loc].options.every((o) => o.trim())
    );
    if (!allFilled) {
      setError(t("admin.questions.saveError"));
      return;
    }

    setSubmitting(true);
    const textJson = { uzLatin: langs["uz-latin"].text, uzCyrl: langs["uz-cyrl"].text, ru: langs["ru"].text };
    const hasExplanation = (["uz-latin", "uz-cyrl", "ru"] as const).some((loc) => langs[loc].explanation.trim());
    const explanationJson = hasExplanation
      ? { uzLatin: langs["uz-latin"].explanation, uzCyrl: langs["uz-cyrl"].explanation, ru: langs["ru"].explanation }
      : null;
    const options = Array.from({ length: optionsCount }, (_, i) => ({
      optionTextJson: { uzLatin: langs["uz-latin"].options[i], uzCyrl: langs["uz-cyrl"].options[i], ru: langs["ru"].options[i] },
      isCorrect: i === correctIndex,
    }));

    const payload = { textJson, explanationJson, imageUrl: imageUrl || null, options };
    const url = isEdit ? `/api/admin/questions/${question!.id}` : addUrl;
    const method = isEdit ? "PATCH" : "POST";

    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    onDone();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            {isEdit ? t("admin.questions.editQuestionDialogTitle") : t("admin.questions.questionDialogTitle")}
          </h3>
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
          <button type="button" onClick={handleCyrRegenerate} className="mb-4 text-xs font-medium text-primary hover:opacity-80">
            ↻ Lotin asosida qayta hosil qilish
          </button>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.questions.questionTextLabel")}</label>
            <textarea value={langs[activeTab].text} onChange={(e) => updateField("text", e.target.value)} rows={2}
              className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.questions.imageUrlLabel")}</label>
            {imageUrl ? (
              <div className="relative inline-block">
                <img src={imageUrl} alt="" className="h-28 w-auto rounded-xl border border-border object-cover" />
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

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">{t("admin.questions.markCorrectHint")}</p>
              <button type="button" onClick={addOption} className="flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80">
                <Plus className="h-3.5 w-3.5" /> {t("admin.questions.optionLabel")}
              </button>
            </div>
            <div className="space-y-2">
              {Array.from({ length: optionsCount }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <button type="button" onClick={() => setCorrectIndex(i)}
                    className={"flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2 transition-colors " + (correctIndex === i ? "border-primary bg-primary/10" : "border-border")}>
                    {correctIndex === i && <CheckCircle2 className="h-4 w-4 text-primary" />}
                  </button>
                  <input value={langs[activeTab].options[i] ?? ""} onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`${t("admin.questions.optionLabel")} ${i + 1}`}
                    className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
                  {optionsCount > MIN_OPTIONS && (
                    <button type="button" onClick={() => removeOption(i)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground">{t("admin.questions.explanationLabel")}</label>
            <textarea value={langs[activeTab].explanation} onChange={(e) => updateField("explanation", e.target.value)} rows={2}
              className="w-full resize-none rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/50" />
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
