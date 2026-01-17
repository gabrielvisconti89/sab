import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('home page renders correctly', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Take screenshot for visual comparison
    await expect(page).toHaveScreenshot(`home-${testInfo.project.name}.png`, {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('project page with tabs renders correctly', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click on first project if exists
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');

      await expect(page).toHaveScreenshot(`project-tabs-${testInfo.project.name}.png`, {
        fullPage: true,
        animations: 'disabled',
      });
    }
  });

  test('data architecture page renders correctly', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to project and data architecture
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');

      // Click on data architecture tab
      const dataTab = page.locator('button:has-text("Dados")');
      if (await dataTab.isVisible()) {
        await dataTab.click();
        await page.waitForLoadState('networkidle');

        await expect(page).toHaveScreenshot(`data-architecture-${testInfo.project.name}.png`, {
          fullPage: true,
          animations: 'disabled',
        });
      }
    }
  });

  test('create project modal renders correctly', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.click('ion-fab-button');
    await page.waitForSelector('ion-modal', { state: 'visible' });
    await page.waitForTimeout(300); // Wait for animation

    await expect(page).toHaveScreenshot(`create-modal-${testInfo.project.name}.png`, {
      animations: 'disabled',
    });
  });
});

test.describe('Navigation', () => {
  test('tab navigation works on all viewports', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to first project
    const projectCard = page.locator('.project-card').first();
    if (await projectCard.isVisible()) {
      await projectCard.click();
      await page.waitForLoadState('networkidle');

      // Test each tab
      const tabs = ['UX', 'Requisitos', 'Design', 'Dados', 'Frontend', 'Backend', 'APIs', 'Ambientes', 'Glossario'];

      for (const tab of tabs) {
        const tabButton = page.locator(`button:has-text("${tab}")`);
        if (await tabButton.isVisible()) {
          await tabButton.click();
          await page.waitForTimeout(300);
          await expect(tabButton).toHaveClass(/bg-primary|active/);
        }
      }
    }
  });
});
