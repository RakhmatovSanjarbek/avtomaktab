import { cookies } from "next/headers";
import { Locale } from "@/i18n/dictionaries";

export async function getLocaleServer(fallback?: Locale): Promise<Locale> {
  const store = await cookies();
  const cookieValue = store.get("app_locale")?.value as Locale | undefined;
  const validLocales: Locale[] = ["uz-latin", "uz-cyrl", "ru"];

  if (cookieValue && validLocales.includes(cookieValue)) {
    return cookieValue;
  }
  return fallback ?? "uz-latin";
}
