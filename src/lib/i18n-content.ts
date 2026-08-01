import { Locale } from "@/i18n/dictionaries";

// Question/Category kabi modellarning Json maydonlaridan
// (masalan { uzLatin: "...", uzCyrl: "...", ru: "..." }) to'g'ri tilni oladi
export function getLocalizedField(json: unknown, locale: Locale): string {
  if (!json || typeof json !== "object") return "";
  const map: Record<Locale, string> = {
    "uz-latin": "uzLatin",
    "uz-cyrl": "uzCyrl",
    ru: "ru",
  };
  const obj = json as Record<string, string>;
  return obj[map[locale]] ?? obj.uzLatin ?? "";
}
