import { expect, Page } from '@playwright/test';

/**
 * Standard robust logout helper for HealthPulse E2E tests.
 * Handles desktop/sidebar/navbar logout triggers and confirmation dialogs.
 */
export async function logout(page: Page) {
  const menuToggle = page.getByTestId('user-menu-toggle');

  if (await menuToggle.isVisible().catch(() => false)) {
    await menuToggle.click();
  }

  const logoutButton = page
    .getByTestId('logout-button')
    .or(page.getByRole('button', { name: /Logout|Log out|Sign out/i }))
    .or(page.locator('.sidebar-logout-btn, .nav-logout-btn button'))
    .first();

  await expect(logoutButton).toBeVisible({ timeout: 10_000 });
  await expect(logoutButton).toBeEnabled();

  await logoutButton.click();

  // If a confirmation modal appears, confirm sign out
  const confirmBtn = page
    .getByTestId('confirm-dialog-btn')
    .or(page.getByRole('button', { name: /Yes, Sign Out|Confirm/i }))
    .first();

  if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await confirmBtn.click();
  }

  await expect(page).toHaveURL(
    /\/login(?:[/?#]|$)/i,
    { timeout: 20_000 }
  );

  await expect(page).not.toHaveURL(/dashboard/i);
}
