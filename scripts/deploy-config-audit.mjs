import fs from 'node:fs';
const base=fs.readFileSync('wrangler.jsonc','utf8');const deploy=fs.readFileSync('.github/workflows/deploy.yml','utf8');
if(/00000000-0000-0000-0000-000000000000/.test(base))throw new Error('production wrangler contains placeholder D1 ID');
if(/"d1_databases"/.test(base))throw new Error('base production config must not embed an unprovisioned D1 binding');
for(const token of ['STELLAR_THREAD_D1_DATABASE_ID','OPERATOR_API_TOKEN','environment: production','wrangler secret put OPERATOR_API_TOKEN','ALLOW_PHYSICAL_TRANSMISSION: \'false\''])if(!deploy.includes(token))throw new Error(`deploy workflow missing ${token}`);
console.log(JSON.stringify({status:'PASS',productionConfig:'NO_D1_PLACEHOLDER',d1Binding:'RENDERED_FROM_PROTECTED_SECRET',operatorToken:'PROVISIONED_AS_WORKER_SECRET',physicalTransmission:'FORCED_FALSE',deploymentExecuted:false}));
