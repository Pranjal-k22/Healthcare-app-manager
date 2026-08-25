import { test, expect, Page } from '@playwright/test';
import { logout } from './helpers/auth';

const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD;

async function loginAsAdmin(page: Page) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error(
      'TEST_ADMIN_EMAIL and TEST_ADMIN_PASSWORD are required'
    );
  }

  await page.goto('/login', {
    waitUntil: 'domcontentloaded',
  });

  await page
    .getByRole('button', { name: 'Admin', exact: true })
    .first()
    .click();

  await page
    .getByRole('textbox', {
      name: /Email|Username/i,
    })
    .fill(ADMIN_EMAIL);

  await page
    .getByRole('textbox', {
      name: 'Password',
      exact: true,
    })
    .fill(ADMIN_PASSWORD);

  await page
    .getByRole('button', { name: /Sign In/i })
    .click();

  await expect(page).toHaveURL(
    /admin\/dashboard/i,
    { timeout: 60_000 }
  );
}

test.describe('HealthPulse Admin Portal', () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    'Admin test credentials are not configured'
  );

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('admin dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/admin\/dashboard/i);

    await expect(
      page.getByText(/dashboard|admin|overview/i).first()
    ).toBeVisible();
  });

  test('admin session survives refresh', async ({ page }) => {
    await page.reload({
      waitUntil: 'domcontentloaded',
    });

    await expect(page).toHaveURL(/admin\/dashboard/i);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('admin can open doctor management', async ({ page }) => {
    const doctorsLink = page
      .getByTestId('admin-doctors-link')
      .or(page.getByRole('link', { name: /Manage Doctors|Doctors/i }))
      .first();

    await expect(doctorsLink).toBeVisible();

    await doctorsLink.click();

    await expect(page).toHaveURL(
      /\/admin\/doctor/i,
      { timeout: 30_000 }
    );
  });

  test('admin can open appointments', async ({ page }) => {
    const appointmentsLink = page
      .getByRole('link', {
        name: /Appointments/i,
      })
      .first();

    await expect(appointmentsLink).toBeVisible();

    await appointmentsLink.click();

    await expect(page).toHaveURL(
      /appointment/i,
      { timeout: 30_000 }
    );
  });

  test('admin cannot access patient dashboard as patient', async ({ page }) => {
    await page.goto('/patient/dashboard');

    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(
      /patient\/dashboard$/i
    );
  });

  test('admin cannot access doctor dashboard as doctor', async ({ page }) => {
    await page.goto('/doctor/dashboard');

    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(
      /doctor\/dashboard$/i
    );
  });

  test('admin can logout', async ({ page }) => {
    await logout(page);
  });
});
