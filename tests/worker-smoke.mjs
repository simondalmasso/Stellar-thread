import assert from 'node:assert/strict';
const base=process.env.BASE_URL||'http://127.0.0.1:8787';
const get=async path=>{
  const response=await fetch(base+path);
  if(!response.ok){const body=await response.text();assert.fail(`${path}: ${response.status} ${body}`)}
  return response.json();
};
const health=await get('/api/v1/health');
assert.equal(health.physicalTransmissionEnabled,false);
const build=await get('/api/v1/build');
assert.ok(build.data.sourceSha);
const targets=await get('/api/v1/targets');
assert.ok(targets.data.length>=6);
const dataset=await get('/api/v1/datasets/voyager1-gbt-2016-control/manifest');
assert.equal(dataset.data.extraterrestrial,false);
let response=await fetch(base+'/api/v1/messages/encode',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message:'contract test',targetId:'proxima-b',profile:'CMP_TEXT',repetition:1})});
assert.equal(response.status,422);
response=await fetch(base+'/api/v1/observations/import',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
assert.equal(response.status,401);
response=await fetch(base+'/api/v1/candidates/x/review',{method:'POST',headers:{'content-type':'application/json'},body:'{}'});
assert.equal(response.status,401);
response=await fetch(base+'/api/v1/operator/transmissions/tx-1/proof',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer wrong'},body:'{}'});
assert.equal(response.status,401);
console.log('worker smoke: ok');
