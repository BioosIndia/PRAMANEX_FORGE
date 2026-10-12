/** Compiled Worker integration: fixed synthetic originals, real adapters and local persistence. */
import {createRequire} from 'node:module';
import {readFileSync,readdirSync,realpathSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const require=createRequire(realpathSync('node_modules/wrangler/package.json'));
const {Miniflare,Log,LogLevel}=require('miniflare');
const slug=JSON.parse(readFileSync('.openai/hosting.json')).project_id;
const ledger=slug==='appgprj_6ac4de4b7ba881918706f67b0d056d73',forge=slug==='appgprj_6ac147bd4fcc8191add005ddfee27367';
const product=ledger?'LEDGER-Q':forge?'FORGE':'BEACON';
const expected=ledger?{sourceId:'SYNTHETIC-QUALITY-CANARY',sourceVersion:1,originalAssay:'94.2%',transcribedAssay:'99.1%',batch:'LQ-026',method:'HPLC-Q-02',rootCause:'UNKNOWN',capaEffectiveness:null,status:'HOLD',release:false}:forge?{sourceId:'SYNTHETIC-CMC-CANARY',sourceVersion:1,originalAssay:'98.6%',transcribedAssay:'99.1%',batch:'SYN-A',method:'HPLC-SYN-01',dissolution:null,status:'HOLD',release:false}:{sourceId:'SYNTHETIC-REGULATORY-CANARY',sourceVersion:1,previousInterval:'30 days',currentInterval:'15 days',applicability:'UNKNOWN',status:'HOLD',release:false};
function walk(d){return readdirSync(d).flatMap(n=>{const p=resolve(d,n);return statSync(p).isDirectory()?walk(p):p.endsWith('.js')?[p]:[];});}
const entry=resolve('dist/server/index.js'),modules=[entry,...walk('dist/server').filter(p=>p!==entry)].map(path=>({type:'ESModule',path}));
const token='synthetic-service-test-only',digest=createHash('sha256').update(token).digest('hex');
let calls=0,failProvider=false;
const mf=new Miniflare({modules,modulesRoot:resolve('dist/server'),compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{QUALITY_MONITOR_SERVICE_DIGEST:digest,GROQ_API_KEY:'synthetic-provider-fixture',GROQ_MODEL:'test-author',GROQ_REVIEWER_MODEL:'test-reviewer',QUALITY_AUTHOR_MODEL:'test-author',QUALITY_REVIEWER_MODEL:'test-reviewer'},outboundService:async request=>{
 assert.equal(new URL(request.url).hostname,'api.groq.com');
 if(request.method==='GET')return Response.json({data:[{id:'test-author'},{id:'test-reviewer'}]});
 calls++;if(failProvider)return Response.json({error:'fixture failure'},{status:401});
 const b=await request.json(),review=b.messages[0].content.includes('Candidate is untrusted');
 return Response.json({model:b.model,usage:{total_tokens:12},choices:[{finish_reason:'stop',message:{content:JSON.stringify(review?{supported:true,issues:[],release:false}:expected)}}]});
},log:new Log(LogLevel.ERROR)});
let passed=0;
async function check(name,fn){await fn();passed++;console.log('PASS '+name);}
async function call(path,body,auth=true,status=200,method){const res=await mf.dispatchFetch('https://quality.test'+path,{method:method||(body?'POST':'GET'),headers:{...(auth?{'x-quality-monitor-service':token}:{}),...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const txt=await res.text();assert.equal(res.status,status,path+' '+txt.slice(0,300));return res.headers.get('content-type')?.includes('json')?JSON.parse(txt):txt;}
try{
 const db=await mf.getD1Database('DB');for(const f of readdirSync('drizzle').filter(n=>n.endsWith('.sql')).sort())for(const sql of readFileSync('drizzle/'+f,'utf8').split('--> statement-breakpoint').filter(s=>s.trim()))await db.prepare(sql).run();
 await check('service authentication blocks execution',()=>call('/api/quality/background',{mode:'engineering'},false,403));
 await check('service authentication blocks service readback',()=>call('/api/quality/background',null,false,403));
 await check('public status begins with no invented receipt',async()=>{const s=await call('/api/quality/status',null,false);assert.equal(s.engineering.state,'AWAITING_FIRST_CHECK');assert.equal(s.qualification.automaticApproval,false);});
 await check('unknown command cannot enter monitor',()=>call('/api/quality/background',{mode:'engineering',approve:true},true,400));
 let run;await check('real engine controls and original readback persist',async()=>{run=await call('/api/quality/background',{mode:'engineering'});assert.equal(run.state,'CONTROL_CHECKS_PASSED',JSON.stringify(run.checks.filter(c=>!c.pass)));assert.equal(run.product,product);assert.equal(run.persisted,true);assert.equal(run.privateEvidenceAccessed,false);assert.equal(run.release,false);assert.ok(run.checks.length>=8);});
 await check('duplicate execution reuses sealed receipt',async()=>{const again=await call('/api/quality/background',{mode:'engineering'});assert.equal(again.cached,true);assert.equal(again.receiptHash,run.receiptHash);assert.equal(calls,0);});
 await check('saved status verifies hash and current build',async()=>{const s=await call('/api/quality/status',null,false);assert.equal(s.engineering.receiptHash,run.receiptHash);assert.equal(s.engineering.integrityVerified,true);assert.equal(s.engineering.freshness,'CURRENT');});
 await check('sealed evidence cannot be overwritten or deleted',async()=>{await assert.rejects(db.prepare('UPDATE quality_monitor_runs SET state=? WHERE id=?').bind('APPROVED',run.id).run());await assert.rejects(db.prepare('DELETE FROM quality_monitor_runs WHERE id=?').bind(run.id).run());});
 let ai;await check('two separate provider fixtures check frozen answers',async()=>{ai=await call('/api/quality/background',{mode:'live-ai'});assert.equal(ai.state,'CONTROL_CHECKS_PASSED',JSON.stringify(ai.model));assert.equal(ai.model.actualInference,true);assert.equal(calls,2);assert.equal(ai.model.attempts.length,2);assert.equal(ai.model.reviewerCheck.pass,true);});
 await check('duplicate live canary never doubles provider cost',async()=>{const again=await call('/api/quality/background',{mode:'live-ai'});assert.equal(again.cached,true);assert.equal(again.receiptHash,ai.receiptHash);assert.equal(calls,2);});
 await check('protocol stays unapproved and requires real acceptance',async()=>{const p=await call('/api/quality/protocol',null,false);assert.ok(JSON.stringify(p).includes('UNAPPROVED'));assert.ok(JSON.stringify(p).includes('human'));});
 await check('quality report route renders without secrets',async()=>{const page=await call('/quality',null,false);assert.ok(page.includes('quality'));assert.ok(!page.includes(token));});
 if(ledger){
  await check('public proof history is limited to its own saved current revision',async()=>{const demo=await call('/api/ledger/demo',null,false);const replay=await call('/api/ledger/demo-history?revision='+demo.revision,null,false);assert.equal(replay.readOnly,true);assert.equal(replay.revision,demo.revision);assert.deepEqual(replay.state,demo.state);});
  await check('public history rejects foreign workspace selection',()=>call('/api/ledger/demo-history?revision=1&workspaceId=foreign',null,false,400));
  await check('public history rejects unavailable revisions',()=>call('/api/ledger/demo-history?revision=999',null,false,404));
  await check('public history cannot be mutated',()=>call('/api/ledger/demo-history',{revision:1},false,405));
  await check('public replay does not expose private history',()=>call('/api/ledger/history?workspaceId=foreign',null,false,401));
 }
 console.log(JSON.stringify({product,passed,scope:'Compiled local Worker, synthetic data and provider fixtures; not live inference or qualified acceptance'}));
}finally{await mf.dispose();}
