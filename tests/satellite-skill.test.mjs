import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillDir = path.join(root, 'skills', 'stellar-satellite-communications');
const skillPath = path.join(skillDir, 'SKILL.md');

test('portable Agent Skill metadata is valid and discoverable', async () => {
  const text = await readFile(skillPath, 'utf8');
  assert.match(text, /^---\nname: stellar-satellite-communications\n/m);
  assert.match(text, /^description: .{40,}/m);
  assert.match(text, /## When to use this skill/);
  assert.match(text, /## Default operating mode/);
  assert.match(text, /## Required output contract/);
});

test('skill states the non-negotiable communication safety boundary', async () => {
  const text = await readFile(skillPath, 'utf8');
  assert.match(text, /No unauthorized uplink/i);
  assert.match(text, /physical transmission remains disabled by default/i);
  assert.match(text, /fail closed/i);
  assert.match(text, /hypothetical.*extraterrestrial|extraterrestrial.*hypothetical/i);
  assert.match(text, /untrusted data/i);
});

test('all local skill references exist', async () => {
  const text = await readFile(skillPath, 'utf8');
  const refs = [...text.matchAll(/\]\((references\/[^)]+)\)/g)].map(match => match[1]);
  assert.ok(refs.length >= 3, 'SKILL.md must link to the reference documents');
  for (const ref of refs) await access(path.join(skillDir, ref));
  await access(path.join(root, 'scripts', 'validate-satellite-skill.mjs'));
});

test('reference docs cover protocol provenance, safety gates, adapters and output format', async () => {
  const files = ['safety-gates.md', 'protocols-and-sources.md', 'tool-adapters.md', 'output-contract.md'];
  for (const name of files) {
    const text = await readFile(path.join(skillDir, 'references', name), 'utf8');
    assert.ok(text.trim().length > 300, name + ' must contain usable guidance');
  }
});
