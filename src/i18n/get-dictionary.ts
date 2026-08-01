import { dictionaries, Locale } from "./dictionaries";

// Server komponentlar uchun (masalan dashboard/page.tsx) —
// useLanguage() hookisiz, to'g'ridan-to'g'ri lug'atni oladi
export function getDictionary(locale: Locale | null | undefined) {
  return dictionaries[locale ?? "uz-latin"];
}
