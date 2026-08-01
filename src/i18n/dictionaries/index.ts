import { uzLatin } from "./uz-latin";
import { uzCyrl } from "./uz-cyrl";
import { ru } from "./ru";
import { Dictionary } from "./types";

export type Locale = "uz-latin" | "uz-cyrl" | "ru";

export const dictionaries: Record<Locale, Dictionary> = {
  "uz-latin": uzLatin,
  "uz-cyrl": uzCyrl,
  ru,
};

export const localeOptions: { value: Locale; label: string }[] = [
  { value: "uz-latin", label: "UZ" },
  { value: "uz-cyrl", label: "ЎЗ" },
  { value: "ru", label: "РУ" },
];
