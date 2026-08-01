import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-admin";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      fullName: true,
      phone: true,
      groupName: true,
      deviceId: true,
      isDeviceLocked: true,
    },
  });

  return Response.json({ students });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const body = await req.json();
  const { fullName, phone, groupName, password } = body;

  if (!fullName || !phone || !password) {
    return new Response("Missing fields", { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { phone } });
  if (existing) {
    return new Response("Phone already exists", { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const student = await prisma.user.create({
    data: {
      fullName,
      phone,
      groupName: groupName || null,
      passwordHash,
      role: "STUDENT",
    },
  });

  return Response.json({ student });
}
