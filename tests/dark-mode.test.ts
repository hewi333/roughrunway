// Test file for dark mode implementation
import { test, expect } from '@playwright/test';

test('dark mode toggle works correctly', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/');
  
  // Check that the dark mode toggle is visible
  const darkModeToggle = page.locator('button[aria-label="Switch to light mode"]');
  await expect(darkModeToggle).toBeVisible();
  
  // Click the dark mode toggle
  await darkModeToggle.click();
  
  // Check that the page has the dark class
  await expect(page.locator('html')).toHaveClass(/dark/);
  
  // Click the dark mode toggle again
  await darkModeToggle.click();
  
  // Check that the page no longer has the dark class
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});