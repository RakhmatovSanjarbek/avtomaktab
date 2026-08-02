import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return Response.json({ settings });
}

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const body = await req.json();
  const { adminPhone, adminTelegram, instagramUrl, telegramChannel } = body;

  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: { adminPhone, adminTelegram, instagramUrl, telegramChannel },
    create: { id: "singleton", adminPhone, adminTelegram, instagramUrl, telegramChannel },
  });

  return Response.json({ settings });
}
