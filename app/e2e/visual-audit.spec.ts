import { test, expect } from '@playwright/test';

test.describe('Visual Audit - All Screens', () => {
  test('Home Page - lista de projetos', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    await page.screenshot({
      path: `screenshots/${testInfo.project.name}/01-home.png`,
      fullPage: true,
    });
  });

  test('Home Page - modal criar projeto', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
    await page.click('ion-fab-button');
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `screenshots/${testInfo.project.name}/02-home-create-modal.png`,
      fullPage: true,
    });
  });

  test('Project - All tabs', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForTimeout(1500);

    // Click first project card
    await page.locator('ion-card').first().click();
    await page.waitForTimeout(2000);

    // Screenshot UX tab (default)
    await page.screenshot({
      path: `screenshots/${testInfo.project.name}/03-ux-research.png`,
      fullPage: true,
    });

    // Navigate using .tab-button with .tab-label text
    const tabs = [
      { label: 'REQUISITOS', file: '04-requirements.png' },
      { label: 'DESIGN', file: '05-design-system.png' },
      { label: 'DADOS', file: '06-data-architecture.png' },
      { label: 'FRONTEND', file: '07-frontend-stack.png' },
      { label: 'BACKEND', file: '08-backend-stack.png' },
      { label: 'INTEGRAÇÕES', file: '09-integrations.png' },
      { label: 'AMBIENTES', file: '10-environments.png' },
      { label: 'GLOSSÁRIO', file: '11-glossary.png' },
    ];

    for (const tab of tabs) {
      await page.locator(`.tab-button:has-text("${tab.label}")`).click();
      await page.waitForTimeout(1500);
      await page.screenshot({
        path: `screenshots/${testInfo.project.name}/${tab.file}`,
        fullPage: true,
      });
    }
  });

  test('Export Modal', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.locator('ion-card').first().click();
    await page.waitForTimeout(1500);

    // Click menu button and then export option
    await page.locator('ion-button[aria-label="Menu do projeto"]').click();
    await page.waitForTimeout(500);
    await page.locator('ion-item:has-text("Exportar")').click();
    await page.waitForTimeout(500);

    await page.screenshot({
      path: `screenshots/${testInfo.project.name}/12-export-modal.png`,
      fullPage: true,
    });
  });
});
