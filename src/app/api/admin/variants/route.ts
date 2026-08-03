import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

export async function GET() {
  const session = await requireApiSectionAccess("questions");
  if (!session) return new Response("Forbidden", { status: 403 });

  const variants = await prisma.stage.findMany({
    where: { type: "VARIANT" },
    orderBy: { levelOrder: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return Response.json({
    variants: variants.map((v) => ({
      id: v.id,
      titleJson: v.titleJson,
      questionsCount: v._count.questions,
    })),
  });
}

export async function POST(req: Request) {
  const session = await requireApiSectionAccess("questions");
  if (!session) return new Response("Forbidden", { status: 403 });

  const body = await req.json();
  const { name } = body;
  if (!name || !name.trim()) return new Response("Missing name", { status: 400 });

  const count = await prisma.stage.count({ where: { type: "VARIANT" } });

  const variant = await prisma.stage.create({
    data: {
      type: "VARIANT",
      levelOrder: count + 1,
      titleJson: { uzLatin: name, uzCyrl: name, ru: name },
    },
  });

  return Response.json({ variant });
}
