import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Clean up global resources
  console.log('Global teardown: Cleaning up...');
}

export default globalTeardown;
