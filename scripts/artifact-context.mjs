import fs from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
const [dir,label]=process.argv.slice(2);if(!dir||!label)throw new Error('usage: artifact-context <dir> <label>');
const sourceSha=process.env.SOURCE_SHA||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const treeSha=process.env.TREE_SHA||execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim();
await fs.mkdir(dir,{recursive:true});
const context={schemaVersion:1,artifact:label,sourceSha,treeSha,runId:process.env.GITHUB_RUN_ID??null,createdAtUtc:new Date().toISOString()};
await fs.writeFile(`${dir}/artifact-context.json`,JSON.stringify(context,null,2)+'\n');console.log(JSON.stringify(context));
