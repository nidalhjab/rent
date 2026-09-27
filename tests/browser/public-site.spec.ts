import { expect, test } from "@playwright/test";

for (const width of [320, 375, 768, 1440]) {
  test(`public pages fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/items", "/items/new"]) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("lang", "ar-PS");
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      if (path === "/items") await expect(page.getByRole("heading", { name: "الفساتين المتاحة" })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, path).toBeLessThanOrEqual(1);
    }
  });
}

test("mobile dress viewer, calendar, and desktop gallery work", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/items");
  const card = page.locator('a[href^="/items/"]').filter({ has: page.locator("img") }).first();
  await expect(card).toBeVisible();
  await card.click();
  await expect(page.locator("h1")).toBeVisible();
  const openImage = page.getByRole("button", { name: /عرض الصورة بملء الشاشة/ });
  await expect(openImage).toBeVisible();
  await openImage.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveCSS("object-fit", "contain");
  await expect.poll(() => dialog.locator("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  const bounds = await dialog.boundingBox();
  expect(bounds?.width).toBe(375);
  expect(bounds?.height).toBe(812);
  await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
  await page.getByRole("button", { name: "إغلاق الصورة" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(openImage).toBeFocused();
  await openImage.click();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();

  const back = page.locator("button").filter({ has: page.getByAltText("من الخلف", { exact: true }) });
  await back.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("img")).toHaveAttribute("alt", /من الخلف/);
  await page.getByRole("button", { name: "إغلاق الصورة" }).click();

  const date = page.locator('input[name="preferredDate"]');
  await expect(date).toBeVisible();
  await expect(date).toHaveAttribute("required", "");
  await expect(date).toHaveAttribute("min", /^\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByText(/أول موعد متاح للحجز/)).toBeVisible();
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
  await expect(openImage).not.toBeVisible();
  await back.click();
  await expect(dialog).not.toBeVisible();
});

test("search engines receive canonical Arabic pages, sitemap, and protected admin metadata", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://rent-jade-sigma.vercel.app/");
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "ar_PS");
  await expect(page).toHaveTitle(/فساتين مستعملة للإيجار في فلسطين/);
  const structured = await page.locator('script[type="application/ld+json"]').first().textContent();
  expect(JSON.parse(structured!)["@graph"][0].inLanguage).toBe("ar-PS");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("https://rent-jade-sigma.vercel.app/sitemap.xml");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const xml = await sitemap.text();
  expect(xml).toContain("https://rent-jade-sigma.vercel.app/items/");
  expect(xml).not.toContain("localhost");
  expect(xml).not.toContain("/admin");
  await page.goto("/items?q=فستان");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto("/admin");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
