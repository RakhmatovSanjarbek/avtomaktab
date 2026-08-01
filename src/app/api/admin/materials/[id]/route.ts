import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { titleJson, descriptionJson, imageUrl } = body;

  const material = await prisma.trainingMaterial.update({
    where: { id },
    data: { titleJson, descriptionJson: descriptionJson ?? undefined, imageUrl: imageUrl || null },
  });

  return Response.json({ material });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  await prisma.trainingMaterial.delete({ where: { id } });
  return Response.json({ ok: true });
}
