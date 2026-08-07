import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";

const BATCH_SIZE = 30;

export async function POST() {
  const session = await requireApiSectionAccess("questions");
  if (!session) return new Response("Forbidden", { status: 403 });

  // Ta'lim moduli bo'limlaridagi barcha savollarni, qo'shilgan tartibida olamiz
  const trainingStages = await prisma.stage.findMany({
    where: { type: "TRAINING" },
    orderBy: { levelOrder: "asc" },
    select: { id: true },
  });
  const trainingStageIds = trainingStages.map((s) => s.id);

  const allLinks = await prisma.stageQuestion.findMany({
    where: { stageId: { in: trainingStageIds } },
    include: { question: { select: { id: true, createdAt: true } } },
    orderBy: { question: { createdAt: "asc" } },
  });
  const allQuestionIds = Array.from(new Set(allLinks.map((l) => l.questionId)));

  // Allaqachon biror variantga biriktirilgan savollarni chiqarib tashlaymiz
  const variantStages = await prisma.stage.findMany({
    where: { type: "VARIANT" },
    orderBy: { levelOrder: "asc" },
    include: { questions: { select: { questionId: true } } },
  });
  const alreadyDistributed = new Set(variantStages.flatMap((v) => v.questions.map((q) => q.questionId)));

  const remaining = allQuestionIds.filter((id) => !alreadyDistributed.has(id));

  if (remaining.length === 0) {
    return Response.json({ distributedCount: 0, createdVariants: 0 });
  }

  let createdVariants = 0;
  let cursor = 0;

  // Avval oxirgi variantni to'ldiramiz (agar u to'liq bo'lmasa)
  let lastVariant = variantStages[variantStages.length - 1] ?? null;
  let lastVariantCount = lastVariant?.questions.length ?? 0;

  const linksToCreate: { stageId: string; questionId: string }[] = [];
  let maxLevelOrder = variantStages.length > 0 ? Math.max(...variantStages.map((v) => v.levelOrder)) : 0;

  while (cursor < remaining.length) {
    if (!lastVariant || lastVariantCount >= BATCH_SIZE) {
      maxLevelOrder += 1;
      const name = `${maxLevelOrder}-Variant`;
      lastVariant = await prisma.stage.create({
        data: {
          type: "VARIANT",
          levelOrder: maxLevelOrder,
          titleJson: { uzLatin: name, uzCyrl: name, ru: name },
        },
        include: { questions: { select: { questionId: true } } },
      });
      lastVariantCount = 0;
      createdVariants += 1;
    }

    const spaceLeft = BATCH_SIZE - lastVariantCount;
    const batch = remaining.slice(cursor, cursor + spaceLeft);
    batch.forEach((qId) => linksToCreate.push({ stageId: lastVariant!.id, questionId: qId }));

    cursor += batch.length;
    lastVariantCount += batch.length;
  }

  await prisma.stageQuestion.createMany({ data: linksToCreate, skipDuplicates: true });

  return Response.json({ distributedCount: linksToCreate.length, createdVariants });
}
