import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const topic = await prisma.stage.findUnique({
    where: { id },
    include: { questions: { include: { question: { include: { options: { orderBy: { order: "asc" } } } } } } },
  });

  if (!topic) return new Response("Not found", { status: 404 });

  return Response.json({
    topic: { id: topic.id, titleJson: topic.titleJson, questions: topic.questions.map((sq) => sq.question) },
  });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  // Faqat bog'lanishlarni va bosqichning o'zini o'chiramiz — savollar Master bazada qoladi
  await prisma.$transaction([
    prisma.stageQuestion.deleteMany({ where: { stageId: id } }),
    prisma.stage.delete({ where: { id } }),
  ]);

  return Response.json({ ok: true });
}
