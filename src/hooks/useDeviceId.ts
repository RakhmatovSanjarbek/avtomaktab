// src/hooks/useDeviceId.ts
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "device_id";

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    let id = localStorage.getItem(STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, id);
    }
    setDeviceId(id);
  }, []);

  return deviceId;
}