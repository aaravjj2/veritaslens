import { describe, expect, it } from "vitest";
import { getAllowedSourceIds, getSourceListForPrompt } from "@/lib/sources";

describe("sources", () => {
  it("exposes at least 22 curated organisations", () => {
    expect(getAllowedSourceIds().size).toBeGreaterThanOrEqual(22);
  });

  it("maps prompt list with stable ids", () => {
    const list = getSourceListForPrompt();
    expect(list[0]).toHaveProperty("id");
    expect(list[0]).toHaveProperty("url");
  });
});
