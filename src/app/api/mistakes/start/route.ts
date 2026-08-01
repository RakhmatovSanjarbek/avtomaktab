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

export async function POST() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const mistakes = await prisma.userMistake.findMany({
    where: { userId, isResolved: false },
    include: { question: { include: { options: true } } },
  });

  const questions = mistakes.map((m) => m.question);
  const timeLimitSec = Math.max(questions.length, 5) * 60; // har savolga ~1 daqiqa

  const safeQuestions = shuffle(questions).map((q) => ({
    id: q.id,
    textJson: q.textJson,
    imageUrl: q.imageUrl,
    options: shuffle(q.options).map((o) => ({ id: o.id, optionTextJson: o.optionTextJson })),
  }));

  return Response.json({ questions: safeQuestions, timeLimitSec });
}
