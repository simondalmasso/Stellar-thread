import fs from 'node:fs/promises';
import crypto from 'node:crypto';

const normalizedPath = 'data/catalog/nearby-stars.json';
const appPath = 'src/data/nearby-stars.generated.json';
const reportPath = 'data/catalog/change-report.json';
const nasaRawPath = 'data/catalog/raw/nasa-exoplanet-query.json';
const gaiaRawPath = 'data/catalog/raw/gaia-dr3-astrometry.json';
const verifyOnly = process.argv.includes('--verify');
const refresh = process.argv.includes('--refresh');

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const readJson = async path => JSON.parse(await fs.readFile(path, 'utf8'));

function validate(doc) {
  if (doc.schemaVersion !== 3) throw new Error('catalog schemaVersion must be 3');
  if (!Array.isArray(doc.targets) || doc.targets.length < 6) throw new Error('catalog requires at least six targets');
  const seen = new Set();
  for (const target of doc.targets) {
    for (const key of ['id','displayName','hostStar','planetName','catalogId','raDeg','decDeg','distanceLightYears','astrometryEpochYear','pmRaMasYr','pmDecMasYr']) {
      if (target[key] === null || target[key] === undefined || target[key] === '') throw new Error(`${target.id ?? 'target'} missing ${key}`);
    }
    if (seen.has(target.id)) throw new Error(`duplicate target ${target.id}`);
    seen.add(target.id);
  }
  const core = { schemaVersion:doc.schemaVersion,catalogId:doc.catalogId,retrievedAt:doc.retrievedAt,epoch:doc.epoch,sources:doc.sources,targets:doc.targets };
  const deep = value => Array.isArray(value) ? `[${value.map(deep).join(',')}]` : value && typeof value === 'object' ? `{${Object.keys(value).sort().map(k=>`${JSON.stringify(k)}:${deep(value[k])}`).join(',')}}` : JSON.stringify(value);
  const actual = sha256(deep(core));
  if (actual !== doc.sha256) throw new Error(`catalog SHA mismatch: expected ${doc.sha256}, got ${actual}`);
}

if (refresh) {
  const current = await readJson(normalizedPath);
  const nasa = await readJson(nasaRawPath);
  const gaia = await readJson(gaiaRawPath);
  for (const source of [nasa, gaia]) {
    const url = `${source.endpoint}?query=${encodeURIComponent(source.query)}&format=json`;
    const response = await fetch(url, { headers:{accept:'application/json'} });
    if (!response.ok) throw new Error(`upstream ${response.status} ${source.endpoint}`);
    const rows = await response.json();
    const stamp = new Date().toISOString().replace(/[:.]/g,'-');
    const label = source === nasa ? 'nasa-exoplanet' : 'gaia-dr3';
    await fs.writeFile(`data/catalog/raw/${label}-${stamp}.json`, JSON.stringify({endpoint:source.endpoint,query:source.query,retrievedAt:new Date().toISOString(),rows},null,2)+'\n');
  }
  console.log(JSON.stringify({status:'RAW_REFRESH_CAPTURED',catalog:current.catalogId,message:'Normalization requires reviewed field reconciliation; current application snapshot unchanged.'}));
  process.exit(0);
}

const normalized = await readJson(normalizedPath);
validate(normalized);
const app = await readJson(appPath);
if (JSON.stringify(normalized) !== JSON.stringify(app)) throw new Error('application catalog drift: src/data does not match data/catalog');
const report = await readJson(reportPath);
if (report.catalogSha256 !== normalized.sha256) throw new Error('change report catalog SHA mismatch');
if (verifyOnly) console.log(JSON.stringify({status:'VERIFIED',catalogId:normalized.catalogId,sha256:normalized.sha256,targetCount:normalized.targets.length}));
else console.log(JSON.stringify({status:'CURRENT_VERSIONED_SNAPSHOT_VALID',catalogId:normalized.catalogId,sha256:normalized.sha256,refreshHint:'npm run catalog:refresh -- --refresh'}));
