import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "serial" });

test("service worker serves offline shell for navigations when offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await reg.update();
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(
    () =>
      Boolean(
        navigator.serviceWorker.controller &&
          navigator.serviceWorker.controller.scriptURL.includes("sw.js"),
      ),
    { timeout: 20_000 },
  );

  await context.setOffline(true);
  try {
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("offline-title")).toBeVisible({
      timeout: 20_000,
    });
  } finally {
    await context.setOffline(false);
  }
});
