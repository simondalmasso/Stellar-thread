import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const fail=(message)=>{console.error(`DEPLOY_PREFLIGHT_FAIL: ${message}`);process.exit(1)};
const required=['CLOUDFLARE_API_TOKEN','CLOUDFLARE_ACCOUNT_ID','OPERATOR_API_TOKEN','STELLAR_THREAD_D1_DATABASE_ID'];
for(const name of required) if(!process.env[name]?.trim()) fail(`${name} is required`);
const d1=process.env.STELLAR_THREAD_D1_DATABASE_ID.trim();
if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(d1)) fail('STELLAR_THREAD_D1_DATABASE_ID must be a real UUID');
if(/^0{8}-0{4}-0{4}-0{4}-0{12}$/i.test(d1)) fail('D1 database ID placeholder is forbidden');
if(process.env.ALLOW_PHYSICAL_TRANSMISSION && process.env.ALLOW_PHYSICAL_TRANSMISSION!=='false') fail('ALLOW_PHYSICAL_TRANSMISSION must remain false');
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const tree=execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim();
if(process.env.EXPECTED_SOURCE_SHA && process.env.EXPECTED_SOURCE_SHA!==head) fail(`HEAD mismatch: expected ${process.env.EXPECTED_SOURCE_SHA}, got ${head}`);
if(!fs.existsSync('migrations/0002_message_relationships_and_guards.sql')) fail('0002 migration missing');
console.log(JSON.stringify({status:'PASS',sourceSha:head,treeSha:tree,d1DatabaseIdStatus:'CONFIGURED_NON_PLACEHOLDER',operatorSecretStatus:'PRESENT_NOT_PRINTED',physicalTransmission:false,migrations:['0001_reality_v2.sql','0002_message_relationships_and_guards.sql']}));
