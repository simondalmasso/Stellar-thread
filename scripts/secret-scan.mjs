import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
const rules = [
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ['github-token', /gh[pousr]_[A-Za-z0-9_]{30,}/],
  ['cloudflare-token', /(?:CLOUDFLARE_API_TOKEN\s*=\s*)(?!false|example|<)[^\s]+/i],
  ['generic-secret', /(?:password|secret|api[_-]?key)\s*[:=]\s*['"][^'"\n]{12,}['"]/i]
];
const findings = [];
for (const file of files) {
  if (!fs.statSync(file).isFile() || fs.statSync(file).size > 2_000_000) continue;
  const text = fs.readFileSync(file, 'utf8');
  for (const [name, regex] of rules) if (regex.test(text)) findings.push({ file, rule: name });
}
if (findings.length) { console.error(JSON.stringify(findings, null, 2)); process.exit(1); }
console.log(`secret scan: ${files.length} tracked files checked, 0 findings`);
