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
 * Manba: FAQAT Bosqichli test (STAGE) bo'limidagi mavzular.
 * 70-75% savollar 1- va 2-bosqichdan, qolgan 25-30% boshqa bosqichlardan.
 * Har ikki guruh ichida ham foydalanuvchi hali yechmagan / kam ishlagan savollarga ustunlik beriladi.
 */
export async function buildExamQuestionSet(totalCount: 20 | 50, userId: string): Promise<ExamQuestion[]> {
  const topics = await prisma.stage.findMany({
    where: { type: "STAGE" },
    orderBy: { levelOrder: "asc" },
  });

  const primaryTopicIds = topics.slice(0, 2).map((t) => t.id);
  const secondaryTopicIds = topics.slice(2).map((t) => t.id);
  const allTopicIds = topics.map((t) => t.id);

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

  const allTopicLinks = await prisma.stageQuestion.findMany({
    where: { stageId: { in: allTopicIds } },
    include: { question: { include: { options: true } } },
  });

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

  function pickFromTopicIds(topicIds: string[], count: number, excludeIds: Set<string>): any[] {
    if (topicIds.length === 0 || count <= 0) return [];
    const links = allTopicLinks.filter((l) => topicIds.includes(l.stageId) && !excludeIds.has(l.questionId));
    const uniqueQuestions = Array.from(new Map(links.map((l) => [l.questionId, l.question])).values());
    return orderBySeenPriority(uniqueQuestions).slice(0, count);
  }

  const usedIds = new Set<string>();
  const primary = pickFromTopicIds(primaryTopicIds, primaryCount, usedIds);
  primary.forEach((q) => usedIds.add(q.id));

  const secondary = pickFromTopicIds(secondaryTopicIds, secondaryCount, usedIds);
  secondary.forEach((q) => usedIds.add(q.id));

  let combined = [...primary, ...secondary];

  if (combined.length < totalCount) {
    const missing = totalCount - combined.length;
    const allTopicQuestionsMap = new Map(allTopicLinks.map((l) => [l.questionId, l.question]));
    const remainingPool = [...allTopicQuestionsMap.values()].filter((q) => !usedIds.has(q.id));
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
