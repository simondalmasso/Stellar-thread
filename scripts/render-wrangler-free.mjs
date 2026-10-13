import fs from 'node:fs/promises';

const sourceSha=process.env.BUILD_SOURCE_SHA??'UNAVAILABLE';
const treeSha=process.env.BUILD_TREE_SHA??'UNAVAILABLE';
const buildTimeUtc=process.env.BUILD_TIME_UTC??'UNAVAILABLE';
const workflowRunId=process.env.BUILD_WORKFLOW_RUN_ID??'UNAVAILABLE';
const cfg={
  $schema:'node_modules/wrangler/config-schema.json',
  name:'stellar-thread',
  main:'worker/index.ts',
  compatibility_date:'2026-08-01',
  assets:{directory:'./dist',binding:'ASSETS',not_found_handling:'single-page-application'},
  observability:{enabled:true},
  version_metadata:{binding:'CF_VERSION_METADATA'},
  vars:{
    APP_ENV:'production',
    DEPLOY_MODE:'STATIC_READ_ONLY',
    ALLOW_PHYSICAL_TRANSMISSION:'false',
    BUILD_SOURCE_SHA:sourceSha,
    BUILD_TREE_SHA:treeSha,
    BUILD_TIME_UTC:buildTimeUtc,
    BUILD_WORKFLOW_RUN_ID:workflowRunId
  }
};
if(cfg.vars.ALLOW_PHYSICAL_TRANSMISSION!=='false'||cfg.vars.DEPLOY_MODE!=='STATIC_READ_ONLY'||'d1_databases' in cfg)throw new Error('Free deployment safety invariant failed');
await fs.writeFile('.wrangler.free.json',JSON.stringify(cfg,null,2)+'\n');
console.log(JSON.stringify({status:'PASS',mode:cfg.vars.DEPLOY_MODE,d1Binding:false,operatorSecretRequired:false,physicalTransmission:false,sourceSha,treeSha}));
