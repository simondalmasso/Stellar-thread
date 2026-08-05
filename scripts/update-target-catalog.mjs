import fs from 'node:fs/promises'; import crypto from 'node:crypto';
const endpoint='https://exoplanetarchive.ipac.caltech.edu/TAP/sync';
const query="SELECT hostname,pl_name,ra,dec,sy_dist FROM pscomppars WHERE pl_name IN ('Proxima Cen b','GJ 273 b','Ross 128 b','Teegarden b','TRAPPIST-1 e','LHS 1140 b')";
const out='data/catalog/nasa-targets-latest.json', fallback='data/catalog/nearby-stars.json';
try { const url=`${endpoint}?query=${encodeURIComponent(query)}&format=json`; const r=await fetch(url); if(!r.ok)throw new Error(`TAP ${r.status}`); const rows=await r.json(); const normalized={schemaVersion:1,query,retrievedAt:new Date().toISOString(),sourceUrl:url,rows}; const body=JSON.stringify(normalized,null,2)+'\n'; normalized.sha256=crypto.createHash('sha256').update(body).digest('hex'); await fs.writeFile(out,JSON.stringify(normalized,null,2)+'\n'); console.log(JSON.stringify({status:'updated',out,sha256:normalized.sha256,rows:rows.length})); }
catch(error){await fs.access(fallback);console.error(JSON.stringify({status:'fallback',fallback,error:error instanceof Error?error.message:String(error)}));}
