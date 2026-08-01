import { prisma } from "./prisma";

type ExamQuestion = {
  id: string;
  textJson: any;
  explanationJson: any;
  imageUrl: string | null;
  options: { id: string; optionTextJson: any; isCorrect: boolean }[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * TZ 5.4 — Weighting System:
 * Manba: FAQAT Variantli test (VARIANT) bazasi — boshqa modul (Ta'lim, Bosqichli) savollari
 * bu yerga hech qachon aralashmaydi.
 * 70-75% savollar 1- va 2-variantdan, qolgan 25-30% boshqa variantlardan.
 * Har ikki guruh ichida ham foydalanuvchi hali yechmagan / kam ishlagan savollarga ustunlik beriladi.
 */
export async function buildExamQuestionSet(totalCount: 20 | 50, userId: string): Promise<ExamQuestion[]> {
  const variants = await prisma.stage.findMany({
    where: { type: "VARIANT" },
    orderBy: { levelOrder: "asc" },
  });

  const primaryVariantIds = variants.slice(0, 2).map((v) => v.id);
  const secondaryVariantIds = variants.slice(2).map((v) => v.id);
  const allVariantIds = variants.map((v) => v.id);

  const primaryRatio = 0.7 + Math.random() * 0.05; // 70-75%
  const primaryCount = Math.round(totalCount * primaryRatio);
  const secondaryCount = totalCount - primaryCount;

  const priorResults = await prisma.testResult.findMany({
    where: { userId },
    select: { answersLog: true },
  });
  const seenCount = new Map<string, number>();
  for (const r of priorResults) {
    const log = r.answersLog as any[];
    for (const entry of log) {
      seenCount.set(entry.questionId, (seenCount.get(entry.questionId) ?? 0) + 1);
    }
  }

  // Variantli test bazasidagi BARCHA savollarni bir marta yuklab olamiz (fallback ham shundan foydalanadi)
  const allVariantLinks = await prisma.stageQuestion.findMany({
    where: { stageId: { in: allVariantIds } },
    include: { question: { include: { options: true } } },
  });
  const allVariantQuestionsMap = new Map(allVariantLinks.map((l) => [l.questionId, l.question]));

  function orderBySeenPriority(questions: any[]) {
    const withSeen = questions.map((q) => ({ q, seen: seenCount.get(q.id) ?? 0 }));
    const grouped = new Map<number, typeof withSeen>();
    for (const item of withSeen) {
      const arr = grouped.get(item.seen) ?? [];
      arr.push(item);
      grouped.set(item.seen, arr);
    }
    const sortedLevels = [...grouped.keys()].sort((a, b) => a - b);
    const ordered: any[] = [];
    for (const level of sortedLevels) {
      ordered.push(...shuffle(grouped.get(level)!).map((x) => x.q));
    }
    return ordered;
  }

  function pickFromVariantIds(variantIds: string[], count: number, excludeIds: Set<string>): any[] {
    if (variantIds.length === 0 || count <= 0) return [];
    const links = allVariantLinks.filter((l) => variantIds.includes(l.stageId) && !excludeIds.has(l.questionId));
    const uniqueQuestions = Array.from(new Map(links.map((l) => [l.questionId, l.question])).values());
    return orderBySeenPriority(uniqueQuestions).slice(0, count);
  }

  const usedIds = new Set<string>();
  const primary = pickFromVariantIds(primaryVariantIds, primaryCount, usedIds);
  primary.forEach((q) => usedIds.add(q.id));

  const secondary = pickFromVariantIds(secondaryVariantIds, secondaryCount, usedIds);
  secondary.forEach((q) => usedIds.add(q.id));

  let combined = [...primary, ...secondary];

  // Agar hali ham yetarli bo'lmasa — FAQAT variant havzasidan (boshqa modullardan EMAS) to'ldiramiz
  if (combined.length < totalCount) {
    const missing = totalCount - combined.length;
    const remainingPool = [...allVariantQuestionsMap.values()].filter((q) => !usedIds.has(q.id));
    const extra = orderBySeenPriority(remainingPool).slice(0, missing);
    combined = [...combined, ...extra];
  }

  combined = shuffle(combined).slice(0, totalCount);

  return combined.map((q) => ({
    id: q.id,
    textJson: q.textJson,
    explanationJson: q.explanationJson,
    imageUrl: q.imageUrl,
    options: shuffle(q.options).map((o) => ({ id: o.id, optionTextJson: o.optionTextJson, isCorrect: o.isCorrect })),
  }));
}
