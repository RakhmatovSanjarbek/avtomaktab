import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const saved = await prisma.savedQuestion.findMany({
    where: { userId },
    orderBy: { savedAt: "desc" },
    include: { question: { include: { options: { orderBy: { order: "asc" } } } } },
  });

  return Response.json({ questions: saved.map((s) => s.question) });
}
