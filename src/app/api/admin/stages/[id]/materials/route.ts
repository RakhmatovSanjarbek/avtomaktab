import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSectionAccess("talim");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id: stageId } = await params;
  const body = await req.json();
  const { titleJson, descriptionJson, imageUrl } = body;

  if (!titleJson) return new Response("Missing title", { status: 400 });

  const count = await prisma.trainingMaterial.count({ where: { stageId } });

  const material = await prisma.trainingMaterial.create({
    data: {
      stageId,
      titleJson,
      descriptionJson: descriptionJson ?? undefined,
      imageUrl: imageUrl || null,
      order: count,
    },
  });

  return Response.json({ material });
}
