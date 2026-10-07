import {qcDraft} from './core.mjs';
/** Projection only. A readable candidate brief cannot approve or export final work. */
export function draftOutcome(state,draft){
 const check=qcDraft(structuredClone(state),draft);
 const decision=state.decisions.findLast(d=>d.targetId===draft.id&&d.revision===draft.revision&&d.status==='CURRENT'&&d.action==='APPROVE');
 const stale=draft.status==='STALE';
 const approved=!stale&&draft.status==='APPROVED'&&check.passed&&!!decision;
 const problems=[...new Set(check.issues.map(i=>i.message))];
 if(stale)problems.unshift('Evidence changed after this draft was prepared. The old review cannot be reused.');
 return {status:stale?'STALE':!check.passed?'HOLD':approved?'APPROVED REVISION':'HUMAN REVIEW REQUIRED',
  findings:check.passed?draft.statements.map(s=>({text:s.text,fieldId:s.fieldId})):[],problems,
  nextAction:stale?'Prepare and check a new draft from the current evidence.':!check.passed?'Resolve the listed gaps and rerun quality checks before requesting approval.':approved?'Use the controlled export workflow to verify and package this approved revision.':'Ask a separate named reviewer to inspect these facts and record a decision on this exact revision.',
  revision:draft.revision,section:draft.section,release:false};
}
