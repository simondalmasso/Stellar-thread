import { expect, test } from '@playwright/test';

test('dashboard is explicit about physical and scientific state', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('stellar thread')).toBeVisible();
  await expect(page.getByText('NO FAKE LIVE · NO FAKE ET REPLY · PHYSICAL RF GATED')).toBeVisible();
  await expect(page.getByText('AWAITING AUTHORIZED FACILITY').first()).toBeVisible();
  await expect(page.getByText('0 AUTHENTIC / 1 SYNTHETIC')).toBeVisible();
  await expect(page.getByText('ALIEN REPLIED')).toHaveCount(0);
});

test('message encodes locally when API is absent', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'ENCODE MESSAGE' }).click();
  await expect(page.getByText('ENCODED')).toBeVisible();
  await expect(page.getByText('REPETITION_3', { exact: false })).toBeVisible();
});

test('mobile exposes sky, targets and composer', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'), 'mobile-only assertion');
  await page.goto('/');
  await expect(page.getByLabel(/Mapa estelar/)).toBeVisible();
  await expect(page.getByRole('button', { name: /PROXIMA B/ })).toBeVisible();
  await expect(page.getByLabel('Mensaje humano')).toBeVisible();
});
