// Test file for dark mode implementation
import { test, expect } from '@playwright/test';

test('dark mode toggle works correctly', async ({ page }) => {
  // Navigate to the dashboard page where the header with dark mode toggle is located
  await page.goto('/dashboard');
  
  // Wait for the page to load
  await page.waitForTimeout(2000);
  
  // Try to find the dark mode toggle with either aria-label
  const darkModeToggle = page.locator('button[aria-label*="Switch to"]');
  await expect(darkModeToggle).toBeVisible();
  
  // Get the initial aria-label
  const initialLabel = await darkModeToggle.getAttribute('aria-label');
  console.log('Initial aria-label:', initialLabel);
  
  // Click the dark mode toggle
  await darkModeToggle.click();
  
  // Wait a bit for the change to take effect
  await page.waitForTimeout(500);
  
  // Check if the aria-label changed
  const newLabel = await darkModeToggle.getAttribute('aria-label');
  console.log('New aria-label:', newLabel);
  
  // The labels should be different
  expect(initialLabel).not.toBe(newLabel);
});