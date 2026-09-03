import { Page, expect } from '@playwright/test';

// Helper function to sign in with Google (mocked)
export async function signInWithGoogle(page: Page) {
  await page.click('text=Sign in with Google');
  // In a real test, you would mock the Google OAuth flow
  // For now, assume the user is redirected to the lists page
  await expect(page).toHaveURL('/lists');
}

// Helper function to create a new list
export async function createNewList(page: Page, listName: string) {
  await page.click('text=Create List');
  await page.fill('input[name="listName"]', listName);
  await page.click('text=Save');
  await expect(page.locator(`text=${listName}`)).toBeVisible();
}

// Helper function to add an item to a list
export async function addItemToList(page: Page, itemName: string) {
  await page.fill('input[name="itemName"]', itemName);
  await page.click('text=Add');
  await expect(page.locator(`text=${itemName}`)).toBeVisible();
}

// Helper function to navigate to a list
export async function navigateToList(page: Page, listId: string) {
  await page.goto(`/lists/${listId}`);
}
