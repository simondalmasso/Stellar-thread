import fs from 'node:fs';
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const inventory = Object.entries({ ...pkg.dependencies, ...pkg.devDependencies }).map(([name, requested]) => ({ name, requested, installedLicense: 'VERIFY_FROM_LOCKFILE_AFTER_INSTALL' }));
fs.mkdirSync('artifacts', { recursive: true });
fs.writeFileSync('artifacts/license-inventory.json', JSON.stringify({ generatedAt: new Date().toISOString(), packages: inventory }, null, 2));
console.log(`license inventory: ${inventory.length} packages`);
