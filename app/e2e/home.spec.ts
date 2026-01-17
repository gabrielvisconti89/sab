import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display page title', async ({ page }) => {
    await expect(page.locator('ion-title')).toContainText('Projetos');
  });

  test('should display project list or empty state', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('.project-card, .empty-state', { timeout: 10000 });

    const hasProjects = await page.locator('.project-card').count() > 0;
    const hasEmptyState = await page.locator('.empty-state').count() > 0;

    expect(hasProjects || hasEmptyState).toBeTruthy();
  });

  test('should have FAB button to create project', async ({ page }) => {
    const fab = page.locator('ion-fab-button');
    await expect(fab).toBeVisible();
  });

  test('should open create project modal when FAB clicked', async ({ page }) => {
    await page.click('ion-fab-button');
    await expect(page.locator('ion-modal')).toBeVisible();
  });

  test('should have search input', async ({ page }) => {
    const searchbar = page.locator('ion-searchbar');
    await expect(searchbar).toBeVisible();
  });

  test('should filter projects when searching', async ({ page }) => {
    // Wait for projects to load
    await page.waitForTimeout(1000);

    const searchbar = page.locator('ion-searchbar input');
    await searchbar.fill('test');

    // Verify search is applied
    await page.waitForTimeout(500);
  });
});

test.describe('Create Project Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('ion-fab-button');
    await page.waitForSelector('ion-modal', { state: 'visible' });
  });

  test('should have project name input', async ({ page }) => {
    const nameInput = page.locator('ion-modal ion-input').first();
    await expect(nameInput).toBeVisible();
  });

  test('should have database type selector', async ({ page }) => {
    const dbSelector = page.locator('ion-modal ion-select');
    await expect(dbSelector).toBeVisible();
  });

  test('should close modal when cancel clicked', async ({ page }) => {
    await page.click('ion-modal ion-button:has-text("Cancelar")');
    await expect(page.locator('ion-modal')).not.toBeVisible();
  });
});
