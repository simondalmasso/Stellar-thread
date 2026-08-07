import { spawnSync } from 'node:child_process';
import { delimiter } from 'node:path';
const env={...process.env,PYTHONPATH:['listener',process.env.PYTHONPATH].filter(Boolean).join(delimiter)};
const result=spawnSync('python',['-m','unittest','discover','-s','listener/tests','-p','test_*.py','-v'],{encoding:'utf8',env});
process.stdout.write(result.stdout??'');process.stderr.write(result.stderr??'');
const combined=`${result.stdout??''}\n${result.stderr??''}`;const match=combined.match(/Ran\s+(\d+)\s+tests?/i);
if(result.status!==0)process.exit(result.status??1);
if(!match||Number(match[1])<=0){console.error('Python test guard: zero tests executed');process.exit(2)}
console.log(`Python test guard: ${match[1]} tests executed`);
