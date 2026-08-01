import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const mistakes = await prisma.userMistake.findMany({
    where: { userId, isResolved: false },
    orderBy: [{ mistakeCount: "desc" }, { lastMistakeAt: "desc" }],
    include: { question: { include: { options: { orderBy: { order: "asc" } } } } },
  });

  return Response.json({
    mistakes: mistakes.map((m) => ({ question: m.question, mistakeCount: m.mistakeCount })),
  });
}
