import fs from 'node:fs/promises';
const d1=process.env.STELLAR_THREAD_D1_DATABASE_ID;
if(!d1) throw new Error('STELLAR_THREAD_D1_DATABASE_ID is required');
const cfg={
  $schema:'node_modules/wrangler/config-schema.json',name:'stellar-thread',main:'worker/index.ts',compatibility_date:'2026-08-01',
  assets:{directory:'./dist',binding:'ASSETS',not_found_handling:'single-page-application'},observability:{enabled:true},version_metadata:{binding:'CF_VERSION_METADATA'},
  vars:{APP_ENV:'production',ALLOW_PHYSICAL_TRANSMISSION:'false',BUILD_SOURCE_SHA:process.env.BUILD_SOURCE_SHA??'UNAVAILABLE',BUILD_TREE_SHA:process.env.BUILD_TREE_SHA??'UNAVAILABLE',BUILD_TIME_UTC:process.env.BUILD_TIME_UTC??'UNAVAILABLE',BUILD_WORKFLOW_RUN_ID:process.env.BUILD_WORKFLOW_RUN_ID??'UNAVAILABLE'},
  d1_databases:[{binding:'DB',database_name:'stellar-thread-reality-v2',database_id:d1,migrations_dir:'migrations'}]
};
await fs.writeFile('.wrangler.production.json',JSON.stringify(cfg,null,2)+'\n');
console.log('Rendered .wrangler.production.json with D1 id redacted from logs');
