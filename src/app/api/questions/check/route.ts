import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const { questionId, selectedOptionId } = body;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: true },
  });
  if (!question) return new Response("Not found", { status: 404 });

  const correctOption = question.options.find((o) => o.isCorrect);
  const isCorrect = correctOption?.id === selectedOptionId;

  return Response.json({
    isCorrect,
    correctOptionId: correctOption?.id ?? null,
    explanationJson: question.explanationJson,
  });
}
