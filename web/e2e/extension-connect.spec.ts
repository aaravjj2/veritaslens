import { expect, test } from "@playwright/test";

test("extension connect page shows heading", async ({ page }) => {
  await page.goto("/extension/connect");
  await expect(page.getByTestId("extension-connect-heading")).toBeVisible();
});

test("generate token shows error when unauthenticated", async ({ page }) => {
  await page.goto("/extension/connect");
  await page.getByRole("button", { name: "Generate token" }).click();
  await expect(page.getByTestId("extension-token-error")).toContainText(
    "Unauthorized",
    { timeout: 10_000 },
  );
});
