import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;

  const stage = await prisma.stage.findUnique({
    where: { id },
    include: {
      materials: { orderBy: { order: "asc" } },
      questions: { include: { question: { include: { options: { orderBy: { order: "asc" } } } } } },
    },
  });

  if (!stage) return new Response("Not found", { status: 404 });

  return Response.json({
    stage: {
      id: stage.id,
      titleJson: stage.titleJson,
      materials: stage.materials,
      questions: stage.questions.map((sq) => sq.question),
    },
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const links = await prisma.stageQuestion.findMany({ where: { stageId: id } });
  const questionIds = links.map((l) => l.questionId);

  await prisma.$transaction([
    prisma.question.deleteMany({ where: { id: { in: questionIds } } }),
    prisma.trainingMaterial.deleteMany({ where: { stageId: id } }),
    prisma.stage.delete({ where: { id } }),
  ]);

  return Response.json({ ok: true });
}
