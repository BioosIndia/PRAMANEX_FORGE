import test from 'node:test';
import assert from 'node:assert/strict';
import {requestJSON} from '../lib/client-request.ts';
async function withFetch(mock,check){const original=globalThis.fetch;globalThis.fetch=mock;try{await check();}finally{globalThis.fetch=original;}}
test('client request reads saved JSON',()=>withFetch(async()=>Response.json({saved:true}),async()=>assert.deepEqual(await requestJSON('/api/test'),{saved:true})));
test('client request exposes a server gate error',()=>withFetch(async()=>Response.json({error:'HOLD: evidence missing'},{status:409}),async()=>{await assert.rejects(requestJSON('/api/test'),/HOLD: evidence missing/);}));
test('intermediary HTML produces a safe message instead of a parse error or raw page',()=>withFetch(async()=>new Response('<html>private proxy details</html>',{status:403}),async()=>{await assert.rejects(requestJSON('/api/test',{},100,'Sign-in unavailable. Open a new tab.'),/^Error: Sign-in unavailable\. Open a new tab\.$/);}));
test('timed-out mutation is never repeated and warns that the result can still save',async()=>{let calls=0;await withFetch(async()=>{calls++;throw new DOMException('timeout','TimeoutError');},async()=>{await assert.rejects(requestJSON('/api/test',{method:'POST'}),/may still finish.*refresh saved status/);});assert.equal(calls,1);});
test('read timeout requests a refresh without claiming a successful check',()=>withFetch(async()=>{throw new DOMException('timeout','TimeoutError');},async()=>{await assert.rejects(requestJSON('/api/test'),/status request timed out/);}));
test('caller cancellation remains cancellation',()=>withFetch(async()=>{throw new DOMException('cancelled','AbortError');},async()=>{await assert.rejects(requestJSON('/api/test',{signal:AbortSignal.abort()}),{name:'AbortError'});}));
