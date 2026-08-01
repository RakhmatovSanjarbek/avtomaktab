const LOCALE_KEY: Record<string, string> = { "uz-latin": "uzLatin", "uz-cyrl": "uzCyrl", ru: "ru" };

export function textFor(json: any, locale: string): string {
  if (!json) return "";
  return json[LOCALE_KEY[locale]] ?? json.uzLatin ?? "";
}
