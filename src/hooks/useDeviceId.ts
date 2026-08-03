// src/hooks/useDeviceId.ts
"use client";
import { useEffect, useState } from "react";

const STORAGE_KEY = "device_id";

function generateId(): string {
  // HTTPS/localhost (xavfsiz kontekst) bo'lsa — brauzerning o'z UUID generatorini ishlatamiz
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    try {
      return crypto.randomUUID();
    } catch {
      // ba'zi brauzerlarda xavfsiz bo'lmagan kontekstda funksiya mavjud, lekin chaqirilganda xato beradi
    }
  }
  // Zaxira: oddiy HTTP kontekstida ham ishlaydigan tasodifiy ID generatori
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = generateId();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}
