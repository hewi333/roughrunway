// Test file for dark mode implementation
import { test, expect } from '@playwright/test';

test('dark mode toggle works correctly', async ({ page }) => {
  // Navigate to the dashboard page where the header with dark mode toggle is located
  await page.goto('/dashboard');
  
  // Wait for the page to load and check what content is visible
  await page.waitForTimeout(2000);
  
  // Check if we're on the setup wizard or the main app
  const setupWizard = page.locator('text=Welcome to Rough Runway');
  const appShell = page.locator('text=Nexus Labs Demo');
  
  if (await setupWizard.isVisible()) {
    console.log('Setup wizard is visible');
    // If setup wizard is visible, we need to complete setup first
    // But for this test, let's just check that we can find the dark mode toggle
    // The setup wizard might not have the dark mode toggle
    throw new Error('Setup wizard is visible, expected to see the main app');
  }
  
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