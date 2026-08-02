import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/i18n/get-dictionary";
import { getLocaleServer } from "@/lib/get-locale-server";
import { textFor } from "@/lib/text-for";
import Link from "next/link";
import { Layers, FileQuestion, ChevronRight } from "lucide-react";

export default async function AdminBosqichliInfoPage() {
  const locale = await getLocaleServer();
  const dict = getDictionary(locale);

  const stages = await prisma.stage.findMany({
    where: { type: "TRAINING" },
    orderBy: { levelOrder: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{dict.admin.bosqichli.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bosqichli test avtomatik ravishda Ta'lim moduli bo'limlaridan hosil bo'ladi — har bir bo'lim shu nomdagi
          bosqichga aylanadi. Savol qo'shish/tahrirlash uchun tegishli bo'limni bosing.
        </p>
      </div>

      {stages.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">{dict.admin.talim.stagesEmpty}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map((s, idx) => (
            <Link
              key={s.id}
              href={`/admin/talim/${s.id}`}
              className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:bg-secondary/50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Layers className="h-5 w-5 text-primary" strokeWidth={1.75} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">
                  {idx + 1}-bosqich <span className="text-xs font-normal text-muted-foreground">({textFor(s.titleJson, locale)})</span>
                </h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <FileQuestion className="h-3 w-3" /> {s._count.questions} savol
                </p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
