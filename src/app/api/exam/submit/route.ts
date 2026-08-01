import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function getOrCreateExamStage() {
  const existing = await prisma.stage.findFirst({ where: { type: "EXAM" } });
  if (existing) return existing;

  return prisma.stage.create({
    data: {
      type: "EXAM",
      levelOrder: 1,
      titleJson: { uzLatin: "Yakuniy imtihon", uzCyrl: "Якуний имтиҳон", ru: "Итоговый экзамен" },
    },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const { answers, timeSpentSec } = body as {
    answers: { questionId: string; selectedOptionId: string | null }[];
    timeSpentSec: number;
  };

  if (!Array.isArray(answers) || answers.length === 0) {
    return new Response("Invalid payload", { status: 400 });
  }

  const questionIds = answers.map((a) => a.questionId);
  const questions = await prisma.question.findMany({
    where: { id: { in: questionIds } },
    include: { options: true },
  });
  const questionMap = new Map(questions.map((q) => [q.id, q]));

  let score = 0;
  const answersLog: any[] = [];

  for (const ans of answers) {
    const question = questionMap.get(ans.questionId);
    const correctOption = question?.options.find((o) => o.isCorrect);
    const isCorrect = !!ans.selectedOptionId && correctOption?.id === ans.selectedOptionId;

    if (isCorrect) score++;
    answersLog.push({ questionId: ans.questionId, selectedOptionId: ans.selectedOptionId, isCorrect });
  }

  const examStage = await getOrCreateExamStage();

  // Ketma-ket bajaramiz — driver adapter bilan parallel yozishlar ziddiyat berishi mumkin
  const result = await prisma.testResult.create({
    data: { userId, stageId: examStage.id, totalQuestions: answers.length, score, timeSpentSec, answersLog },
  });

  for (const ans of answers) {
    const question = questionMap.get(ans.questionId);
    const correctOption = question?.options.find((o) => o.isCorrect);
    const isCorrect = !!ans.selectedOptionId && correctOption?.id === ans.selectedOptionId;

    if (isCorrect) {
      await prisma.userMistake.updateMany({
        where: { userId, questionId: ans.questionId },
        data: { isResolved: true },
      });
    } else {
      await prisma.userMistake.upsert({
        where: { userId_questionId: { userId, questionId: ans.questionId } },
        update: { mistakeCount: { increment: 1 }, lastMistakeAt: new Date(), isResolved: false },
        create: { userId, questionId: ans.questionId, mistakeCount: 1, isResolved: false },
      });
    }
  }

  return Response.json({ result: { id: result.id, score, total: answers.length } });
}
