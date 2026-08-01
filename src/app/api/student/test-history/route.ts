import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const results = await prisma.testResult.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { stage: { select: { titleJson: true, type: true } } },
  });

  return Response.json({
    results: results.map((r) => ({
      id: r.id,
      stageTitle: r.stage?.titleJson ?? null,
      stageType: r.stage?.type ?? null,
      totalQuestions: r.totalQuestions,
      score: r.score,
      timeSpentSec: r.timeSpentSec,
      createdAt: r.createdAt,
    })),
  });
}
