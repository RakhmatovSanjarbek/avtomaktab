import { prisma } from "@/lib/prisma";

export async function GET() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  return Response.json({ settings });
}
