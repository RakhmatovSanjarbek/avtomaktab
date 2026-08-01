import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const body = await req.json();
  const { phone, password, deviceId } = body;

  if (!phone || !password || !deviceId) {
    return Response.json({ ok: false, code: "INVALID" });
  }

  const rate = checkRateLimit(`login:${phone}`);
  if (!rate.allowed) {
    return Response.json({ ok: false, code: "RATE_LIMITED", retryAfterSec: rate.retryAfterSec });
  }

  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    return Response.json({ ok: false, code: "INVALID" });
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return Response.json({ ok: false, code: "INVALID" });
  }

  // Qurilmani tekshirish (hali o'zgartirmasdan, faqat o'qish)
  if (user.deviceId && user.deviceId !== deviceId) {
    return Response.json({ ok: false, code: "DEVICE_MISMATCH" });
  }

  return Response.json({ ok: true });
}
