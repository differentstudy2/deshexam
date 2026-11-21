/**
 * Question shape helpers for the studio player.
 * Mirrors the overlay's normalisation: options may be an array of
 * {key, text}, an object {a, b, c, d, e?}, or a JSON string of either.
 */

export interface StudioOption {
  key: string;
  text: string;
}

export function normalizeOptions(q: any): StudioOption[] {
  if (!q?.options) return [];
  let parsed: any = q.options;
  if (typeof parsed === "string") {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  const arr = [
    { key: "a", text: parsed?.a || "" },
    { key: "b", text: parsed?.b || "" },
    { key: "c", text: parsed?.c || "" },
    { key: "d", text: parsed?.d || "" },
  ];
  if (parsed?.e) arr.push({ key: "e", text: parsed.e });
  return arr.filter((x) => x.text);
}

export function isCorrectOption(q: any, key: string): boolean {
  return (
    !!q?.correctAnswer &&
    String(q.correctAnswer).toLowerCase().includes(key.toLowerCase())
  );
}

/** Bengali option letters — ক খ গ ঘ ঙ for a b c d e. */
export function optionLetter(index: number, key: string): string {
  const letters = ["ক", "খ", "গ", "ঘ", "ঙ"];
  return letters[index] ?? key.toUpperCase();
}
