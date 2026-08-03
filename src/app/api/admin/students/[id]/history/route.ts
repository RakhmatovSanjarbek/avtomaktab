import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApiSectionAccess("students");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;

  const [student, results] = await Promise.all([
    prisma.user.findUnique({ where: { id }, select: { fullName: true, phone: true, groupName: true } }),
    prisma.testResult.findMany({
      where: { userId: id },
      orderBy: { createdAt: "desc" },
      include: { stage: { select: { titleJson: true, type: true } } },
    }),
  ]);

  if (!student) return new Response("Not found", { status: 404 });

  return Response.json({
    student,
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
