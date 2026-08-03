import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { isWithinWorkingHours } from "@/lib/schedule";

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

  // Faqat oddiy ADMIN uchun: faollik va ish vaqti tekshiruvi (SUPER_ADMIN cheklovsiz)
  if (user.role === "ADMIN") {
    if (!user.isActive) {
      return Response.json({ ok: false, code: "ACCOUNT_DISABLED" });
    }
    const workDays = (user.workDays as number[] | null) ?? null;
    if (!isWithinWorkingHours(workDays, user.workStartTime, user.workEndTime)) {
      return Response.json({ ok: false, code: "OUTSIDE_HOURS" });
    }
  }

  // STUDENT uchun qurilma tekshiruvi
  if (user.role === "STUDENT" && user.deviceId && user.deviceId !== deviceId) {
    return Response.json({ ok: false, code: "DEVICE_MISMATCH" });
  }

  return Response.json({ ok: true });
}
