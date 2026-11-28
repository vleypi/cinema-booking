import { expect, type Page, test } from "@playwright/test";

const CRM_BASE_URL = process.env.CRM_BASE_URL ?? "http://localhost:3002";
const CRM_LOGIN = process.env.CRM_ADMIN_LOGIN ?? "admin";
const CRM_PASSWORD = process.env.CRM_ADMIN_PASSWORD ?? "Admin-Password-1";

const loginToCrm = async (page: Page) => {
  await page.goto(`${CRM_BASE_URL}/login`);
  await page.getByLabel("Логин").fill(CRM_LOGIN);
  await page.getByLabel("Пароль").fill(CRM_PASSWORD);
  await page.getByRole("button", { name: "Войти" }).click();
  await expect(page).not.toHaveURL(/\/login/);
};

test.describe("CRM Box Office, QR Scanner, Reports & Refunds (Stage 4)", () => {
  test("sells tickets at box office, verifies A4 and 80mm PDF printing, searches order, and performs cash refund", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await loginToCrm(page);

    await page.goto(`${CRM_BASE_URL}/box-office`);
    await expect(page.getByRole("heading", { name: "Касса" })).toBeVisible();

    await page.getByRole("button", { name: "Следующий день" }).click();
    await page.waitForTimeout(400);

    let sessionCard = page.locator("button").filter({ hasText: /\d{2}:\d{2}/ }).first();
    for (let shift = 0; shift < 4; shift++) {
      if (await sessionCard.isVisible().catch(() => false)) break;
      await page.getByRole("button", { name: "Следующий день" }).click();
      await page.waitForTimeout(400);
      sessionCard = page.locator("button").filter({ hasText: /\d{2}:\d{2}/ }).first();
    }

    await expect(sessionCard).toBeVisible();
    await sessionCard.click();

    await expect(page.getByText("Экран")).toBeVisible();

    const availableSeats = page.locator('button[aria-pressed="false"]:not([disabled])');
    const availableCount = await availableSeats.count();
    expect(availableCount).toBeGreaterThan(0);

    const seatsToPick = Math.min(availableCount, 2);
    for (let index = 0; index < seatsToPick; index++) {
      await availableSeats.first().click();
    }

    await page.getByRole("button", { name: "Продать билеты" }).click();

    const successHeading = page.getByRole("heading", { name: /Заказ L-.*оформлен/i });
    await expect(successHeading).toBeVisible();
    const headingText = (await successHeading.textContent()) ?? "";
    const orderNumberMatch = headingText.match(/L-[A-Z0-9-]+/i);
    expect(orderNumberMatch).not.toBeNull();
    const orderNumber = orderNumberMatch?.[0] ?? "";

    const a4Link = page.getByRole("link", { name: "Печать A4" });
    const receiptLink = page.getByRole("link", { name: "Чек 80 мм" });
    await expect(a4Link).toBeVisible();
    await expect(receiptLink).toBeVisible();

    const a4Href = await a4Link.getAttribute("href");
    const receiptHref = await receiptLink.getAttribute("href");
    expect(a4Href).toContain("format=a4");
    expect(receiptHref).toContain("format=receipt");

    const a4Response = await page.request.get(`${CRM_BASE_URL}${a4Href}`);
    expect(a4Response.status()).toBe(200);
    expect(a4Response.headers()["content-type"]).toContain("application/pdf");
    expect((await a4Response.body()).toString("latin1").startsWith("%PDF-")).toBe(true);

    const receiptResponse = await page.request.get(`${CRM_BASE_URL}${receiptHref}`);
    expect(receiptResponse.status()).toBe(200);
    expect((await receiptResponse.body()).toString("latin1")).toContain("226.77");

    await page.getByRole("button", { name: "Поиск и возврат заказов" }).click();
    await page.getByPlaceholder(/Номер заказа/i).fill(orderNumber);
    await page.getByRole("button", { name: "Найти" }).click();

    await expect(page.getByText(orderNumber)).toBeVisible();

    const refundButton = page.getByRole("button", { name: "Возврат", exact: true }).first();
    await expect(refundButton).toBeVisible();
    await refundButton.click();

    await expect(page.getByRole("heading", { name: `Возврат по заказу ${orderNumber}` })).toBeVisible();
    await page.getByRole("button", { name: "Оформить возврат" }).click();

    await expect(page.getByText(new RegExp(`Возврат по заказу ${orderNumber}`, "i"))).toBeVisible();
  });

  test("operates mobile QR scanner in 360px viewport, displays fullscreen deny overlay, and has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await loginToCrm(page);

    await page.goto(`${CRM_BASE_URL}/scanner`);
    await expect(page.getByRole("heading", { name: "Сканер билетов" })).toBeVisible();
    await expect(page.getByLabel("Зал на входе")).toBeVisible();

    const scannerOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(scannerOverflow, "Horizontal overflow on /scanner at 360px").toBeLessThanOrEqual(0);

    await page.getByLabel("Код билета").fill("INVALID999");
    await page.getByRole("button", { name: "Проверить билет" }).click();

    const dialog = page.getByRole("dialog", { name: "Проход запрещён" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/не найден/i)).toBeVisible();

    await dialog.getByRole("button", { name: "Сканировать следующий" }).click();
    await expect(dialog).toBeHidden();
  });

  test("renders CRM reports, audit log, and customer /refund page cleanly", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await loginToCrm(page);

    await page.goto(`${CRM_BASE_URL}/reports`);
    await expect(page.getByRole("heading", { name: "Отчёты" })).toBeVisible();
    await expect(page.getByText("Чистая выручка").first()).toBeVisible();
    await page.getByRole("button", { name: "Заполняемость" }).click();
    await expect(page.getByRole("button", { name: "Заполняемость" })).toBeVisible();

    await page.goto(`${CRM_BASE_URL}/audit`);
    await expect(page.getByRole("heading", { name: "Журнал аудита" })).toBeVisible();

    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/refund");
    await expect(page.getByRole("heading", { name: "Оформление возврата" })).toBeVisible();
    await expect(page.getByText("Ссылка на возврат недействительна")).toBeVisible();

    const refundOverflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(refundOverflow, "Horizontal overflow on /refund at 360px").toBeLessThanOrEqual(0);
  });
});
