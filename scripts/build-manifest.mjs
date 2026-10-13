import fs from 'node:fs/promises';import crypto from 'node:crypto';import{execFileSync}from'node:child_process';
const sourceSha=process.env.SOURCE_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const treeSha=process.env.TREE_SHA||execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim();
const manifest={schemaVersion:1,sourceSha,treeSha,buildTimeUtc:new Date().toISOString(),workflowRunId:process.env.GITHUB_RUN_ID||null,deploymentId:process.env.DEPLOYMENT_ID||null,environment:process.env.APP_ENV||'ci'};
const canonical=JSON.stringify(manifest);manifest.sha256=crypto.createHash('sha256').update(canonical).digest('hex');await fs.mkdir('artifacts',{recursive:true});await fs.writeFile('artifacts/build-manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify(manifest));
