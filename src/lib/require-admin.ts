import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { isWithinWorkingHours } from "./schedule";

export async function requireAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || (role !== "ADMIN" && role !== "SUPER_ADMIN")) {
    return null;
  }
  return session;
}

export async function requireSuperAdmin() {
  const session = await auth();
  const role = (session?.user as any)?.role;
  if (!session?.user || role !== "SUPER_ADMIN") {
    return null;
  }
  return session;
}

/**
 * Sahifa (Server Component) darajasida ruxsatni tekshiradi.
 * SUPER_ADMIN har doim o'tadi. ADMIN faqat allowedSections'da bo'lsa o'tadi.
 * Ruxsat yo'q bo'lsa /admin ga qaytaradi.
 */
export async function requireSectionAccess(sectionKey: string) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as any).role;
  if (role === "SUPER_ADMIN") return session;
  if (role !== "ADMIN") redirect("/login");

  const allowedSections = ((session.user as any).allowedSections ?? []) as string[];
  const isActive = (session.user as any).isActive;
  const workDays = (session.user as any).workDays as number[] | null;
  const workStartTime = (session.user as any).workStartTime as string | null;
  const workEndTime = (session.user as any).workEndTime as string | null;

  if (!isActive || !isWithinWorkingHours(workDays, workStartTime, workEndTime)) {
    redirect("/login");
  }

  if (!allowedSections.includes(sectionKey)) {
    redirect("/admin");
  }

  return session;
}

/**
 * API route'lar uchun: sessiyani va bo'lim ruxsatini tekshiradi.
 * SUPER_ADMIN har doim o'tadi. ADMIN faqat allowedSections'da bo'lsa o'tadi.
 * Muvaffaqiyatsiz bo'lsa null qaytaradi — route shu holda 403 qaytarishi kerak.
 */
export async function requireApiSectionAccess(sectionKey: string) {
  const session = await auth();
  if (!session?.user) return null;

  const role = (session.user as any).role;
  if (role === "SUPER_ADMIN") return session;
  if (role !== "ADMIN") return null;

  const isActive = (session.user as any).isActive;
  const workDays = (session.user as any).workDays as number[] | null;
  const workStartTime = (session.user as any).workStartTime as string | null;
  const workEndTime = (session.user as any).workEndTime as string | null;
  if (!isActive || !isWithinWorkingHours(workDays, workStartTime, workEndTime)) {
    return null;
  }

  const allowedSections = ((session.user as any).allowedSections ?? []) as string[];
  if (!allowedSections.includes(sectionKey)) return null;

  return session;
}

/**
 * Bir nechta bo'limdan istalgan biriga ruxsati bo'lsa o'tkazadi.
 * Masalan: Bosqichli test bo'limi Ta'lim moduli bilan bir xil savollarni ishlatgani uchun,
 * "talim" YOKI "bosqichli" ruxsati bo'lgan admin ham kira olishi kerak.
 */
export async function requireApiAnySectionAccess(sectionKeys: string[]) {
  const session = await auth();
  if (!session?.user) return null;

  const role = (session.user as any).role;
  if (role === "SUPER_ADMIN") return session;
  if (role !== "ADMIN") return null;

  const isActive = (session.user as any).isActive;
  const workDays = (session.user as any).workDays as number[] | null;
  const workStartTime = (session.user as any).workStartTime as string | null;
  const workEndTime = (session.user as any).workEndTime as string | null;
  if (!isActive || !isWithinWorkingHours(workDays, workStartTime, workEndTime)) {
    return null;
  }

  const allowedSections = ((session.user as any).allowedSections ?? []) as string[];
  if (!sectionKeys.some((k) => allowedSections.includes(k))) return null;

  return session;
}
