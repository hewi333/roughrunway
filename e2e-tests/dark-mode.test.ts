// Test file for dark mode implementation
import { test, expect } from '@playwright/test';

test('dark mode toggle works correctly', async ({ page }) => {
  // Navigate to the dashboard page where the header with dark mode toggle is located
  await page.goto('/dashboard');
  
  // Check that the dark mode toggle is visible (initially in light mode)
  const darkModeToggle = page.locator('button[aria-label="Switch to dark mode"]');
  await expect(darkModeToggle).toBeVisible();
  
  // Click the dark mode toggle to switch to dark mode
  await darkModeToggle.click();
  
  // Check that the page has the dark class
  await expect(page.locator('html')).toHaveClass(/dark/);
  
  // Click the dark mode toggle again to switch back to light mode
  await darkModeToggle.click();
  
  // Check that the page no longer has the dark class
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});