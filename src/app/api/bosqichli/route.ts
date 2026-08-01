import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const topics = await prisma.stage.findMany({
    where: { type: "STAGE" },
    orderBy: { levelOrder: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return Response.json({
    topics: topics.map((t) => ({ id: t.id, titleJson: t.titleJson, questionsCount: t._count.questions })),
  });
}
