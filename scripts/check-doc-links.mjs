import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = ['README.md', 'docs/INDEX.md'];
const errors = [];

for (const relativeFile of files) {
  const absoluteFile = path.join(root, relativeFile);
  const content = fs.readFileSync(absoluteFile, 'utf8');
  if (/github\\.com\\/simonkey888\\/Stellar-thread/i.test(content)) {
    errors.push(relativeFile + ': legacy repository owner must not be used in new links');
  }
  for (const match of content.matchAll(/!?\\[[^\\]]*\\]\\(([^)]+)\\)/g)) {
    const raw = match[1].trim().split(/\\s+/)[0];
    if (!raw || /^(https?:|mailto:|#)/i.test(raw)) continue;
    const local = raw.split(/[?#]/, 1)[0];
    if (!local) continue;
    const resolved = path.resolve(path.dirname(absoluteFile), local);
    const rel = path.relative(root, resolved);
    if (rel.startsWith('..') || path.isAbsolute(rel)) {
      errors.push(relativeFile + ': link escapes repository root: ' + raw);
      continue;
    }
    if (!fs.existsSync(resolved)) errors.push(relativeFile + ': broken relative link: ' + raw);
  }
}

if (errors.length) {
  console.error(errors.join('\\n'));
  process.exitCode = 1;
} else {
  console.log('documentation links: PASS (' + files.join(', ') + ')');
}
