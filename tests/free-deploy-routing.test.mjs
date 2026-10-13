import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

test('Wrangler routes API requests through the Worker before SPA asset fallback', async () => {
  const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
  assert.deepEqual(config.assets?.run_worker_first, ['/api/*']);
  const productionRenderer = await readFile('scripts/render-wrangler-production.mjs', 'utf8');
  assert.match(productionRenderer, /run_worker_first\s*:\s*\[['"]\/api\/\*['"]\]/);
  const freeRenderer = await readFile('scripts/render-wrangler-free.mjs', 'utf8');
  assert.match(freeRenderer, /run_worker_first\s*:\s*\[['"]\/api\/\*['"]\]/);
});

test('generated free config keeps API routing and read-only safety invariants', async () => {
  const result = spawnSync(process.execPath, ['scripts/render-wrangler-free.mjs'], {
    encoding: 'utf8',
    env: {
      ...process.env,
      BUILD_SOURCE_SHA: 'test-source-sha',
      BUILD_TREE_SHA: 'test-tree-sha',
      BUILD_TIME_UTC: '2026-10-13T00:00:00Z',
      BUILD_WORKFLOW_RUN_ID: 'test-run',
    },
  });
  assert.equal(result.status, 0, result.stderr);
  const config = JSON.parse(await readFile('.wrangler.free.json', 'utf8'));
  assert.deepEqual(config.assets?.run_worker_first, ['/api/*']);
  assert.equal(config.vars.DEPLOY_MODE, 'STATIC_READ_ONLY');
  assert.equal(config.vars.ALLOW_PHYSICAL_TRANSMISSION, 'false');
  assert.equal('d1_databases' in config, false);
});
