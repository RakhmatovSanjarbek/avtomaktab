import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const { questionIds } = await req.json();
  if (!Array.isArray(questionIds)) return new Response("Invalid payload", { status: 400 });

  const saved = await prisma.savedQuestion.findMany({
    where: { userId, questionId: { in: questionIds } },
    select: { questionId: true },
  });

  return Response.json({ savedIds: saved.map((s) => s.questionId) });
}
