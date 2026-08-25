import { test, expect, Page } from '@playwright/test';

const DOCTOR_EMAIL = process.env.TEST_DOCTOR_EMAIL;
const DOCTOR_PASSWORD = process.env.TEST_DOCTOR_PASSWORD;

async function loginAsDoctor(page: Page) {
  if (!DOCTOR_EMAIL || !DOCTOR_PASSWORD) {
    throw new Error(
      'TEST_DOCTOR_EMAIL and TEST_DOCTOR_PASSWORD are required'
    );
  }

  await page.goto('/login', {
    waitUntil: 'domcontentloaded',
  });

  await page
    .getByRole('button', { name: 'Doctor', exact: true })
    .first()
    .click();

  await page
    .getByRole('textbox', { name: /Email/i })
    .fill(DOCTOR_EMAIL);

  await page
    .getByRole('textbox', {
      name: 'Password',
      exact: true,
    })
    .fill(DOCTOR_PASSWORD);

  await page
    .getByRole('button', { name: /Sign In/i })
    .click();

  await expect(page).toHaveURL(
    /doctor\/dashboard/i,
    { timeout: 60_000 }
  );
}

test.describe('HealthPulse Doctor Portal', () => {
  test.skip(
    !DOCTOR_EMAIL || !DOCTOR_PASSWORD,
    'Doctor test credentials are not configured'
  );

  test.beforeEach(async ({ page }) => {
    await loginAsDoctor(page);
  });

  test('doctor dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/doctor\/dashboard/i);

    await expect(
      page.getByText(/dashboard|welcome/i).first()
    ).toBeVisible();
  });

  test('doctor session survives refresh', async ({ page }) => {
    await page.reload({
      waitUntil: 'domcontentloaded',
    });

    await expect(page).toHaveURL(/doctor\/dashboard/i);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('doctor can open appointments', async ({ page }) => {
    const appointmentLink = page
      .getByRole('link', {
        name: /Appointments|Consultations/i,
      })
      .first();

    await expect(appointmentLink).toBeVisible();

    await appointmentLink.click();

    await expect(page).toHaveURL(
      /appointment|consultation/i,
      { timeout: 30_000 }
    );
  });

  test('doctor can open profile', async ({ page }) => {
    const profileLink = page
      .getByRole('link', {
        name: /Profile|My Profile/i,
      })
      .first();

    await expect(profileLink).toBeVisible();

    await profileLink.click();

    await expect(page).toHaveURL(
      /doctor\/profile/i,
      { timeout: 30_000 }
    );
  });

  test('doctor cannot access admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(
      /admin\/dashboard$/i
    );
  });

  test('doctor cannot access patient dashboard', async ({ page }) => {
    await page.goto('/patient/dashboard');

    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(
      /patient\/dashboard$/i
    );
  });

  test('doctor can logout', async ({ page }) => {
    const logoutButton = page
      .getByRole('button', {
        name: /Logout|Log out|Sign out/i,
      })
      .first();

    const logoutLink = page
      .getByRole('link', {
        name: /Logout|Log out|Sign out/i,
      })
      .first();

    if (await logoutButton.count()) {
      await logoutButton.click();
    } else {
      await logoutLink.click();
    }

    await expect(page).toHaveURL(
      /login/i,
      { timeout: 30_000 }
    );
  });
});
