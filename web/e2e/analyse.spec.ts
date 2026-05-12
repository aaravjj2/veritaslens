import { expect, test } from "@playwright/test";

test("paste flow returns mocked analysis (NDJSON stream)", async ({ page }) => {
  const finalPayload = {
    type: "final" as const,
    language: "en",
    overall_score: 88,
    summary: "Looks consistent with reputable sourcing.",
    tactics: [
      {
        name: "no-issues",
        explanation: "No major rhetorical red flags.",
        severity: "low",
      },
    ],
    sentences: [
      {
        text: "The European Parliament met on Tuesday.",
        score: 90,
        issues: ["no-issues"],
        source_ids: [],
      },
    ],
    share_id: "00000000-0000-4000-8000-000000000001",
  };

  const ndjson =
    `${JSON.stringify({ type: "delta", text: "" })}\n` +
    `${JSON.stringify(finalPayload)}\n`;

  await page.route("**/api/analyse", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/x-ndjson; charset=utf-8",
      body: ndjson,
    });
  });

  await page.goto("/analyse");
  await page.getByPlaceholder("Paste suspicious paragraphs").fill(
    "The European Parliament met on Tuesday.",
  );
  await page.getByRole("button", { name: "Run analysis" }).click();
  await expect(page.getByText("Overall credibility")).toBeVisible();
  await expect(page.getByText(/\b88\b/)).toBeVisible();
});
