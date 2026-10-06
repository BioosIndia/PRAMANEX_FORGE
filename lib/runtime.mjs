/** Durable parent DAG domain contract. No role can grant regulatory/human authority. */
import {ForgeError,hash,uid,command,audit,readiness,qcDraft,checkState,normalizeField,actorCan} from './core.mjs';
import {executeRole,retrieveMemory} from './agentic.mjs';
import {inferDocument,inferCollaboration} from './model-gateway.mjs';
import {parseDocumentBytes} from './document-parser.mjs';
export const RUNTIME_VERSION='forge-durable-runtime/3';
export const MAX_RETRIES=3,MAX_ATTEMPTS=MAX_RETRIES+1,LEASE_MS=90_000;
export const RUNTIME_SCHEMA_SQL=`CREATE TABLE IF NOT EXISTS runtime_workflows (
 id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL REFERENCES workspaces(id), created_by TEXT NOT NULL,
 op_key TEXT NOT NULL, request_hash TEXT NOT NULL, goal TEXT NOT NULL, status TEXT NOT NULL,
 generation INTEGER NOT NULL, version INTEGER NOT NULL, cursor_revision INTEGER NOT NULL, cursor_hash TEXT NOT NULL,
 config TEXT NOT NULL, pause_reason TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 UNIQUE(workspace_id,created_by,op_key));
CREATE TABLE IF NOT EXISTS runtime_jobs (
 id TEXT PRIMARY KEY, workflow_id TEXT NOT NULL REFERENCES runtime_workflows(id), workspace_id TEXT NOT NULL,
 generation INTEGER NOT NULL, node_key TEXT NOT NULL, kind TEXT NOT NULL, status TEXT NOT NULL,
 depends_on TEXT NOT NULL, payload TEXT NOT NULL, input_revision INTEGER, input_hash TEXT, source_refs TEXT NOT NULL,
 attempts INTEGER NOT NULL, available_at INTEGER NOT NULL, lease_token TEXT, lease_until INTEGER,
 version INTEGER NOT NULL, output TEXT, failure TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
 UNIQUE(workflow_id,generation,node_key));
CREATE INDEX IF NOT EXISTS runtime_jobs_due ON runtime_jobs(status,available_at,lease_until);
CREATE INDEX IF NOT EXISTS runtime_workflows_workspace ON runtime_workflows(workspace_id,status);
CREATE TABLE IF NOT EXISTS runtime_events (
 id TEXT PRIMARY KEY, workflow_id TEXT NOT NULL REFERENCES runtime_workflows(id), job_id TEXT,
 action TEXT NOT NULL, actor_id TEXT NOT NULL, payload TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS runtime_events_workflow ON runtime_events(workflow_id,created_at);`;
export const ACTIVE_WORKFLOW=['READY','RUNNING'];
export const TASK_ROLES={CHECK_SOURCES:['A1'],EXTRACT:['A2','A3'],CHECK_EVIDENCE:['A4','A5'],HUMAN_FACT_REVIEW:['A16'],IMPACT:['A9'],HUMAN_CHANGE_REVIEW:['A16'],AUTHOR:['A10'],INDEPENDENT_QC:['A11'],HUMAN_DRAFT_REVIEW:['A16'],READINESS:['A12'],CONTROLLED_EXPORT:['A16','A18'],RETRIEVE_MEMORY:[],RESPONSE_CANDIDATE:['A15'],HUMAN_RESPONSE_REVIEW:['A16']};
export const TERMINAL_JOB=['COMPLETE','CANCELLED'];
const goals={
 PREPARE_CMC_DRAFT:[['source','CHECK_SOURCES',[]],['extract','EXTRACT',['source']],['consistency','CHECK_EVIDENCE',['extract']],['facts','HUMAN_FACT_REVIEW',['consistency']],['author','AUTHOR',['facts']],['qc','INDEPENDENT_QC',['author']],['draft','HUMAN_DRAFT_REVIEW',['qc']],['readiness','READINESS',['draft']],['export','CONTROLLED_EXPORT',['readiness']]],
 ASSESS_SOURCE_CHANGE:[['source','CHECK_SOURCES',[]],['impact','IMPACT',['source']],['change','HUMAN_CHANGE_REVIEW',['impact']],['extract','EXTRACT',['change']],['consistency','CHECK_EVIDENCE',['extract']],['facts','HUMAN_FACT_REVIEW',['consistency']],['author','AUTHOR',['facts']],['qc','INDEPENDENT_QC',['author']],['draft','HUMAN_DRAFT_REVIEW',['qc']]],
 RESPOND_HAQ:[['source','CHECK_SOURCES',[]],['consistency','CHECK_EVIDENCE',['source']],['facts','HUMAN_FACT_REVIEW',['consistency']],['memory','RETRIEVE_MEMORY',['facts']],['response','RESPONSE_CANDIDATE',['memory']],['review','HUMAN_RESPONSE_REVIEW',['response']]],
 CONTROLLED_EXPORT:[['source','CHECK_SOURCES',[]],['qc','INDEPENDENT_QC',['source']],['draft','HUMAN_DRAFT_REVIEW',['qc']],['readiness','READINESS',['draft']],['export','CONTROLLED_EXPORT',['readiness']]]
};
export async function createRuntimePlan(state,input,actor,clock=Date.now()){
 if(!actorCan(actor.role,'plan'))throw new ForgeError('FORBIDDEN','Your workspace role cannot enqueue a workflow.',403);
 if(!goals[input.goal])throw new ForgeError('UNSUPPORTED_GOAL','Choose a bounded workflow goal.');
 if(input.expectedVersion!==state.version)throw new ForgeError('STALE_REVISION','Refresh the current workspace before planning.',409);
 if(input.mode&&!['DETERMINISTIC','AI_ASSISTED'].includes(input.mode))throw new ForgeError('INVALID_MODE','Choose deterministic or explicitly configured AI-assisted mode.');
 if(input.mode==='AI_ASSISTED'&&input.providerPermission!==true)throw new ForgeError('PROVIDER_PERMISSION_REQUIRED','Authorize provider transmission before enqueuing AI-assisted work.',403);
 for(const key of ['sourceId','draftId'])if(input[key]&&!state[key==='sourceId'?'sources':'drafts'].some(o=>o.id===input[key]))throw new ForgeError('NOT_FOUND','Selected workflow input is unavailable.',404);
 const at=new Date(clock).toISOString(),id=uid('workflow'),config={sourceId:input.sourceId||null,draftId:input.draftId||null,section:input.section==='3.2.S'?'3.2.S':'3.2.P',title:String(input.title||'Controlled Module 3 candidate').slice(0,200),question:String(input.question||'').slice(0,2000),mode:input.mode||'DETERMINISTIC',providerPermission:input.providerPermission===true};
 return {workflow:{id,goal:input.goal,status:'READY',generation:1,version:0,cursorRevision:state.version,cursorHash:await hash(JSON.stringify(state)),config,createdBy:actor.id,createdAt:at,updatedAt:at,pauseReason:null},jobs:goals[input.goal].map(([nodeKey,kind,dependsOn])=>({id:uid('task'),workflowId:id,nodeKey,kind,dependsOn,payload:{...config,specialistRoles:TASK_ROLES[kind]||[]},status:'QUEUED',generation:1,version:0,attempts:0,availableAt:clock,leaseToken:null,leaseUntil:null,inputRevision:null,inputHash:null,sourceRefs:[],output:null,failure:null,createdAt:at,updatedAt:at}))};
}
export function canClaim(job,workflow,jobs,clock){return ACTIVE_WORKFLOW.includes(workflow.status)&&job.generation===workflow.generation&&job.attempts<MAX_ATTEMPTS&&((['QUEUED','RETRY_WAIT'].includes(job.status)&&job.availableAt<=clock)||(job.status==='RUNNING'&&job.leaseUntil<=clock))&&job.dependsOn.every(key=>jobs.some(j=>j.generation===workflow.generation&&j.nodeKey===key&&j.status==='COMPLETE'));}
export async function claimRuntimeJob(job,workflow,jobs,state,clock=Date.now()){
 if(!canClaim(job,workflow,jobs,clock))return null;
 if(state.version!==workflow.cursorRevision||await hash(JSON.stringify(state))!==workflow.cursorHash)throw new ForgeError('RUNTIME_STALE_REVISION','Workspace changed outside this workflow. Explicit replan/resume is required.',409);
 return {...job,status:'RUNNING',attempts:job.attempts+1,leaseToken:uid('lease'),leaseUntil:clock+LEASE_MS,inputRevision:state.version,inputHash:workflow.cursorHash,sourceRefs:state.sources.filter(s=>s.status!=='SUPERSEDED').map(s=>({id:s.id,version:s.version,hash:s.hash})),version:job.version+1,updatedAt:new Date(clock).toISOString()};
}
export function failureTransition(job,error,clock=Date.now()){
 const retryable=Boolean(error.retryable||['TimeoutError','AbortError'].includes(error.name)),retryCount=Math.max(0,job.attempts-1);
 const status=error.code==='MODEL_UNAVAILABLE'||error.code==='PROVIDER_PERMISSION_REQUIRED'?'HOLD':['RUNTIME_STALE_REVISION','STALE_REVISION','FORBIDDEN','SOURCE_REQUIRED','MANUAL_EXTRACTION_REQUIRED','NO_APPROVED_FACTS','NOT_EXPORT_READY','DRAFT_REQUIRED','QUESTION_REQUIRED','QC_FAILED','SOURCE_HASH_MISMATCH'].includes(error.code)?'HOLD':retryable&&job.attempts<MAX_ATTEMPTS?'RETRY_WAIT':'DLQ';
 return {...job,status,version:job.version+1,leaseToken:null,leaseUntil:null,availableAt:status==='RETRY_WAIT'?clock+Math.min(60_000,1000*2**job.attempts):clock,failure:{code:error.code||error.name||'TASK_FAILED',message:String(error.message||'Task failed').slice(0,500),retryable,retryCount,maximumRetries:MAX_RETRIES,ownerRequired:status!=='RETRY_WAIT',manualFallback:true,modelRuns:error.modelRuns||[]},updatedAt:new Date(clock).toISOString()};
}
export function controlRuntime(workflow,jobs,action,reason,actor,state,clock=Date.now()){
 if(!actorCan(actor.role,'planControl'))throw new ForgeError('FORBIDDEN','Your role cannot control this workflow.',403);
 if(!reason||typeof reason!=='string'||reason.trim().length<3)throw new ForgeError('REASON_REQUIRED','A recorded control reason is required.');
 if(!['pause','resume','cancel','escalate','replan','manualFallback'].includes(action))throw new ForgeError('INVALID_CONTROL','Unsupported runtime control.');
 if(['COMPLETE','CANCELLED'].includes(workflow.status)&&action!=='replan')throw new ForgeError('TERMINAL_WORKFLOW','This workflow is terminal; create a new explicit plan.',409);
 const at=new Date(clock).toISOString(),w={...workflow,version:workflow.version+1,pauseReason:reason.slice(0,1000),updatedAt:at};let next=jobs.map(j=>({...j}));
 w.status={pause:'PAUSED',resume:'READY',cancel:'CANCELLED',escalate:'ESCALATED',replan:'READY',manualFallback:'READY'}[action];
 if(action==='cancel')next=next.map(j=>j.status==='COMPLETE'?j:{...j,status:'CANCELLED',version:j.version+1,leaseToken:null,leaseUntil:null,updatedAt:at});
 if(['resume','manualFallback'].includes(action))next=next.map(j=>j.generation===w.generation&&!TERMINAL_JOB.includes(j.status)?{...j,status:'QUEUED',version:j.version+1,leaseToken:null,leaseUntil:null,availableAt:clock,updatedAt:at}:j);
 if(action==='manualFallback'){w.config={...w.config,mode:'DETERMINISTIC',providerPermission:false};next=next.map(j=>({...j,attempts:TERMINAL_JOB.includes(j.status)?j.attempts:0,payload:{...j.payload,mode:'DETERMINISTIC',providerPermission:false}}));}
 return {workflow:w,jobs:next,event:{action,actor:actor.id,reason,at,inputRevision:state.version,humanApprovalGranted:false}};
}
function gate(state,kind,config,context){
 const check=readiness(structuredClone(state));
 if(kind==='HUMAN_FACT_REVIEW')return {passed:state.fields.filter(f=>f.status==='APPROVED').every(f=>state.decisions.some(d=>d.targetId===f.id&&d.revision===f.revision&&d.status==='CURRENT'&&d.action==='APPROVE'&&d.reviewer))&&state.fields.some(f=>f.status==='APPROVED')&&!check.missing.length&&!check.openConflicts&&!check.anomalies&&!check.unreviewed&&!check.uncertain,blockers:{missing:check.missing,conflicts:check.openConflicts,anomalies:check.anomalies,unreviewed:check.unreviewed,uncertain:check.uncertain}};
 if(kind==='HUMAN_DRAFT_REVIEW'){const d=state.drafts.find(d=>d.id===(context.draftId||config.draftId));return {passed:Boolean(d&&d.status==='APPROVED'&&qcDraft(structuredClone(state),d).passed&&state.decisions.some(x=>x.targetId===d.id&&x.revision===d.revision&&x.action==='APPROVE'&&x.status==='CURRENT')),draftId:d?.id,blockers:'Named exact-revision human draft decision required.'};}
 if(kind==='HUMAN_RESPONSE_REVIEW'){
  const q=state.queries.find(q=>q.id===context.queryId);
  const currentEvidence=Boolean(q?.fieldIds?.length&&q.fieldIds.every(id=>{
   const f=state.fields.find(field=>field.id===id),source=state.sources.find(s=>s.id===f?.sourceId);
   return f?.status==='APPROVED'&&source?.status==='PARSED'&&f.sourceVersion===source.version&&f.sourceHash===source.hash;
  }));
  return {passed:Boolean(q?.status==='APPROVED'&&q.reviewer&&q.reviewer!==q.createdBy&&q.reviewedRevision===q.revision&&currentEvidence),queryId:q?.id,outcomeRecorded:false,scope:'INDEPENDENT_RESPONSE_REVIEW_ONLY',blockers:'Independent exact-revision response review with current source evidence required. An authority outcome needs its separate source-backed lifecycle record.'};
 }
 if(kind==='HUMAN_CHANGE_REVIEW'){const s=state.sources.find(s=>s.id===config.sourceId);return {passed:Boolean(s&&state.changes.some(c=>c.oldSourceId===s.id||c.newSourceId===s.id)),blockers:'Register the source revision through a reasoned human change operation, then replan.'};}
 return {passed:false,blockers:'Unknown human gate.'};
}
export async function executeRuntimeJob(job,state,actor,config={},context={}){
 if(state.version!==job.inputRevision||await hash(JSON.stringify(state))!==job.inputHash)throw new ForgeError('RUNTIME_STALE_REVISION','Task input hash/revision is stale.',409);
 const started=performance.now(),payload=job.payload;let after=structuredClone(state),output={};
 const apply=async(input)=>{const r=await command(after,{...input,expectedVersion:after.version},{...actor,traceId:job.workflowId});after=r.state;return r.result;};
 if(job.kind.startsWith('HUMAN_')){const result=gate(state,job.kind,payload,context);return {state:null,status:result.passed?'COMPLETE':'HUMAN_WAIT',output:{...result,specialistRoles:TASK_ROLES[job.kind]||[],humanApprovalGranted:false,latencyMs:Math.round(performance.now()-started),costState:'NOT_MEASURED',tokenState:'NOT_MEASURED'}};}
 if(job.kind==='CHECK_SOURCES'){if(!after.sources.some(s=>s.status!=='SUPERSEDED'&&s.permission))throw new ForgeError('SOURCE_REQUIRED','Add a current permitted original source.',409);output=executeRole(after,'A1').output;}
 else if(job.kind==='EXTRACT'){
  const sources=after.sources.filter(s=>s.status!=='SUPERSEDED'&&s.status!=='PARSED');if(sources.length>20)throw new ForgeError('TASK_BATCH_LIMIT','Replan a bounded source set: maximum twenty sources per extraction task.',413);
  const results=[];for(const source of sources){if(['application/json','text/csv','text/plain'].includes(source.type)){const r=await apply({action:'extract',id:source.id});if(r.failure)throw new ForgeError('PARSER_FAILED',r.failure,409);results.push({sourceId:source.id,count:r.count||0,mode:'DETERMINISTIC'});}else if(['application/xml','text/xml','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(source.type)){if(!actorCan(actor.role,'extract'))throw new ForgeError('FORBIDDEN','Extraction permission is required.',403);const bytes=await config.readOriginal?.(source);if(!bytes)throw new ForgeError('SOURCE_FAILED','Stored original is unavailable.',503);if(await hash(bytes)!==source.hash)throw new ForgeError('SOURCE_HASH_MISMATCH','Original bytes do not match the source hash.',409);const parsed=await parseDocumentBytes(bytes,source.type,source.name);if(parsed.status!=='PARSED')throw new ForgeError('MANUAL_EXTRACTION_REQUIRED',parsed.failure?.message||'Document schema needs manual review.',409);if(parsed.rows.length>500)throw new ForgeError('TASK_BATCH_LIMIT','Maximum 500 fields per document extraction task.',413);after.fields.push(...parsed.rows.map(row=>normalizeField({...row,id:uid('fact'),sourceId:source.id,sourceVersion:source.version,sourceHash:source.hash,product:row.product||after.product,revision:1,extractionMode:'DETERMINISTIC_PACKAGE_XML',parserVersion:parsed.parserVersion})));source.status='PARSED';source.parser=parsed.parserVersion;source.extractionWarnings=parsed.warnings;results.push({sourceId:source.id,count:parsed.rows.length,mode:'DETERMINISTIC_PACKAGE_XML',humanReviewRequired:true});}else{if(payload.mode!=='AI_ASSISTED')throw new ForgeError('MANUAL_EXTRACTION_REQUIRED','Original is preserved. Use configured vision with consent, or manually verify its structured transcript.',409);if(!payload.providerPermission)throw new ForgeError('PROVIDER_PERMISSION_REQUIRED','Provider transmission permission is absent.',403);if(!actorCan(actor.role,'extract'))throw new ForgeError('FORBIDDEN','Extraction permission is required.',403);const bytes=await config.readOriginal?.(source);if(!bytes)throw new ForgeError('SOURCE_FAILED','Stored original is unavailable.',503);if(await hash(bytes)!==source.hash)throw new ForgeError('SOURCE_HASH_MISMATCH','Original bytes do not match the recorded source hash.',409);const candidate=await (config.inferDocument||inferDocument)(bytes,source,{provider:config.provider,apiKey:config.apiKey,model:config.visionModel,operationId:job.id});after.fields.push(...candidate.fields.map(f=>({...normalizeField({id:uid('fact'),parameter:f.parameter.toLowerCase(),rawValue:f.rawValue,rawUnit:f.unit,method:f.method,batch:f.batch||'UNSPECIFIED',basis:f.basis,low:f.low,high:f.high,condition:'',sourceId:source.id,sourceVersion:source.version,sourceHash:source.hash,product:after.product,revision:1,span:{page:f.page,bbox:f.bbox,raw:f.rawQuote,path:'vision-candidate',offsetKind:'normalized page region'},extractionMode:'VISION_CANDIDATE',confidence:f.confidence,modelVersion:candidate.model}),status:'NEEDS_REVIEW'})));source.status='PARSED';source.parser=candidate.principal;after.agentRuns.push(candidate);results.push({sourceId:source.id,count:candidate.fields.length,mode:'VISION_CANDIDATE',humanReviewRequired:true});}}
  output={results,originalsRemainAuthority:true};
 }
 else if(job.kind==='CHECK_EVIDENCE'){output={normalizer:executeRole(after,'A4').output,consistency:executeRole(after,'A5').output};}
 else if(job.kind==='IMPACT'){output=executeRole(after,'A9',{sourceId:payload.sourceId}).output;}
 else if(job.kind==='RETRIEVE_MEMORY'){output={records:retrieveMemory(after,payload.question),approvedCurrentOnly:true};}
 else if(job.kind==='AUTHOR'){
  const approved=after.fields.filter(f=>f.status==='APPROVED');if(!approved.length)throw new ForgeError('NO_APPROVED_FACTS','Approved current facts are required.',409);
  if(payload.mode==='AI_ASSISTED'){if(!payload.providerPermission)throw new ForgeError('PROVIDER_PERMISSION_REQUIRED','Provider transmission permission is absent.',403);const candidate=await (config.inferCollaboration||inferCollaboration)(approved,{provider:config.provider,apiKey:config.apiKey,model:config.model,reviewerModel:config.reviewerModel,operationId:job.id});const r=await apply({action:'draft',title:payload.title,section:payload.section});const draft=after.drafts.find(d=>d.id===r.draftId);draft.authorPrincipal=candidate.principal;draft.statements=draft.statements.map(st=>({...st,text:candidate.statements.find(c=>c.fieldId===st.fieldId).text}));draft.qc=qcDraft(after,draft);draft.modelVersion=candidate.model;draft.promptHash=candidate.promptHash;draft.modelTeam=candidate.id;draft.evidenceHash=candidate.evidenceHash;draft.reviewerModel=candidate.reviewerModel;after.agentRuns.push(candidate);output={draftId:draft.id,state:'CANDIDATE',collaboration:{teamId:candidate.id,models:[candidate.model,candidate.reviewerModel],roles:candidate.runs?.map(r=>r.principal),evidenceHash:candidate.evidenceHash,release:false},providerUsage:candidate.usage||null,providerUsageState:candidate.usage?'MEASURED':'NOT_MEASURED'};
  }else output={...await apply({action:'draft',title:payload.title,section:payload.section}),state:'CANDIDATE',mode:'DETERMINISTIC'};
 }
 else if(job.kind==='INDEPENDENT_QC'){const id=context.draftId||payload.draftId;if(!id)throw new ForgeError('DRAFT_REQUIRED','Select a current draft or run its authoring dependency first.',409);output={draftId:id,...await apply({action:'qc',id})};if(!output.qc.passed)throw new ForgeError('QC_FAILED','Independent deterministic QC found evidence blockers.',409);}
 else if(job.kind==='READINESS'){output=executeRole(after,'A12').output;if(!output.exportReady)throw new ForgeError('NOT_EXPORT_READY','Human approvals or required evidence remain incomplete.',409);}
 else if(job.kind==='CONTROLLED_EXPORT'){const id=context.draftId||payload.draftId;if(!id)throw new ForgeError('DRAFT_REQUIRED','Select the exact approved draft.',409);output={...await apply({action:'export',id}),finalized:false,release:false};}
 else if(job.kind==='RESPONSE_CANDIDATE'){if(!payload.question)throw new ForgeError('QUESTION_REQUIRED','Supply the actual authority question.');output={...await apply({action:'query',title:payload.question,fieldIds:after.fields.filter(f=>f.status==='APPROVED').map(f=>f.id)}),state:'CANDIDATE'};}
 else throw new ForgeError('UNKNOWN_TASK','Unsupported runtime DAG task.');
 checkState(after);audit(after,{...actor,traceId:job.workflowId},'runtimeTaskCandidate',job.id,{kind:job.kind,inputRevision:job.inputRevision,inputHash:job.inputHash,output,humanApprovalGranted:false});after.version++;
 return {state:after,status:'COMPLETE',output:{...output,specialistRoles:TASK_ROLES[job.kind]||[],runtimeVersion:RUNTIME_VERSION,humanApprovalGranted:false,latencyMs:Math.round(performance.now()-started),cost:null,costState:'NOT_MEASURED',tokenState:output.providerUsageState||'NOT_MEASURED'}};
}
