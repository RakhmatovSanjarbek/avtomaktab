import { auth } from "@/auth";
import { buildExamQuestionSet } from "@/lib/exam-algorithm";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  const mode = body?.mode === 50 ? 50 : 20;
  const timeLimitSec = mode === 50 ? 45 * 60 : 20 * 60;

  const userId = (session.user as any).id as string;
  const questions = await buildExamQuestionSet(mode, userId);

  // Frontendga to'g'ri javobni ochib bermaslik uchun isCorrect'ni yashiramiz
  const safeQuestions = questions.map((q) => ({
    id: q.id,
    textJson: q.textJson,
    imageUrl: q.imageUrl,
    options: q.options.map((o) => ({ id: o.id, optionTextJson: o.optionTextJson })),
  }));

  return Response.json({ questions: safeQuestions, timeLimitSec, mode });
}
