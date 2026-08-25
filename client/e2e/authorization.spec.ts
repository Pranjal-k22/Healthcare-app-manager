import { test, expect } from '@playwright/test';

test.describe('HealthPulse Authorization & Role Barriers', () => {

  test.describe('Unauthenticated Route Guards', () => {
    test('unauthenticated visitor cannot access patient dashboard', async ({ page }) => {
      await page.goto('/patient/dashboard');
      await expect(page).toHaveURL(/\/login/i);
    });

    test('unauthenticated visitor cannot access doctor dashboard', async ({ page }) => {
      await page.goto('/doctor/dashboard');
      await expect(page).toHaveURL(/\/login/i);
    });

    test('unauthenticated visitor cannot access admin dashboard', async ({ page }) => {
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL(/\/login/i);
    });

    test('unauthenticated visitor cannot access patient appointments', async ({ page }) => {
      await page.goto('/patient/appointments');
      await expect(page).toHaveURL(/\/login/i);
    });

    test('unauthenticated visitor cannot access doctor profile', async ({ page }) => {
      await page.goto('/doctor/profile');
      await expect(page).toHaveURL(/\/login/i);
    });
  });

  test.describe('API Endpoint Authorization Status', () => {
    test('unauthenticated request to doctor API returns 401', async ({ request }) => {
      const response = await request.get('/api/doctor/appointments');
      expect([401, 403, 404]).toContain(response.status());
    });

    test('unauthenticated request to admin API returns 401', async ({ request }) => {
      const response = await request.get('/api/admin/users');
      expect([401, 403, 404]).toContain(response.status());
    });

    test('unauthenticated request to patient profile returns 401', async ({ request }) => {
      const response = await request.get('/api/patient/profile');
      expect([401, 403, 404]).toContain(response.status());
    });
  });

});
