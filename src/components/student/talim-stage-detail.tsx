"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/i18n/language-provider";
import { textFor } from "@/components/admin/question-dialog";
import { ArrowLeft, Image as ImageIcon, ListChecks, X } from "lucide-react";

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
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">{t("studentTalim.materialsTitle")}</h2>
        {materials.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{t("studentTalim.materialsEmpty")}</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOpenMaterial(m)}
                className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex h-40 items-center justify-center bg-secondary/50">
                  {m.imageUrl ? (
                    <img src={m.imageUrl} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" strokeWidth={1.25} />
                  )}
                </div>
                <div className="p-4">
                  <p className="line-clamp-3 text-sm text-foreground">{textFor(m.titleJson, locale)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {questionsCount > 0 && (
        <div className="flex justify-center pt-2">
          <Link
            href={`/student/talim/${stageId}/korish`}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:opacity-90"
          >
            <ListChecks className="h-4 w-4" />
            {t("studentTalim.viewButton")}
          </Link>
        </div>
      )}

      {openMaterial && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
          onClick={() => setOpenMaterial(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {openMaterial.imageUrl ? (
                <img src={openMaterial.imageUrl} alt="" className="max-h-80 w-full object-contain bg-secondary/30" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-secondary/30">
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
