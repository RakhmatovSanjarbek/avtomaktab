import { requireSuperAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await requireSuperAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, fullName: true, phone: true, role: true, isActive: true,
      allowedSections: true, workDays: true, workStartTime: true, workEndTime: true,
    },
  });

  return Response.json({ admins });
}

export async function POST(req: Request) {
  const session = await requireSuperAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const body = await req.json();
  const { fullName, phone, password, allowedSections, workDays, workStartTime, workEndTime } = body;

  if (!fullName?.trim() || !phone?.trim() || !password?.trim()) {
    return new Response("INVALID", { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone: phone.trim() } });
  if (existing) {
    return new Response("PHONE_TAKEN", { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const superAdminId = (session.user as any).id as string;

  const admin = await prisma.user.create({
    data: {
      fullName: fullName.trim(),
      phone: phone.trim(),
      passwordHash,
      role: "ADMIN",
      isActive: true,
      allowedSections: allowedSections ?? [],
      workDays: workDays && workDays.length > 0 ? workDays : null,
      workStartTime: workStartTime || null,
      workEndTime: workEndTime || null,
      createdByAdminId: superAdminId,
    },
  });

  return Response.json({ admin });
}
