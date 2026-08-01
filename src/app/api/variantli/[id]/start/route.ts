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

  const { id: stageId } = await params;
  const stage = await prisma.stage.findUnique({ where: { id: stageId } });
  if (!stage) return new Response("Not found", { status: 404 });

  const links = await prisma.stageQuestion.findMany({
    where: { stageId },
    include: { question: { include: { options: true } } },
  });

  const questions = links.map((l) => l.question);
  const timeLimitSec = (stage.timeLimit20 ?? 20) * 60;

  const safeQuestions = questions.map((q) => ({
    id: q.id,
    textJson: q.textJson,
    imageUrl: q.imageUrl,
    options: shuffle(q.options).map((o) => ({ id: o.id, optionTextJson: o.optionTextJson })),
  }));

  return Response.json({ questions: shuffle(safeQuestions), timeLimitSec, stageId });
}
