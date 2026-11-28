import { expect, test } from "@playwright/test";

const MAILHOG_API_URL = process.env.MAILHOG_API_URL ?? "http://localhost:8025/api/v2/messages";

interface IMailHogMessage {
  Content: {
    Headers: {
      To?: string[];
    };
    Body: string;
  };
  MIME?: {
    Parts?: Array<{ Body: string }>;
  };
}

interface IMailHogResponse {
  items: IMailHogMessage[];
}

const decodeQuotedPrintable = (input: string): string =>
  input
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-Fa-f]{2})/g, (_match, hex: string) => String.fromCharCode(Number.parseInt(hex, 16)));

const readLatestOtpFromMailHog = async (email: string): Promise<string> => {
  for (let attempt = 0; attempt < 15; attempt++) {
    const response = await fetch(MAILHOG_API_URL);
    if (response.ok) {
      const data = (await response.json()) as IMailHogResponse;
      const message = data.items.find((item) => item.Content.Headers.To?.some((to) => to.toLowerCase().includes(email.toLowerCase())));
      if (message) {
        const decoded = decodeQuotedPrintable(message.Content.Body);
        const match = decoded.match(/>(\d{6})</) ?? decoded.match(/(?<!#)\b(\d{6})\b/);
        if (match) return match[1];
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(`OTP email for ${email} was not found in MailHog`);
};

test.describe("Cinema client application (Stage 3)", () => {
  test("completes seat selection, 5-seat limit check, and two-step guest checkout with 10-minute hold", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const buyLinks = page.locator('a[href^="/sessions/"]');
    await expect(buyLinks.first()).toBeVisible();
    await buyLinks.first().click();

    await expect(page).toHaveURL(/\/sessions\/\d+/);
    await expect(page.getByText("ЭКРАН")).toBeVisible();

    const availableSeats = page.locator('button[aria-pressed="false"]:not([disabled])');
    const availableCount = await availableSeats.count();
    expect(availableCount).toBeGreaterThan(0);

    const clicksToTestLimit = Math.min(availableCount, 6);
    for (let index = 0; index < clicksToTestLimit; index++) {
      await availableSeats.first().click();
    }

    if (clicksToTestLimit === 6) {
      await expect(page.getByText(/не более 5 мест/i)).toBeVisible();
    }

    const selectedSeats = page.locator('button[aria-pressed="true"]');
    while ((await selectedSeats.count()) > 1) {
      await selectedSeats.last().click();
    }
    expect(await selectedSeats.count()).toBe(1);

    await page.getByRole("button", { name: "Далее" }).click();
    await expect(page.getByRole("heading", { name: "Оформление заказа" })).toBeVisible();

    const uniqueEmail = `e2e-guest-${Date.now()}@example.com`;
    await page.getByLabel("Электронная почта").fill(uniqueEmail);
    await page.getByLabel("Имя (необязательно)").fill("Тест Зритель");
    await page.getByLabel(/Согласен на обработку персональных данных/i).check();

    const ageCheckbox = page.getByLabel(/мне исполнилось 18 лет/i);
    if (await ageCheckbox.isVisible()) {
      await ageCheckbox.check();
    }

    await page.getByRole("button", { name: "Перейти к оплате" }).click();
    await expect(page.getByRole("heading", { name: "Места забронированы" })).toBeVisible();
    await expect(page.getByText(/Заказ L-/i)).toBeVisible();
    await expect(page.getByText(/^\d{2}:\d{2}$/)).toBeVisible();
  });

  test("protects /cabinet via proxy, logs in with OTP from MailHog, updates profile, and logs out", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/cabinet");

    await expect(page).toHaveURL(/\/login\?next=%2Fcabinet/);

    const email = `e2e-otp-${Date.now()}@example.com`;
    await page.getByLabel("Электронная почта").fill(email);
    await page.getByRole("button", { name: "Получить код" }).click();

    await expect(page.getByLabel("Код из письма")).toBeVisible();
    const otpCode = await readLatestOtpFromMailHog(email);

    await page.getByLabel("Код из письма").fill(otpCode);
    await page.getByRole("button", { name: "Войти" }).click();

    await expect(page).toHaveURL(/\/cabinet$/);
    await expect(page.getByRole("heading", { name: "Мои билеты" })).toBeVisible();

    await page.getByRole("button", { name: "Профиль" }).click();
    await page.getByLabel("Имя").fill("Елена Смирнова");
    await page.getByLabel("Телефон").fill("+79995554433");
    await page.getByRole("button", { name: "Сохранить" }).click();
    await expect(page.getByText("Данные сохранены")).toBeVisible();

    await page.reload();
    await page.getByRole("button", { name: "Профиль" }).click();
    await expect(page.getByLabel("Имя")).toHaveValue("Елена Смирнова");

    await page.getByRole("button", { name: "Выйти" }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.goto("/cabinet");
    await expect(page).toHaveURL(/\/login\?next=%2Fcabinet/);
  });

  test("renders all key client pages cleanly at 360px mobile width without horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });

    await page.goto("/");
    const firstFilmHref = await page.locator('a[href^="/films/"]').first().getAttribute("href");
    const firstSessionHref = await page.locator('a[href^="/sessions/"]').first().getAttribute("href");

    const routesToCheck = ["/", firstFilmHref, firstSessionHref, "/login", "/orders/LUCH-E2E00001"].filter(
      (route): route is string => Boolean(route),
    );

    for (const route of routesToCheck) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `Horizontal overflow detected on ${route} at 360px`).toBeLessThanOrEqual(0);
    }
  });
});
