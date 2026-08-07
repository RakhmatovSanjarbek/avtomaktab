import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const variants = await prisma.stage.findMany({
    where: { type: "VARIANT" },
    include: { _count: { select: { questions: true } }, questions: { select: { questionId: true, stageId: true } } },
  });
  for (const v of variants) {
    console.log(`Variant: ${v.id} | title: ${JSON.stringify(v.titleJson)} | count: ${v._count.questions}`);
    v.questions.forEach((q) => console.log(`   -> questionId: ${q.questionId}, stageId: ${q.stageId}`));
  }
}

main().then(() => prisma.$disconnect());
