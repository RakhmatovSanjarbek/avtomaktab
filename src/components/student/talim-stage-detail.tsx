"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/components/admin/question-dialog";
import { ArrowLeft, Image as ImageIcon, ListChecks, X } from "lucide-react";
import { enterFullscreen } from "@/lib/fullscreen";

type Material = { id: string; titleJson: any; imageUrl: string | null };

export function TalimStageDetail({ stageId }: { stageId: string }) {
  const { t, locale } = useLanguage();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openMaterial, setOpenMaterial] = useState<Material | null>(null);

  useEffect(() => {
    fetch(`/api/talim/${stageId}`)
      .then((res) => res.json())
      .then((data) => {
        setTitle(textFor(data.stage?.titleJson, locale));
        setDesc(data.stage?.descJson ? textFor(data.stage.descJson, locale) : "");
        setMaterials(data.stage?.materials ?? []);
        setQuestionsCount(data.stage?.questions?.length ?? 0);
      })
      .finally(() => setLoading(false));
  }, [stageId, locale]);

  if (loading) return <p className="py-8 text-center text-sm text-muted-foreground">{t("common.loading")}</p>;

  return (
    <div className="space-y-8">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("studentTalim.backToStages")}
        </button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-foreground">{title}</h1>
          </div>

          {questionsCount > 0 && (
            <Link
              href={`/student/talim/${stageId}/korish`}
              onClick={() => enterFullscreen()}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
            >
              <ListChecks className="h-4 w-4" />
              {t("studentTalim.viewButton")}
            </Link>
          )}
        </div>
      </div>

      {desc && (
        <div className="rounded-xl bg-primary/10 px-5 py-3.5 text-center text-base font-semibold text-foreground sm:text-lg">
          {desc}
        </div>
      )}

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{t("studentTalim.materialsTitle")}</h2>
        {materials.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("studentTalim.materialsEmpty")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {materials.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOpenMaterial(m)}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-36 w-full items-center justify-center bg-secondary/30 p-2 sm:h-44">
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt="" className="max-h-full max-w-full object-contain transition-transform group-hover:scale-[1.02]" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.25} />
                  )}
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-xs text-foreground sm:text-sm">{textFor(m.titleJson, locale)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {openMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setOpenMaterial(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full bg-secondary/30">
              {openMaterial.imageUrl ? (
                <img src={openMaterial.imageUrl} alt="" className="max-h-[60vh] w-full object-contain" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.25} />
                </div>
              )}
              <button
                type="button"
                onClick={() => setOpenMaterial(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">
                {textFor(openMaterial.titleJson, locale)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
