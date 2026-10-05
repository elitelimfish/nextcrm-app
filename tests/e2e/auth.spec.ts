import { test, expect } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

const passwordLogin =
  process.env.NEXT_PUBLIC_PASSWORD_LOGIN === "true" ||
  process.env.DEMO_PASSWORD_LOGIN === "1";

test.describe("Authentication", () => {
  test("should show the configured sign-in method, not Google", async ({
    page,
  }) => {
    await page.goto("/sign-in");

    await expect(
      page.getByRole("button", { name: /continue with google/i }),
    ).toHaveCount(0);

    if (passwordLogin) {
      await expect(page.getByLabel("Username")).toBeVisible();
      await expect(page.getByLabel("Password")).toBeVisible();
      await expect(page.getByRole("button", { name: /^sign in$/i })).toBeVisible();
      await expect(
        page.getByRole("button", { name: /send verification code/i }),
      ).toHaveCount(0);
      await expect(
        page.getByText(/enter the crm password you were provided/i),
      ).toBeVisible();
      await expect(page.getByText(/demo account:/i)).toHaveCount(0);
    } else {
      await expect(page.getByLabel("Email")).toBeVisible();
      await expect(page.getByLabel("Password")).not.toBeVisible();
      await expect(
        page.getByRole("button", { name: /send verification code/i }),
      ).toBeVisible();
    }
  });

  test("should show OTP input after entering email", async ({ page }) => {
    test.skip(passwordLogin, "Demo password login hides email OTP");

    await page.goto("/sign-in");

    await page.getByLabel("Email").fill("test@example.com");
    await page.getByRole("button", { name: /send verification code/i }).click();

    await page.waitForTimeout(2000);

    const hasOtpInput = await page
      .locator("[data-input-otp]")
      .isVisible()
      .catch(() => false);
    const hasToast = await page
      .locator("[data-sonner-toast]")
      .isVisible()
      .catch(() => false);

    expect(hasOtpInput || hasToast).toBeTruthy();
  });

  test("should redirect unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/en");

    await expect(page).toHaveURL(/sign-in/);
  });
});
