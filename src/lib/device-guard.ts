// src/lib/device-guard.ts
import { prisma } from "./prisma";

export class DeviceMismatchError extends Error {
  constructor() {
    super("DEVICE_MISMATCH");
    this.name = "DeviceMismatchError";
  }
}

/**
 * Foydalanuvchi login qilganda chaqiriladi.
 * - ADMIN va SUPER_ADMIN uchun qurilma cheklovi qo'llanilmaydi.
 * - STUDENT uchun:
 *   - Agar userda deviceId hali yo'q bo'lsa (birinchi kirish) — biriktiradi.
 *   - Agar mavjud bo'lsa — kelgan deviceId bilan solishtiradi.
 */
export async function verifyOrAssignDevice(userId: string, incomingDeviceId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");

  if (user.role !== "STUDENT") {
    return true;
  }

  if (!user.deviceId) {
    await prisma.user.update({
      where: { id: userId },
      data: { deviceId: incomingDeviceId, isDeviceLocked: true },
    });
    return true;
  }

  if (user.deviceId !== incomingDeviceId) {
    throw new DeviceMismatchError();
  }
  return true;
}

export async function resetDevice(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { deviceId: null, isDeviceLocked: false },
  });
}
