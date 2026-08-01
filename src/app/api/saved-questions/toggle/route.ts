import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as any).id as string;

  const { questionId } = await req.json();
  if (!questionId) return new Response("Missing questionId", { status: 400 });

  const existing = await prisma.savedQuestion.findUnique({
    where: { userId_questionId: { userId, questionId } },
  });

  if (existing) {
    await prisma.savedQuestion.delete({ where: { userId_questionId: { userId, questionId } } });
    return Response.json({ saved: false });
  } else {
    await prisma.savedQuestion.create({ data: { userId, questionId } });
    return Response.json({ saved: true });
  }
}
