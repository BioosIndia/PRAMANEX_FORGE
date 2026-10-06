import {readSavedWorkingProof} from '../../../lib/working-proof-store';
export const dynamic='force-dynamic';
export async function GET(){try{return Response.json(await readSavedWorkingProof(),{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}catch{console.error('forge_work_sample_unavailable');return Response.json({error:'The saved CMC work sample is unavailable. Refresh to retry; no unsaved fallback is shown.'},{status:503,headers:{'Cache-Control':'no-store'}});}}
