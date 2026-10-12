import {spawnSync} from 'node:child_process';
const commands=[["node", "--experimental-strip-types", "--test", "tests/quality-monitor.test.ts"], ["node", "tests/run.mjs"], ["node", "tests/scientific-review.mjs"], ["node", "tests/branches.mjs"], ["node", "tests/collaboration.mjs"], ["node", "--experimental-strip-types", "tests/quality-hosted-runtime.mjs"]];
for(const [cmd,...args] of commands){const r=spawnSync(cmd,args,{stdio:'inherit'});if(r.status!==0)process.exit(r.status||1);}
console.log('Bounded quality checks complete. Professional qualification remains separate.');
