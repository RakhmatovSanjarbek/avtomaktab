import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id: stageId } = await params;
  const body = await req.json();
  const { textJson, explanationJson, imageUrl, options } = body;

  if (!textJson || !options || options.length < 2) {
    return new Response("Invalid payload", { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      textJson,
      explanationJson: explanationJson ?? undefined,
      imageUrl: imageUrl || null,
      options: {
        create: options.map((o: any, i: number) => ({
          optionTextJson: o.optionTextJson,
          isCorrect: o.isCorrect,
          order: i,
        })),
      },
    },
  });

  await prisma.stageQuestion.create({ data: { stageId, questionId: question.id } });

  return Response.json({ question });
}
