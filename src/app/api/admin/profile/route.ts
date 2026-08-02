import { requireAdmin } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const userId = (session.user as any).id as string;
  const body = await req.json();
  const { fullName, email, password } = body;

  if (email && email.trim()) {
    const existing = await prisma.user.findUnique({ where: { email: email.trim() } });
    if (existing && existing.id !== userId) {
      return new Response("EMAIL_TAKEN", { status: 409 });
    }
  }

  const data: any = {};
  if (fullName) data.fullName = fullName;
  data.email = email && email.trim() ? email.trim() : null;
  if (password && password.trim().length > 0) {
    data.passwordHash = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({ where: { id: userId }, data });
  return Response.json({ ok: true });
}
