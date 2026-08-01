import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

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
      descJson: stage.descJson,
      materials: stage.materials,
      questions: stage.questions.map((sq) => sq.question),
    },
  });
}
