// Read-only UI projections. Never create scientific values, statuses or relationships.
export const GROUPS = [
  {id:'source',label:'Sources',color:'#71e0dd'},
  {id:'fact',label:'Facts',color:'#79cea8'},
  {id:'context',label:'Context',color:'#adb1ff'},
  {id:'draft',label:'Content',color:'#d98bd3'},
  {id:'decision',label:'Decisions',color:'#efbb80'},
  {id:'export',label:'Exports',color:'#81b8ec'}
];
export function graphGroup(type){
  if(GROUPS.some(g=>g.id===type))return type;
  if(['blocks','templates','reuses','dossiers','haqs','outcomes','query'].includes(type))return 'draft';
  if(['closures','verifications','corrections','decisions','action'].includes(type))return 'decision';
  return 'context';
}
/** @param {any} graph @param {{group?:string|null,page?:number,selected?:string|null,limit?:number}} options */
export function radialProjection(graph,{group=null,page=0,selected=null,limit=6}={}){
  const groups=GROUPS.map((g,i)=>({...g,nodes:graph.nodes.filter(n=>graphGroup(n.type)===g.id),angle:(-145+i*60)*Math.PI/180,offset:0,pages:0}));
  const positions=new Map(), hubs=new Map(),visible=[];
  for(const g of groups){
    const x=470+Math.cos(g.angle)*228,y=320+Math.sin(g.angle)*185;
    hubs.set(g.id,{x,y});
    const lastPage=Math.max(0,Math.ceil(g.nodes.length/limit)-1);
    let offset=g.id===group?Math.min(lastPage,Math.max(0,page))*limit:0;
    const chosen=g.nodes.findIndex(n=>n.id===selected);
    if(chosen>=0&&(chosen<offset||chosen>=offset+limit))offset=Math.floor(chosen/limit)*limit;
    const slice=g.nodes.slice(offset,offset+limit);
    g.offset=offset;g.pages=Math.ceil(g.nodes.length/limit);
    slice.forEach((n,i)=>{
      // QGen-style leaf fans: parallel rows keep labels readable at the poles.
      const polar=Math.abs(Math.cos(g.angle))<.35;
      const leafX=polar?x+125:x+Math.sign(Math.cos(g.angle))*132;
      const leafY=polar?(g.angle<0?34:456)+i*26:y+(i-(slice.length-1)/2)*29;
      positions.set(n.id,{x:leafX,y:leafY,group:g.id});
      visible.push(n);
    });
  }
  return {groups,hubs,positions,visible,edges:graph.edges.filter(e=>positions.has(e.from)&&positions.has(e.to))};
}
export function statusBucket(status){
  if(['APPROVED','PARSED','COMPLETE','CLOSED','SIGNED'].includes(status))return 'Approved / processed';
  if(['STALE','SUPERSEDED','REJECTED'].includes(status))return 'Stale / rejected';
  if(/HOLD|MISSING|FAILED|OPEN|UNCERTAIN|WAITING/.test(status||''))return 'Blocked';
  return 'Review / pending';
}
export const STATUS_COLORS={'Approved / processed':'#79cea8','Review / pending':'#a9a4f0','Blocked':'#edbc7e','Stale / rejected':'#d591a3'};
export function evidenceOverview(state,graph){
  const statuses=Object.keys(STATUS_COLORS).map(label=>({label,color:STATUS_COLORS[label],count:graph.nodes.filter(n=>statusBucket(n.status)===label).length}));
  const batchNames=[...new Set(state.fields.map(f=>f.batch||'Unassigned'))];
  const batches=batchNames.map(label=>({label,total:state.fields.filter(f=>(f.batch||'Unassigned')===label).length,segments:Object.keys(STATUS_COLORS).map(name=>({label:name,color:STATUS_COLORS[name],count:state.fields.filter(f=>(f.batch||'Unassigned')===label&&statusBucket(f.status)===name).length}))}));
  const activity=[...(state.audit||[])].slice(-6).reverse();
  return {statuses,batches,total:graph.nodes.length,activity};
}

/** Read-only current-snapshot navigation. Recorded checks are not scientific approval. */
export function workflowCockpit(state){
 const sources=state.sources||[],fields=state.fields||[],drafts=state.drafts||[],exports=state.exports||[],conflicts=state.conflicts||[];
 const stale=[...fields,...drafts].filter(r=>r.status==='STALE').length;
 const open=conflicts.filter(r=>r.status==='OPEN').length;
 const approvedFields=fields.filter(r=>r.status==='APPROVED').length;
 const waiting=fields.filter(r=>!['APPROVED','REJECTED','STALE'].includes(r.status)).length;
 const draftWait=drafts.filter(r=>!['APPROVED','REJECTED','STALE'].includes(r.status)).length;
 const qc= drafts.filter(r=>r.qc?.passed===true&&r.status!=='STALE').length;
 let next={view:'audit',label:'Inspect recorded history',reason:'Review the saved decision and snapshot trail. Filing and release remain human responsibilities.'};
 if(!sources.length)next={view:'sources',label:'Preserve your first source',reason:'Start with a permitted original; no evidence has been saved yet.'};
 else if(stale)next={view:'changes',label:'Recheck changed evidence',reason:`${stale} stale fact or draft records need fresh review.`};
 else if(open)next={view:'conflicts',label:'Resolve evidence conflicts',reason:`${open} open conflicts need an evidence-based human decision.`};
 else if(!fields.length)next={view:'extraction',label:'Extract inspectable facts',reason:'A saved original is not yet an approved scientific fact.'};
 else if(waiting)next={view:'reviews',label:'Review the source-bound facts',reason:`${waiting} fact candidates await a named decision.`};
 else if(!drafts.length)next={view:'drafts',label:'Prepare a controlled draft',reason:'Use approved current facts; technical QC and human review remain separate.'};
 else if(draftWait)next={view:qc?'reviews':'drafts',label:qc?'Review the current draft':'Inspect technical QC',reason:'QC results and human approval must bind the exact current candidate.'};
 else if(!exports.length)next={view:'exports',label:'Inspect controlled delivery',reason:'A current approved draft may be frozen; finalization and filing are distinct.'};
 return {stale,open,approvedFields,next,stages:[
  {label:'Preserve',view:'sources',value:sources.length,note:'Original source versions',state:sources.length?'RECORDED':'AWAITING_SOURCE'},
  {label:'Extract',view:'extraction',value:fields.length,note:'Recorded fact candidates',state:fields.length?'RECORDED':'AWAITING_EVIDENCE'},
  {label:'Author',view:'drafts',value:drafts.length,note:'Saved draft records',state:drafts.length?'RECORDED':'AWAITING_FACTS'},
  {label:'Technical QC',view:'drafts',value:qc,note:'Non-stale drafts with passing recorded QC',state:qc?'RECORDED':'QC_REQUIRED'},
  {label:'Human review',view:'reviews',value:waiting+draftWait,note:'Pending fact and draft candidates',state:waiting+draftWait?'HUMAN_REVIEW_REQUIRED':'INSPECT_DECISIONS'},
  {label:'Freeze',view:'exports',value:exports.length,note:'Frozen evidence snapshots · release false',state:exports.length?'SNAPSHOT':'AWAITING_APPROVAL'}
 ]};
}
