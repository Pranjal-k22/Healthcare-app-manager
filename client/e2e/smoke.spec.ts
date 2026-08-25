import { test, expect } from '@playwright/test';

test.describe('HealthPulse Smoke Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://www.health-pulse.app/login', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
  });

  test('production website loads', async ({ page }) => {
    await page.goto('https://www.health-pulse.app/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    await expect(page).toHaveTitle(/HealthPulse/i);
  });

  test('login page loads', async ({ page }) => {
    await expect(
      page.getByText(/Welcome back/i)
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /Sign In/i })
    ).toBeVisible();
  });

  test('patient portal is visible', async ({ page }) => {
    const patientTab = page.getByRole('button', {
      name: 'Patient',
      exact: true,
    }).first();

    await expect(patientTab).toBeVisible();

    await expect(
      page.getByRole('textbox', {
        name: /Email address/i,
      })
    ).toBeVisible();

    // Exact locator prevents matching "Show password"
    await expect(
      page.getByRole('textbox', {
        name: 'Password',
        exact: true,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: /Show password|Hide password/i,
      })
    ).toBeVisible();
  });

  test('doctor portal can be selected', async ({ page }) => {
    const doctorTab = page.getByRole('button', {
      name: 'Doctor',
      exact: true,
    }).first();

    await expect(doctorTab).toBeVisible();

    await doctorTab.click();

    // Confirms interaction happened
    await expect(doctorTab).toBeFocused();

    await expect(
      page.getByRole('textbox', {
        name: /Email address/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: /Sign In/i,
      })
    ).toBeVisible();
  });

  test('admin portal can be selected', async ({ page }) => {
    const adminTab = page.getByRole('button', {
      name: 'Admin',
      exact: true,
    }).first();

    await expect(adminTab).toBeVisible();

    await adminTab.click();

    await expect(adminTab).toBeFocused();

    await expect(
      page.getByRole('textbox', {
        name: /Email|Username/i,
      })
    ).toBeVisible();

    await expect(
      page.getByRole('button', {
        name: /Sign In/i,
      })
    ).toBeVisible();
  });

});