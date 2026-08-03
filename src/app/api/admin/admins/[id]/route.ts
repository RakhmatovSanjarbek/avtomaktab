import { requireSuperAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "ADMIN") {
    return new Response("NOT_FOUND", { status: 404 });
  }

  const body = await req.json();
  const { fullName, phone, password, allowedSections, workDays, workStartTime, workEndTime, isActive } = body;

  const data: any = {};
  if (fullName !== undefined) data.fullName = fullName.trim();
  if (phone !== undefined) data.phone = phone.trim();
  if (allowedSections !== undefined) data.allowedSections = allowedSections;
  if (workDays !== undefined) data.workDays = workDays && workDays.length > 0 ? workDays : null;
  if (workStartTime !== undefined) data.workStartTime = workStartTime || null;
  if (workEndTime !== undefined) data.workEndTime = workEndTime || null;
  if (isActive !== undefined) data.isActive = isActive;
  if (password && password.trim().length > 0) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  if (data.phone && data.phone !== target.phone) {
    const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
    if (existing) return new Response("PHONE_TAKEN", { status: 409 });
  }

  const updated = await prisma.user.update({ where: { id }, data });
  return Response.json({ admin: updated });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSuperAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const superAdminId = (session.user as any).id as string;

  if (id === superAdminId) {
    return new Response("CANNOT_DELETE_SELF", { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target || target.role !== "ADMIN") {
    return new Response("NOT_FOUND", { status: 404 });
  }

  await prisma.user.delete({ where: { id } });
  return Response.json({ ok: true });
}
