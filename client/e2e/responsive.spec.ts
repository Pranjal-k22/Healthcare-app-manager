import { test, expect } from '@playwright/test';

const VIEWPORTS = [
  { name: 'Desktop Large', width: 1366, height: 768 },
  { name: 'Laptop', width: 1024, height: 768 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Mobile Standard', width: 390, height: 844 },
  { name: 'Mobile Small', width: 360, height: 800 },
];

test.describe('HealthPulse Responsive & Layout Tests', () => {

  for (const viewport of VIEWPORTS) {
    test(`login page has no horizontal overflow on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/login', { waitUntil: 'domcontentloaded' });

      // Ensure form content is rendered
      await expect(page.getByRole('button', { name: /Sign In/i })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalOverflow).toBe(false);
    });

    test(`forgot password page has no horizontal overflow on ${viewport.name} (${viewport.width}x${viewport.height})`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/forgot-password', { waitUntil: 'domcontentloaded' });

      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizontalOverflow).toBe(false);
    });
  }

});
