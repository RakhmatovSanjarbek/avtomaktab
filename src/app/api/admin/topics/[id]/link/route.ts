import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApiSectionAccess("bosqichli");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id: stageId } = await params;
  const body = await req.json();
  const { questionId } = body;
  if (!questionId) return new Response("Missing questionId", { status: 400 });

  await prisma.stageQuestion.upsert({
    where: { stageId_questionId: { stageId, questionId } },
    update: {},
    create: { stageId, questionId },
  });

  return Response.json({ ok: true });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApiSectionAccess("bosqichli");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id: stageId } = await params;
  const body = await req.json();
  const { questionId } = body;
  if (!questionId) return new Response("Missing questionId", { status: 400 });

  await prisma.stageQuestion.delete({ where: { stageId_questionId: { stageId, questionId } } });
  return Response.json({ ok: true });
}
