// Test file for dark mode implementation
import { test, expect } from '@playwright/test';

test('dark mode toggle works correctly', async ({ page }) => {
  // Navigate to the dashboard page
  await page.goto('/dashboard');

  // The dashboard shows one of three views on first load: a setup wizard
  // (legacy /setup), a DemoQuickstart card (fresh visitor — current default),
  // or AppShell directly (returning visitor with persisted state).
  // Wait for one of them to render so we don't race the first useEffect.
  await page.waitForLoadState('networkidle');

  const setupWizardTitle = page.locator('text=Welcome to Rough Runway');
  const demoQuickstart = page.locator('[data-action="load-demo-model"]');

  if (await setupWizardTitle.isVisible()) {
    console.log('Setup wizard detected, completing setup...');
    await page.fill('#project-name', 'Test Project');
    await page.click('button:has-text("Next")');
    await page.fill('#stablecoin-amount', '1000000');
    await page.fill('#fiat-amount', '500000');
    await page.click('button:has-text("Next")');
    await page.fill('#monthly-burn', '100000');
    await page.click('button:has-text("Complete Setup")');
    await page.waitForTimeout(2000);
    console.log('Setup wizard completed');
  } else if (await demoQuickstart.isVisible()) {
    console.log('Demo Quickstart detected, loading sample model...');
    await demoQuickstart.click();
    // Wait for AppShell to mount
    await page.waitForLoadState('networkidle');
  } else {
    console.log('No onboarding view detected, already on dashboard');
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