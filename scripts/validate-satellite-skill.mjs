import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillDir = path.join(root, 'skills', 'stellar-satellite-communications');
const skillFile = path.join(skillDir, 'SKILL.md');
const read = async file => readFile(file, 'utf8');
const requiredFiles = [
  'references/safety-gates.md',
  'references/protocols-and-sources.md',
  'references/tool-adapters.md',
  'references/output-contract.md',
];
const requiredPhrases = [
  /No unauthorized uplink/i,
  /physical transmission remains disabled by default/i,
  /fail closed/i,
  /hypothetical.{0,120}extraterrestrial|extraterrestrial.{0,120}hypothetical/i,
  /untrusted data/i,
  /OBSERVE/,
  /ANALYZE/,
  /SIMULATE/,
  /PLAN/,
];

function fail(message) {
  console.error('SATELLITE_SKILL_VALIDATION_FAIL: ' + message);
  process.exitCode = 1;
}

try {
  const text = await read(skillFile);
  const frontmatter = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!frontmatter) throw new Error('SKILL.md must begin with YAML frontmatter');
  const metadata = frontmatter[1];
  const name = metadata.match(/^name:\s*["']?([^\n"']+)["']?\s*$/m)?.[1]?.trim();
  const description = metadata.match(/^description:\s*["']?([\s\S]*?)["']?\s*$/m)?.[1]?.trim();
  if (name !== 'stellar-satellite-communications') throw new Error('name must match the skill directory and Agent Skills naming rules');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64) throw new Error('invalid skill name');
  if (!description || description.length < 40 || description.length > 1024) throw new Error('description must contain 40–1024 characters');
  if (text.split(/\s+/).length > 5000) throw new Error('SKILL.md exceeds the 5000-word portability budget');
  for (const heading of ['## When to use this skill', '## Default operating mode', '## Required output contract']) {
    if (!text.includes(heading)) throw new Error('missing required section: ' + heading);
  }
  for (const phrase of requiredPhrases) if (!phrase.test(text)) throw new Error('missing mandatory safety phrase: ' + phrase);
  if (/TODO|TBD|REPLACE_ME|YOUR_API_KEY/i.test(text)) throw new Error('placeholder text found in SKILL.md');

  const localRefs = [...text.matchAll(/\]\((references\/[^)]+)\)/g)].map(match => match[1].split('#')[0]);
  if (localRefs.length < 3) throw new Error('SKILL.md must link to at least three local reference files');
  for (const ref of localRefs) await access(path.join(skillDir, ref));

  for (const relative of requiredFiles) {
    const file = path.join(skillDir, relative);
    const content = await read(file);
    if (content.trim().length < 300) throw new Error(relative + ' is too short to be useful');
    if (/TODO|TBD|REPLACE_ME|YOUR_API_KEY/i.test(content)) throw new Error('placeholder text found in ' + relative);
    for (const match of content.matchAll(/\]\(([^)]+)\)/g)) {
      const link = match[1].split('#')[0];
      if (!link || /^(https?:|mailto:|#)/i.test(link)) continue;
      await access(path.resolve(path.dirname(file), link));
    }
  }
  await access(path.join(root, 'AGENTS.md'));
  console.log(JSON.stringify({ status: 'PASS', skill: name, references: requiredFiles.length, defaultMode: 'READ_ONLY', physicalTransmission: false }));
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
