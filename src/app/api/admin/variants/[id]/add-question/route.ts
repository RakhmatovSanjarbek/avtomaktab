import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireApiSectionAccess("questions");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id: variantId } = await params;
  const body = await req.json();
  const { textJson, explanationJson, imageUrl, options } = body;

  if (!textJson?.uzLatin?.trim() || !Array.isArray(options) || options.length < 2) {
    return new Response("Invalid payload", { status: 400 });
  }

  const question = await prisma.question.create({
    data: {
      textJson,
      explanationJson: explanationJson ?? undefined,
      imageUrl: imageUrl ?? undefined,
      options: {
        create: options.map((o: any, i: number) => ({
          optionTextJson: o.optionTextJson,
          isCorrect: o.isCorrect,
          order: i,
        })),
      },
    },
  });

  await prisma.stageQuestion.create({ data: { stageId: variantId, questionId: question.id } });

  return Response.json({ question });
}
