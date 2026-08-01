import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const variants = await prisma.stage.findMany({
    where: { type: "VARIANT" },
    orderBy: { levelOrder: "asc" },
    include: { _count: { select: { questions: true } } },
  });

  return Response.json({
    variants: variants.map((v) => ({ id: v.id, titleJson: v.titleJson, questionsCount: v._count.questions })),
  });
}
