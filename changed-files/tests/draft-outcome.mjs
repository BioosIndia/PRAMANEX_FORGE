import test from 'node:test';
import assert from 'node:assert/strict';
import {statementIssues} from '../lib/statement-controls.mjs';
import {draftOutcome} from '../lib/draft-outcome.mjs';
import {initialState,qcDraft} from '../lib/core.mjs';
const f={id:'F1',parameter:'assay',batch:'SYN-A',method:'HPLC-SYN-01',value:98.6,unit:'%',rawValue:'98.6',rawUnit:'%',low:95,high:105,status:'APPROVED',sourceId:'SRC1',sourceHash:'hash',span:{raw:'assay 98.6%'}};
const text='Recorded assay for batch SYN-A is 98.6% using HPLC-SYN-01.';
function fixture(){const s=initialState();s.policy.required=['assay'];s.fields=[structuredClone(f)];s.sources=[{id:'SRC1',status:'PARSED',hash:'hash'}];const d={id:'D1',revision:1,status:'CANDIDATE',section:'3.2.P',authorPrincipal:'author',statements:[{fieldId:f.id,text,value:f.value,unit:f.unit}]};return {s,d};}
test('Exact supported context can progress to human review, not approval',()=>{const {s,d}=fixture();const r=draftOutcome(s,d);assert.equal(r.status,'HUMAN REVIEW REQUIRED');assert.equal(r.findings.length,1);assert.equal(r.release,false);});
test('Changed batch is blocked although numerical value and citation are unchanged',()=>assert.ok(statementIssues(text.replace('SYN-A','SYN-B'),f).length));
test('Missing method is blocked',()=>assert.ok(statementIssues(text.replace(' using HPLC-SYN-01',''),f).length));
test('Different parameter is blocked',()=>assert.ok(statementIssues(text.replace('assay','water'),f).length));
test('Correct unit elsewhere cannot conceal wrong unit beside the result',()=>assert.ok(statementIssues(text.replace('98.6%','98.6 g')+' Report % results.',f).length));
test('Extra quantity with same numeric value but different unit is blocked',()=>assert.ok(statementIssues(text+' Also 98.6 mg.',f).length));
test('Scientific notation remains paired to its unit',()=>assert.deepEqual(statementIssues(text.replace('98.6%','1e-7%'),{...f,value:1e-7}),[]));
test('Wrong quantity makes readable brief HOLD and excludes supported findings',()=>{const {s,d}=fixture();d.statements[0].text=text.replace('98.6%','99.1%');const r=draftOutcome(s,d);assert.equal(r.status,'HOLD');assert.equal(r.findings.length,0);});
test('Changed source hash blocks old current-looking draft',()=>{const {s,d}=fixture();s.sources[0].hash='changed';assert.equal(draftOutcome(s,d).status,'HOLD');assert.equal(qcDraft(s,d).passed,false);});
test('Approval needs a current decision for the exact revision',()=>{const {s,d}=fixture();d.status='APPROVED';s.decisions=[{targetId:d.id,revision:2,status:'CURRENT',action:'APPROVE'}];assert.equal(draftOutcome(s,d).status,'HUMAN REVIEW REQUIRED');s.decisions[0].revision=1;assert.equal(draftOutcome(s,d).status,'APPROVED REVISION');});
test('Reading brief cannot mutate conflict state or saved QC',()=>{const {s,d}=fixture(),before=JSON.stringify({s,d});draftOutcome(s,d);assert.equal(JSON.stringify({s,d}),before);});

test('A newly detected conflict blocks QC even when facts were marked approved',()=>{const {s,d}=fixture();s.fields[0].rawValue='98.6';s.fields[0].rawUnit='%';s.fields[0].low=95;s.fields[0].high=105;s.fields.push({...s.fields[0],id:'F2',value:99.1});const r=draftOutcome(s,d);assert.equal(r.status,'HOLD');assert.equal(r.findings.length,0);});
