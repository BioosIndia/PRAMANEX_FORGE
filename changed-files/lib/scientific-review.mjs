/** Structured source-bound completeness review; never a scientific approval engine. */
export const SCIENTIFIC_PROFILES=Object.freeze({
 METHOD:{section:'3.2.P.5.3 / 3.2.S.4.3',items:['procedure and revision','intended purpose','development rationale','validation or verification protocol','validation or verification results','acceptance criteria','transfer status'],source:'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/q2r2-validation-analytical-procedures'},
 STABILITY:{section:'3.2.P.8 / 3.2.S.7',items:['batch and strength','container closure','storage conditions','time points','method and revision','results and specification','protocol and commitments'],source:'https://database.ich.org/sites/default/files/Q1A(R2)%20Step4.pdf'},
 QOS:{section:'2.3 linked to Module 3',items:['summary source references','corresponding Module 3 sections','matching numbers and units','matching batch method and conditions','missing information and conflicts'],source:'https://database.ich.org/sites/default/files/M4Q_R1_Guideline.pdf'},
 COMMITMENT:{section:'Product and market-specific post-approval context',items:['approved registration conditions','market and product','change description','regional reporting basis','commitment owner and due date','fulfilment evidence'],source:'https://database.ich.org/sites/default/files/Q12_Guideline_Step4_2019_1119.pdf'},
 HA_RESPONSE:{section:'Actual authority request and source-backed response',items:['original authority request','requested scope and due date','response evidence','open gaps','reviewed response','submission receipt'],source:null},
 HANDOFF:{section:'Technical handoff only; not eCTD conformance',items:['receiving system and permission','source revision manifest','mapped receiving identifiers','acknowledgement','reconciliation evidence'],source:null}
});
export const CTD_PROFILES=Object.freeze({
 M4Q_R1:{version:'ICH M4Q(R1)',status:'ESTABLISHED_STRUCTURE',source:'https://database.ich.org/sites/default/files/M4Q_R1_Guideline.pdf'},
 M4Q_R2_PREVIEW:{version:'FDA M4Q(R2), January 2026',status:'DRAFT_PREVIEW_NOT_FOR_IMPLEMENTATION',source:'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/m4qr2-common-technical-document-registration-pharmaceuticals-human-use-quality'}
});
function fail(code,message){const e=Error(message);e.code=code;e.status=409;throw e;}
function evidence(state,ref){
 const source=state.sources.find(s=>s.id===ref?.sourceId);
 if(!source||source.status!=='PARSED'||!source.permission||source.version!==ref.version||source.hash!==ref.hash)fail('SCIENTIFIC_SOURCE','Select an exact current permitted parsed source revision.');
 if(!Number.isInteger(ref.start)||!Number.isInteger(ref.end)||ref.start<0||ref.end<=ref.start||ref.end-ref.start>6000||ref.end>String(source.text||'').length)fail('SCIENTIFIC_SPAN','Use a bounded exact original-text location. Binary-only originals need reviewed transcription first.');
 const raw=source.text.slice(ref.start,ref.end);if(ref.raw!==raw)fail('SCIENTIFIC_SPAN','Evidence wording differs from the preserved original.');
 return {sourceId:source.id,version:source.version,hash:source.hash,start:ref.start,end:ref.end,raw};
}
export function scientificStatus(state,record){
 const stale=record.evidence.some(ref=>{try{evidence(state,ref);return false;}catch{return true;}});
 return stale?'STALE':record.decision?.choice==='APPROVE'?'REVIEWED_COMPLETENESS_ONLY':record.decision?.choice==='REJECT'?'HOLD':record.missing.length?'HOLD':'REVIEW REQUIRED';
}
export async function scientificAction(state,input,actor){
 if(!['owner','admin','author','reviewer','approver'].includes(actor.role))fail('FORBIDDEN','Workspace scientific-review permission required.');
 state.ext??={};state.ext.scientific??={records:[],profile:'M4Q_R1'};const store=state.ext.scientific;
 if(input.operation==='profile'){
  if(!['owner','admin'].includes(actor.role)||!CTD_PROFILES[input.profile])fail('FORBIDDEN','Only an owner/admin may choose a supported profile.');
  if(input.profile==='M4Q_R2_PREVIEW'&&input.confirmDraftPreview!==true)fail('DRAFT_PROFILE','Explicitly confirm a non-submission draft preview.');
  if(store.profile!==input.profile){for(const d of state.drafts||[])d.status='STALE';for(const d of state.decisions||[])if(d.kind==='draft'&&d.status==='CURRENT')d.status='STALE';}store.profile=input.profile;return {profile:input.profile,submissionQualified:false};
 }
 if(input.operation==='review'){
  const r=store.records.find(r=>r.id===input.id);if(!r||r.digest!==input.digest)fail('STALE_REVISION','Refresh the exact assessment before reviewing.');
  if(!['owner','reviewer','approver'].includes(actor.role)||r.author===actor.id)fail('INDEPENDENT_REVIEW_REQUIRED','A different authorized scientific reviewer is required.');
  if(!['APPROVE','REJECT','REQUEST_EVIDENCE'].includes(input.choice)||typeof input.reason!=='string'||input.reason.trim().length<10)fail('REVIEW_REASON','Choose a decision and explain the evidence in at least ten characters.');
  if(scientificStatus(state,r)==='STALE'||input.choice==='APPROVE'&&r.missing.length)fail('SCIENTIFIC_GAP','Current source evidence for every selected checklist item is required; never fill a gap by guessing.');
  r.decision={choice:input.choice,reason:input.reason.trim().slice(0,2000),reviewer:actor.id,at:new Date().toISOString(),digest:r.digest};return {recordId:r.id,status:scientificStatus(state,r)};
 }
 if(input.operation!=='assess'||!SCIENTIFIC_PROFILES[input.type])fail('SCIENTIFIC_TYPE','Choose a supported scientific completeness assessment.');
 if(store.records.length>=100)fail('SCIENTIFIC_LIMIT','The bounded workspace supports 100 scientific assessments.');
 const profile=SCIENTIFIC_PROFILES[input.type];if(!Array.isArray(input.evidence)||input.evidence.length>30)fail('SCIENTIFIC_SOURCE','Supply a bounded evidence list.');
 const seen=new Set(),refs=input.evidence.map(ref=>{if(!profile.items.includes(ref.item)||seen.has(ref.item))fail('SCIENTIFIC_ITEM','Use one exact citation per named completeness item.');seen.add(ref.item);return {item:ref.item,...evidence(state,ref)};});
 const missing=profile.items.filter(item=>!seen.has(item));const record={id:'scientific_'+crypto.randomUUID(),type:input.type,profile:store.profile,createdAt:new Date().toISOString(),author:actor.id,inputRevision:state.version,evidence:refs,missing,decision:null,
  boundary:'Checklist evidence coverage only. A method identifier is not validation. Stability results are not extrapolated. No authority acceptance, eCTD conformance or commercial qualification is established.'};
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(record)));record.digest=Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');store.records.push(record);return {recordId:record.id,status:scientificStatus(state,record)};
}
export function scientificOverview(state){const store=state.ext?.scientific;return {profile:CTD_PROFILES[store?.profile||'M4Q_R1'],records:(store?.records||[]).map(r=>({...r,status:scientificStatus(state,r)})),qualified:false};}

export function scientificDraftIssues(state,draft){
 const type=/^2\.3/.test(draft.section)?'QOS':/^3\.2\.(?:P\.8|S\.7)/.test(draft.section)?'STABILITY':/^3\.2\.(?:P\.5\.3|S\.4\.3)/.test(draft.section)?'METHOD':null;
 if(!type)return [];
 const sourceIds=[...new Set((draft.fieldIds||[]).map(id=>state.fields.find(f=>f.id===id)?.sourceId).filter(Boolean))];
 const reviewed=(state.ext?.scientific?.records||[]).some(r=>r.type===type&&scientificStatus(state,r)==='REVIEWED_COMPLETENESS_ONLY'&&sourceIds.every(id=>r.evidence.some(e=>e.sourceId===id)));
 return reviewed?[]:[{code:'SCIENTIFIC_COMPLETENESS_REVIEW_REQUIRED',message:type+' section requires an independently reviewed current completeness record covering the draft source revisions.'}];
}
