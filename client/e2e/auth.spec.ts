import { test, expect } from '@playwright/test';

const BASE_URL = 'https://www.health-pulse.app';

test.describe('HealthPulse Authentication', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  });

  test('invalid patient credentials show error', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Patient', exact: true })
      .first()
      .click();

    await page
      .getByRole('textbox', { name: /Email address/i })
      .fill('invalid-healthpulse-test@example.com');

    await page
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill('WrongPassword123!');

    await page
      .getByRole('button', { name: /Sign In/i })
      .click();

    await expect(
      page.getByText(
        /incorrect|invalid|authentication|credentials/i
      ).first()
    ).toBeVisible({
      timeout: 60000,
    });
  });

  test('doctor portal login form works', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Doctor', exact: true })
      .first()
      .click();

    await expect(
      page.getByRole('textbox', { name: /Email address/i })
    ).toBeVisible();

    await expect(
      page.getByRole('textbox', {
        name: 'Password',
        exact: true,
      })
    ).toBeVisible();
  });

  test('admin portal login form works', async ({ page }) => {
    await page
      .getByRole('button', { name: 'Admin', exact: true })
      .first()
      .click();

    await expect(
      page.getByRole('textbox', { name: /Email|Username/i })
    ).toBeVisible();

    await expect(
      page.getByRole('textbox', {
        name: 'Password',
        exact: true,
      })
    ).toBeVisible();
  });

  test('forgot password link works', async ({ page }) => {
    await page
      .getByRole('link', { name: /Forgot password/i })
      .click();

    await expect(page).toHaveURL(/forgot-password/i);

    await expect(
      page.getByRole('textbox', { name: /email/i })
    ).toBeVisible();
  });

  test('protected patient route redirects unauthenticated user', async ({ page }) => {
    await page.goto(`${BASE_URL}/patient/dashboard`);

    await expect(page).toHaveURL(/login/i);
  });

  test('protected doctor route redirects unauthenticated user', async ({ page }) => {
    await page.goto(`${BASE_URL}/doctor/dashboard`);

    await expect(page).toHaveURL(/login/i);
  });

  test('protected admin route redirects unauthenticated user', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/dashboard`);

    await expect(page).toHaveURL(/login/i);
  });

});
