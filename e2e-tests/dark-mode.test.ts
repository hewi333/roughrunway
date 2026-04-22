// Test file for dark mode implementation
import { test, expect } from '@playwright/test';

test('dark mode toggle works correctly', async ({ page }) => {
  // Navigate to the dashboard page where the header with dark mode toggle is located
  await page.goto('/dashboard');
  
  // Wait for the dark mode toggle to be visible with a more specific selector
  const darkModeToggle = page.locator('button[aria-label*="Switch to"]');
  await expect(darkModeToggle).toBeVisible({ timeout: 10000 });
  
  // Get the initial aria-label
  const initialLabel = await darkModeToggle.getAttribute('aria-label');
  console.log('Initial aria-label:', initialLabel);
  
  // Click the dark mode toggle
  await darkModeToggle.click();
  
  // Wait for the aria-label to change
  await expect(darkModeToggle).not.toHaveAttribute('aria-label', initialLabel, { timeout: 5000 });
  
  // Check if the aria-label changed
  const newLabel = await darkModeToggle.getAttribute('aria-label');
  console.log('New aria-label:', newLabel);
  
  // The labels should be different
  expect(initialLabel).not.toBe(newLabel);
});