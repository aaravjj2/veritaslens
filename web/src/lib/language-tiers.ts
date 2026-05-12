/** Lower-resource EU languages: show a gentle confidence notice in UI. */
export const TIER_3_LANGUAGES = new Set([
  "mt",
  "ga",
  "cy",
  "lv",
  "lt",
  "et",
  "is",
  "lb",
]);

export function isTier3Language(code: string): boolean {
  return TIER_3_LANGUAGES.has(code.toLowerCase().split("-")[0] ?? "");
}
