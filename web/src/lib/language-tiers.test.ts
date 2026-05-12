import { describe, expect, it } from "vitest";
import { isTier3Language } from "@/lib/language-tiers";

describe("language-tiers", () => {
  it("flags tier-3 codes", () => {
    expect(isTier3Language("mt")).toBe(true);
    expect(isTier3Language("MT-foo")).toBe(true);
  });

  it("does not flag major languages", () => {
    expect(isTier3Language("de")).toBe(false);
    expect(isTier3Language("fr")).toBe(false);
  });
});
