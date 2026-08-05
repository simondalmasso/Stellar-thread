import { mkdir } from 'node:fs/promises';
import { test, expect } from '@playwright/test';

async function capture(page: import('@playwright/test').Page, name: string) {
  await mkdir('artifacts/ux-evidence', { recursive: true });
  await page.screenshot({ path: `artifacts/ux-evidence/${name}.png`, fullPage: true });
}

test('desktop Reality V2 hierarchy and truth', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.includes('mobile'));
  await page.goto('/');
  await expect(page.getByText('Stellar Thread')).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary areas' }).getByRole('button')).toHaveCount(5);
  await expect(page.getByText('Tu mensaje todavía está en la Tierra.')).toBeVisible();
  await expect(page.getByText('RF GATE CLOSED', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'UNIVERSE' }).click();
  await expect(page.getByText('Packet glyph: VISUAL METAPHOR — NOT A PHYSICAL PACKET')).toBeVisible();
  await capture(page, 'desktop-universe-physical-truth');
  await page.getByRole('button', { name: 'LISTEN' }).click();
  await expect(page.getByText('NOT EXTRATERRESTRIAL', { exact: true })).toBeVisible();
  await capture(page, 'desktop-listen-authentic-control');
});

test('encode stays on Earth and scientific layer exposes SHA-256', async ({ page }) => {
  await page.goto('/');
  const box = page.getByRole('textbox', { name: 'Mensaje humano' });
  await box.fill('Mensaje de prueba');
  await page.getByRole('button', { name: 'Codificar mensaje' }).click();
  await expect(page.getByText('Tu mensaje todavía está en la Tierra.')).toBeVisible();
  await page.getByText('Ver capa científica').click();
  await expect(page.getByText('NO TRANSMISSION PROOF')).toBeVisible();
  await expect(page.locator('code').filter({ hasText: /^[a-f0-9]{64}$/ })).toBeVisible();
});

test('mobile uses bottom tabs and keeps 44px controls', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes('mobile'));
  await page.goto('/');
  const tabs = page.getByRole('navigation', { name: 'Mobile primary areas' });
  await expect(tabs).toBeVisible();
  await expect(tabs.getByRole('button')).toHaveCount(5);
  const box = await tabs.getByRole('button').first().boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await capture(page, 'mobile-thread-primary-flow');
});

test('build API exposes exact provenance contract', async ({ request }) => {
  const response = await request.get('/api/v1/build');
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.data).toHaveProperty('sourceSha');
  expect(body.data).toHaveProperty('treeSha');
});
