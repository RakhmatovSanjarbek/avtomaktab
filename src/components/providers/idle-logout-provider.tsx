"use client";

import { useIdleLogout } from "@/hooks/useIdleLogout";

export function IdleLogoutProvider({ children }: { children: React.ReactNode }) {
  useIdleLogout();
  return <>{children}</>;
}
