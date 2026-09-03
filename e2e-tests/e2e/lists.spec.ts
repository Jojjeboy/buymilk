import { test, expect } from '@playwright/test';
import { createNewList, addItemToList } from '../fixtures/utils';

test.describe('Shopping Lists', () => {
  // These tests require authentication to access the lists page
  // They are skipped by default and should be enabled when Firebase Emulator is set up
  test.skip('should display the lists page', async ({ page }) => {
    await page.goto('/buymilk/lists');
    await expect(page).toHaveURL('/buymilk/lists');
  });

  test.skip('should show create list button', async ({ page }) => {
    await page.goto('/buymilk/lists');
    const createButton = page.locator('text=Create List');
    await expect(createButton).toBeVisible();
  });

  // Note: These tests would require authentication and Firebase Emulator
  test.skip('should create a new list', async ({ page }) => {
    await page.goto('/buymilk/lists');
    await createNewList(page, 'Groceries');
  });

  test.skip('should add item to list', async ({ page }) => {
    await page.goto('/buymilk/lists/123'); // Assume 123 is a list ID
    await addItemToList(page, 'Milk');
  });

  test.skip('should delete item from list', async ({ page }) => {
    await page.goto('/buymilk/lists/123');
    await addItemToList(page, 'Milk');
    await page.click('text=Milk >> nth=0'); // Select the item
    await page.click('text=Delete');
    await expect(page.locator('text=Milk')).not.toBeVisible();
  });
});
