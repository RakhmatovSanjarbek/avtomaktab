// O'zbek lotin -> kril transliteratsiyasi (qat'iy qoidaviy, ma'no o'zgarmaydi)

const DIGRAPHS: [string, string][] = [
  ["sh", "ш"],
  ["ch", "ч"],
  ["yo", "ё"],
  ["yu", "ю"],
  ["ya", "я"],
];

const SINGLE_MAP: Record<string, string> = {
  a: "а", b: "б", c: "к", d: "д", f: "ф", g: "г", h: "ҳ", i: "и", j: "ж",
  k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "қ", r: "р", s: "с",
  t: "т", u: "у", v: "в", x: "х", y: "й", z: "з",
};

function isApostrophe(ch: string): boolean {
  return "'ʻʼ‘’`´".includes(ch);
}

function isLatinVowel(ch: string): boolean {
  return "aeiouAEIOU".includes(ch);
}

export function latinToCyrillic(input: string): string {
  if (!input) return "";
  const out: string[] = [];
  const s = input;
  const n = s.length;
  let i = 0;

  while (i < n) {
    const ch = s[i];
    const chLower = ch.toLowerCase();
    const isUpper = ch !== chLower && ch === ch.toUpperCase();

    // o' / g' (turli apostrof belgilari bilan)
    if ((chLower === "o" || chLower === "g") && i + 1 < n && isApostrophe(s[i + 1])) {
      const cyr = chLower === "o" ? "ў" : "ғ";
      out.push(isUpper ? cyr.toUpperCase() : cyr);
      i += 2;
      continue;
    }

    // ikki harfli birikmalar: sh, ch, yo, yu, ya
    if (i + 1 < n) {
      const two = chLower + s[i + 1].toLowerCase();
      const found = DIGRAPHS.find(([lat]) => lat === two);
      if (found) {
        out.push(isUpper ? found[1].toUpperCase() : found[1]);
        i += 2;
        continue;
      }
    }

    // yolg'iz apostrof (tutuq belgisi) — masalan "ma'no" -> "маъно"
    if (isApostrophe(ch)) {
      out.push("ъ");
      i += 1;
      continue;
    }

    // "e" harfi — kontekstga qarab "э" yoki "е"
    if (chLower === "e") {
      const prevChar = i > 0 ? s[i - 1] : "";
      const isPrevLetter = /[a-zA-Z]/.test(prevChar);
      const atWordStart = !isPrevLetter;
      const afterVowel = isPrevLetter && isLatinVowel(prevChar);
      const cyr = atWordStart || afterVowel ? "э" : "е";
      out.push(isUpper ? cyr.toUpperCase() : cyr);
      i += 1;
      continue;
    }

    const mapped = SINGLE_MAP[chLower];
    if (mapped) {
      out.push(isUpper ? mapped.toUpperCase() : mapped);
      i += 1;
      continue;
    }

    // raqam, bo'shliq, tinish belgilari — o'zgarishsiz qoladi
    out.push(ch);
    i += 1;
  }

  return out.join("");
}
