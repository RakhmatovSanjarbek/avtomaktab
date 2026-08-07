import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const PREVIEW_COUNT = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const { id: stageId } = await params;
  const stage = await prisma.stage.findUnique({ where: { id: stageId } });
  if (!stage) return new Response("Not found", { status: 404 });

  const links = await prisma.stageQuestion.findMany({
    where: { stageId },
    include: { question: { include: { options: true } } },
  });
  const allQuestions = links.map((l) => l.question);
  const allQuestionIds = allQuestions.map((q) => q.id);

  // Foydalanuvchi bu bo'limda har bir savolni necha marta ko'rganini aniqlaymiz
  const seenHistory = await prisma.trainingSeenQuestion.findMany({
    where: { userId, questionId: { in: allQuestionIds } },
    select: { questionId: true, seenCount: true },
  });
  const seenMap = new Map(seenHistory.map((s) => [s.questionId, s.seenCount]));

  // Kam ko'rilgan (yoki umuman ko'rilmagan) savollarga ustunlik beramiz
  const withSeen = allQuestions.map((q) => ({ q, seen: seenMap.get(q.id) ?? 0 }));
  const grouped = new Map<number, typeof withSeen>();
  for (const item of withSeen) {
    const arr = grouped.get(item.seen) ?? [];
    arr.push(item);
    grouped.set(item.seen, arr);
  }
  const sortedLevels = [...grouped.keys()].sort((a, b) => a - b);
  const ordered: typeof allQuestions = [];
  for (const level of sortedLevels) {
    ordered.push(...shuffle(grouped.get(level)!).map((x) => x.q));
  }

  const selected = ordered.slice(0, Math.min(PREVIEW_COUNT, ordered.length));

  // Tanlangan savollarni "ko'rilgan" deb belgilaymiz (seenCount +1)
  await Promise.all(
    selected.map((q) =>
      prisma.trainingSeenQuestion.upsert({
        where: { userId_questionId: { userId, questionId: q.id } },
        update: { seenCount: { increment: 1 }, lastSeenAt: new Date() },
        create: { userId, questionId: q.id, seenCount: 1 },
      })
    )
  );

  const timeLimitSec = selected.length * 60; // har savolga taxminan 1 daqiqa

  const safeQuestions = selected.map((q) => ({
    id: q.id,
    textJson: q.textJson,
    explanationJson: q.explanationJson,
    imageUrl: q.imageUrl,
    options: shuffle(q.options).map((o) => ({ id: o.id, optionTextJson: o.optionTextJson, isCorrect: o.isCorrect })),
  }));

  return Response.json({ questions: safeQuestions, timeLimitSec, stageId });
}
