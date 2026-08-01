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
 * - Agar userda deviceId hali yo'q bo'lsa (birinchi kirish) — biriktiradi.
 * - Agar mavjud bo'lsa — kelgan deviceId bilan solishtiradi.
 */
export async function verifyOrAssignDevice(userId: string, incomingDeviceId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");

  // Birinchi marta kirish — device_id biriktiriladi
  if (!user.deviceId) {
    await prisma.user.update({
      where: { id: userId },
      data: { deviceId: incomingDeviceId, isDeviceLocked: true },
    });
    return true;
  }

  // Keyingi kirishlar — solishtirish
  if (user.deviceId !== incomingDeviceId) {
    throw new DeviceMismatchError();
  }

  return true;
}

/**
 * Admin panel uchun: qurilmani qayta biriktirish (Reset Device ID)
 */
export async function resetDevice(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { deviceId: null, isDeviceLocked: false },
  });
}