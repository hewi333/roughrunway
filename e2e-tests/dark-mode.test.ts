// Test file for dark mode implementation
import { test, expect } from '@playwright/test';

test('dark mode toggle works correctly', async ({ page }) => {
  // Navigate to the dashboard page
  await page.goto('/dashboard');
  
  // Check if we're on the setup wizard page
  const setupWizardTitle = page.locator('text=Welcome to Rough Runway');
  if (await setupWizardTitle.isVisible()) {
    console.log('Setup wizard detected, completing setup...');
    // Complete the setup wizard
    // Step 1: Project Information
    await page.fill('#project-name', 'Test Project');
    await page.click('button:has-text("Next")');
    
    // Step 2: Treasury Setup
    await page.fill('#stablecoin-amount', '1000000');
    await page.fill('#fiat-amount', '500000');
    await page.click('button:has-text("Next")');
    
    // Step 3: Burn Rate
    await page.fill('#monthly-burn', '100000');
    await page.click('button:has-text("Complete Setup")');
    
    // Wait for navigation to complete
    await page.waitForTimeout(2000);
    console.log('Setup wizard completed');
  } else {
    console.log('Setup wizard not detected, already on dashboard');
  }
  
  // Wait for the dark mode toggle to be visible with a more specific selector
  const darkModeToggle = page.locator('button[aria-label*="Switch to"]');
  console.log('Waiting for dark mode toggle to be visible...');
  await expect(darkModeToggle).toBeVisible({ timeout: 10000 });
  console.log('Dark mode toggle is visible');
  
  // Get the initial aria-label
  const initialLabel = (await darkModeToggle.getAttribute('aria-label')) || '';
  console.log('Initial aria-label:', initialLabel);
  
  // Click the dark mode toggle
  await darkModeToggle.click();
  
  // Wait for the aria-label to change
  await expect(darkModeToggle).not.toHaveAttribute('aria-label', initialLabel, { timeout: 5000 });
  
  // Check if the aria-label changed
  const newLabel = (await darkModeToggle.getAttribute('aria-label')) || '';
  console.log('New aria-label:', newLabel);
  
  // The labels should be different
  expect(initialLabel).not.toBe(newLabel);
});