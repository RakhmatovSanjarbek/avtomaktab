import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const locale = body?.locale;

  if (!["uz-latin", "uz-cyrl", "ru"].includes(locale)) {
    return new Response("Invalid locale", { status: 400 });
  }

  await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { preferredLang: locale },
  });

  return Response.json({ ok: true });
}
