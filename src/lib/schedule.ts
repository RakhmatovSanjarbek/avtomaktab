// Toshkent vaqti bo'yicha ish kuni/soatini tekshirish

function getTashkentParts(): { weekday: number; hhmm: string } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(now);
  const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const hour = parts.find((p) => p.type === "hour")?.value ?? "00";
  const minute = parts.find((p) => p.type === "minute")?.value ?? "00";
  return { weekday: weekdayMap[weekdayStr] ?? 0, hhmm: `${hour}:${minute}` };
}

export function isWithinWorkingHours(
  workDays: number[] | null | undefined,
  workStartTime: string | null | undefined,
  workEndTime: string | null | undefined
): boolean {
  const { weekday, hhmm } = getTashkentParts();

  if (workDays && workDays.length > 0 && !workDays.includes(weekday)) {
    return false;
  }

  if (workStartTime && workEndTime) {
    if (hhmm < workStartTime || hhmm > workEndTime) {
      return false;
    }
  }

  return true;
}
