import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const stages = await prisma.stage.findMany({
    where: { type: "TRAINING" },
    orderBy: { levelOrder: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return Response.json({
    topics: stages.map((s) => ({ id: s.id, titleJson: s.titleJson, questionsCount: s._count.questions })),
  });
}
