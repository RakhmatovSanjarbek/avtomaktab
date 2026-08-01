type Attempt = { count: number; firstAttemptAt: number; blockedUntil: number | null };

const attempts = new Map<string, Attempt>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000; // 10 daqiqa oyna
const BLOCK_MS = 15 * 60 * 1000; // 15 daqiqa bloklash

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = attempts.get(key);

  if (!entry) {
    attempts.set(key, { count: 1, firstAttemptAt: now, blockedUntil: null });
    return { allowed: true };
  }

  if (entry.blockedUntil && now < entry.blockedUntil) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.blockedUntil - now) / 1000) };
  }

  if (now - entry.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now, blockedUntil: null });
    return { allowed: true };
  }

  entry.count++;
  if (entry.count > MAX_ATTEMPTS) {
    entry.blockedUntil = now + BLOCK_MS;
    attempts.set(key, entry);
    return { allowed: false, retryAfterSec: Math.ceil(BLOCK_MS / 1000) };
  }

  attempts.set(key, entry);
  return { allowed: true };
}

export function resetRateLimit(key: string) {
  attempts.delete(key);
}

// Eskirgan yozuvlarni vaqti-vaqti bilan tozalash (xotira sizib ketmasligi uchun)
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of attempts.entries()) {
    if ((!entry.blockedUntil || now > entry.blockedUntil) && now - entry.firstAttemptAt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}, 5 * 60 * 1000);
