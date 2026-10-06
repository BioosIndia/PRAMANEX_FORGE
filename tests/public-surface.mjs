import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
const cases=[];
async function collect(dir){const out=[];for(const item of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,item.name);if(item.isDirectory())out.push(...await collect(p));else out.push(p);}return out;}
async function test(name,fn){try{await fn();cases.push({name,status:'PASS'});}catch(e){cases.push({name,status:'FAIL',error:e.message});console.error(name,e.message);}}
const files=await collect('dist/client'),scripts=files.filter(p=>p.endsWith('.js')),js=(await Promise.all(scripts.map(p=>fs.readFile(p,'utf8')))).join('\n');
await test('Actual production client scripts exist for a meaningful privacy inspection',()=>assert.ok(scripts.length>=5));
await test('Full internal source register is absent from compiled browser scripts',()=>{for(const token of ['unresolved_identifiers','additional_controls','sourceMaturity','PRAMANEX_FORGE_Enterprise_SaaS_Master_Blueprint','S-P01–S-P06'])assert.ok(!js.includes(token),`Unexpected internal register marker: ${token}`);});
await test('Raw detailed account test records are absent from compiled browser scripts',async()=>{const proof=JSON.parse(await fs.readFile('docs/proof/account-results.json','utf8'));for(const c of proof.cases||[])if(c.name?.length>60)assert.ok(!js.includes(c.name),`Unexpected detailed fixture record: ${c.name}`);});
await test('Requirements matrix and original architecture documents are not static assets',()=>{for(const p of files)assert.ok(!/source-registry|coverage\.json|FEATURE_MATRIX|enterprise-blueprint|expanded-architecture|acceptance-source|fixtures\/official/.test(p),`Unexpected static internal artifact: ${p}`);});
await test('Replacement quality controls are compiled into the current release',()=>{assert.ok(js.includes('Quality & service status'));assert.ok(js.includes('Watch while open'));assert.ok(!js.includes('Source-faithful coverage register'));});
const passed=cases.filter(c=>c.status==='PASS').length,failed=cases.length-passed;await fs.writeFile('docs/proof/public-surface-results.json',JSON.stringify({at:new Date().toISOString(),passed,failed,cases,boundary:'Actual built browser assets checked for the listed internal-disclosure markers. This does not make delivered frontend algorithms secret or establish a comprehensive security assessment.'},null,2));console.log(JSON.stringify({passed,failed}));if(failed)process.exitCode=1;
