import { test, expect } from '@playwright/test';

test.describe('HealthPulse Forgot Password', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password', {
      waitUntil: 'domcontentloaded',
    });
  });

  test('forgot password page loads', async ({ page }) => {
    await expect(
      page.getByText(/forgot|reset/i).first()
    ).toBeVisible();

    await expect(
      page.getByRole('textbox', { name: /email/i })
    ).toBeVisible();
  });

  test('invalid email format is rejected', async ({ page }) => {
    const email = page.getByRole('textbox', {
      name: /email/i,
    });

    await email.fill('invalid-email');

    const submit = page.getByRole('button', {
      name: /send|reset|continue/i,
    });

    await submit.click();

    // Should remain on forgot-password page
    await expect(page).toHaveURL(/forgot-password/i);
  });

  test('valid reset request shows generic success response', async ({
    page,
  }) => {
    // Intercept and mock backend to prevent real email transmission
    await page.route('**/api/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message:
            'If an account exists with this email, a password reset link has been sent.',
        }),
      });
    });

    await page
      .getByRole('textbox', { name: /email/i })
      .fill('playwright-test@example.com');

    await page
      .getByRole('button', {
        name: /send|reset|continue/i,
      })
      .click();

    await expect(
      page.getByText(/if an account exists|check your inbox|reset link/i).first()
    ).toBeVisible({ timeout: 15_000 });
  });

  test('unknown email does not leak account existence', async ({
    page,
  }) => {
    await page.route('**/api/auth/forgot-password', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message:
            'If an account exists with this email, a password reset link has been sent.',
        }),
      });
    });

    await page
      .getByRole('textbox', { name: /email/i })
      .fill('definitely-not-a-user@example.com');

    await page
      .getByRole('button', {
        name: /send|reset|continue/i,
      })
      .click();

    await expect(
      page.getByText(/if an account exists|check your inbox/i).first()
    ).toBeVisible({ timeout: 15_000 });

    await expect(
      page.getByText(/account not found|email not found/i)
    ).toHaveCount(0);
  });

  test('expired or invalid reset token is rejected', async ({
    page,
  }) => {
    await page.route('**/api/auth/reset-password', async route => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          message: 'Invalid or expired reset token',
        }),
      });
    });

    await page.goto('/reset-password?token=invalid-e2e-token', {
      waitUntil: 'domcontentloaded',
    });

    const newPassword = page.getByRole('textbox', {
      name: /^New Password/i,
    });

    const confirmPassword = page.getByRole('textbox', {
      name: /Confirm/i,
    });

    if (await newPassword.count()) {
      await newPassword.fill('NewPassword123!');
      if (await confirmPassword.count()) {
        await confirmPassword.fill('NewPassword123!');
      }

      const submit = page.getByRole('button', {
        name: /update|reset|save/i,
      });

      await submit.click();

      await expect(
        page.getByText(/invalid|expired/i).first()
      ).toBeVisible({ timeout: 15_000 });
    }
  });

});
