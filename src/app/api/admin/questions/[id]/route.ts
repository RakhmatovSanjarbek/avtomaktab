import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSectionAccess("questions");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { textJson, explanationJson, imageUrl, options } = body;

  await prisma.$transaction([
    prisma.option.deleteMany({ where: { questionId: id } }),
    prisma.question.update({
      where: { id },
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
    }),
  ]);

  return Response.json({ ok: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSectionAccess("questions");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  await prisma.question.delete({ where: { id } });

  return Response.json({ ok: true });
}
