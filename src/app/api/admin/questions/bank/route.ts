import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: Request) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");

  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: { options: { orderBy: { order: "asc" } } },
  });

  let linkedIds = new Set<string>();
  if (topicId) {
    const links = await prisma.stageQuestion.findMany({ where: { stageId: topicId } });
    linkedIds = new Set(links.map((l) => l.questionId));
  }

  return Response.json({
    questions: questions.map((q) => ({ ...q, isLinked: linkedIds.has(q.id) })),
  });
}
