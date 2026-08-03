import { prisma } from "@/lib/prisma";
import { requireApiSectionAccess } from "@/lib/require-admin";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSectionAccess("students");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  const body = await req.json();
  const { fullName, phone, groupName, password } = body;

  if (!fullName || !phone) {
    return new Response("Missing fields", { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing && existing.id !== id) {
    return new Response("Phone already exists", { status: 409 });
  }

  const data: any = { fullName, phone, groupName: groupName || null };
  if (password && password.trim().length > 0) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  const student = await prisma.user.update({ where: { id }, data });
  return Response.json({ student });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSectionAccess("students");
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  await prisma.user.delete({ where: { id } });
  return Response.json({ ok: true });
}
