"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const IDLE_LIMIT_MS = 5 * 60 * 1000; // 5 daqiqa

export function useIdleLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, IDLE_LIMIT_MS);
    }

    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, resetTimer));

    // Sahifa qayta ko'rinadigan bo'lganda (masalan boshqa tabdan qaytilganda) ham tekshiramiz
    function handleVisibility() {
      if (document.visibilityState === "visible") resetTimer();
    }
    document.addEventListener("visibilitychange", handleVisibility);

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);
}
