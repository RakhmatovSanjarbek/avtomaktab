import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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
  const body = await req.json().catch(() => ({}));
  const mode = body?.mode === 50 ? 50 : 20;
  const timeLimitSec = mode === 50 ? 45 * 60 : 20 * 60;

  const stage = await prisma.stage.findUnique({ where: { id: stageId } });
  if (!stage) return new Response("Not found", { status: 404 });

  const links = await prisma.stageQuestion.findMany({
    where: { stageId },
    include: { question: { include: { options: true } } },
  });
  const questions = links.map((l) => l.question);
  const questionIds = questions.map((q) => q.id);

  // SMART ALGORITM: kam ishlangan / ko'proq xato qilingan savollarga ustunlik
  const mistakes = await prisma.userMistake.findMany({
    where: { userId, questionId: { in: questionIds }, isResolved: false },
  });
  const mistakeMap = new Map(mistakes.map((m) => [m.questionId, m.mistakeCount]));

  const priorResults = await prisma.testResult.findMany({
    where: { userId },
    select: { answersLog: true },
  });
  const seenCount = new Map<string, number>();
  for (const r of priorResults) {
    const log = r.answersLog as any[];
    for (const entry of log) {
      if (questionIds.includes(entry.questionId)) {
        seenCount.set(entry.questionId, (seenCount.get(entry.questionId) ?? 0) + 1);
      }
    }
  }

  function priorityScore(questionId: string) {
    const mistakeWeight = (mistakeMap.get(questionId) ?? 0) * 10;
    const seenPenalty = seenCount.get(questionId) ?? 0;
    return mistakeWeight - seenPenalty;
  }

  const sorted = [...questions].sort((a, b) => priorityScore(b.id) - priorityScore(a.id));
  const topPriority = sorted.slice(0, Math.ceil(sorted.length * 0.6));
  const rest = sorted.slice(Math.ceil(sorted.length * 0.6));
  const finalOrder = shuffle([...shuffle(topPriority), ...shuffle(rest)]);

  const selected = finalOrder.slice(0, Math.min(mode, finalOrder.length));

  const safeQuestions = selected.map((q) => ({
    id: q.id,
    textJson: q.textJson,
    imageUrl: q.imageUrl,
    options: shuffle(q.options).map((o) => ({ id: o.id, optionTextJson: o.optionTextJson })),
  }));

  return Response.json({ questions: shuffle(safeQuestions), timeLimitSec, stageId });
}
