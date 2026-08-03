import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

export async function GET() {
  const session = await requireApiSectionAccess("talim");
  if (!session) return new Response("Forbidden", { status: 403 });

  const stages = await prisma.stage.findMany({
    where: { type: "TRAINING" },
    orderBy: { levelOrder: "asc" },
    include: { _count: { select: { questions: true, materials: true } } },
  });

  return Response.json({
    stages: stages.map((s) => ({
      id: s.id,
      titleJson: s.titleJson,
      descJson: s.descJson,
      questionsCount: s._count.questions,
      materialsCount: s._count.materials,
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireApiSectionAccess("talim");
  if (!session) return new Response("Forbidden", { status: 403 });

  const body = await req.json();
  const { name, description } = body;
  if (!name || !name.trim()) return new Response("Missing name", { status: 400 });

  const count = await prisma.stage.count({ where: { type: "TRAINING" } });

  const stage = await prisma.stage.create({
    data: {
      type: "TRAINING",
      levelOrder: count + 1,
      titleJson: { uzLatin: name, uzCyrl: name, ru: name },
      descJson: description ? { uzLatin: description, uzCyrl: description, ru: description } : undefined,
    },
  });

  return Response.json({ stage });
}
