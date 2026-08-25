import { test, expect, Page } from '@playwright/test';

const PATIENT_EMAIL = process.env.TEST_PATIENT_EMAIL;
const PATIENT_PASSWORD = process.env.TEST_PATIENT_PASSWORD;

async function loginAsPatient(page: Page) {
  if (!PATIENT_EMAIL || !PATIENT_PASSWORD) {
    throw new Error(
      'TEST_PATIENT_EMAIL and TEST_PATIENT_PASSWORD are required'
    );
  }

  await page.goto('/login', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });

  await page
    .getByRole('button', { name: 'Patient', exact: true })
    .first()
    .click();

  await page
    .getByRole('textbox', { name: /Email/i })
    .fill(PATIENT_EMAIL);

  await page
    .getByRole('textbox', {
      name: 'Password',
      exact: true,
    })
    .fill(PATIENT_PASSWORD);

  await page
    .getByRole('button', { name: /Sign In/i })
    .click();

  await expect(page).toHaveURL(
    /patient\/dashboard/i,
    { timeout: 60_000 }
  );
}

test.describe('HealthPulse Patient Portal', () => {

  test.skip(
    !PATIENT_EMAIL || !PATIENT_PASSWORD,
    'Patient test credentials are not configured'
  );

  test.beforeEach(async ({ page }) => {
    await loginAsPatient(page);
  });

  test('patient can login and dashboard loads', async ({ page }) => {
    await expect(page).toHaveURL(/patient\/dashboard/i);

    await expect(
      page.getByText(/dashboard|welcome/i).first()
    ).toBeVisible();
  });

  test('patient session survives page refresh', async ({ page }) => {
    await page.reload({
      waitUntil: 'domcontentloaded',
    });

    await expect(page).toHaveURL(/patient\/dashboard/i);

    // Must not be kicked back to login.
    await expect(page).not.toHaveURL(/\/login/i);
  });

  test('patient can open doctor search', async ({ page }) => {
    const findDoctorsLink = page
      .getByRole('link', {
        name: /Find Doctors|Doctors|Search Doctors/i,
      })
      .first();

    await expect(findDoctorsLink).toBeVisible();

    await findDoctorsLink.click();

    await expect(page).toHaveURL(
      /doctor|search/i,
      { timeout: 30_000 }
    );
  });

  test('patient can open appointments page', async ({ page }) => {
    const appointmentsLink = page
      .getByRole('link', {
        name: /My Appointments|Appointments/i,
      })
      .first();

    await expect(appointmentsLink).toBeVisible();

    await appointmentsLink.click();

    await expect(page).toHaveURL(
      /appointment/i,
      { timeout: 30_000 }
    );
  });

  test('patient cannot access admin dashboard', async ({ page }) => {
    await page.goto('/admin/dashboard');

    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(
      /admin\/dashboard$/i
    );
  });

  test('patient cannot access doctor dashboard', async ({ page }) => {
    await page.goto('/doctor/dashboard');

    await page.waitForLoadState('domcontentloaded');

    await expect(page).not.toHaveURL(
      /doctor\/dashboard$/i
    );
  });

  test('patient can logout', async ({ page }) => {
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
