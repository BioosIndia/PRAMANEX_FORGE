import {getChatGPTUser} from '../../chatgpt-auth';
import {loadWorkspace,rateLimit} from '../../../lib/repository';
import {ForgeError,requireValue} from '../../../lib/core.mjs';
import {ExportError,formatEvidence,packageEvidence,preflightPackage} from '../../../lib/format-export.mjs';
export const dynamic='force-dynamic';
const JSON_HEADERS={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};

/** Format only a server-owned historical snapshot after workspace authorization. */
export async function GET(request:Request){
  try{
    const user=await getChatGPTUser();
    if(!user)throw new ForgeError('UNAUTHENTICATED','Sign in to download controlled evidence.',401);
    const params=new URL(request.url).searchParams;
    const workspace=requireValue(params.get('workspace'),'Workspace ID',100);
    const id=requireValue(params.get('id'),'Export ID',100);
    const ws=await loadWorkspace(workspace,user.userId);
    const record=ws.state.exports.find((item:any)=>item.id===id);
    if(!record)throw new ForgeError('NOT_FOUND','Evidence snapshot unavailable.',404);
    await rateLimit(user.userId);
    const options={exportRecord:record};
    if(params.has('preflight'))return Response.json(await preflightPackage(record.manifest,options),{headers:JSON_HEADERS});
    const format=params.get('format')||'pdf';
    if(!['pdf','docx','html','zip'].includes(format))throw new ForgeError('FORMAT_UNSUPPORTED','Choose PDF, Word, HTML or the technical handoff ZIP.',422);
    const artifact=format==='zip'?await packageEvidence(record.manifest,options):await formatEvidence(record.manifest,{...options,format});
    const body=artifact.bytes.slice().buffer as ArrayBuffer;
    return new Response(body,{headers:{
      'Content-Type':artifact.mime,
      'Content-Disposition':`attachment; filename="${artifact.filename}"`,
      'Cache-Control':'private, no-store',
      'X-Content-Type-Options':'nosniff',
      'X-Forge-Export-Id':record.id,
      'X-Forge-Manifest-Hash':record.hash,
      'X-Forge-Artifact-Hash':artifact.sha256,
      'X-Forge-Release':'false',
      'Content-Security-Policy':"default-src 'none'; sandbox",
    }});
  }catch(error:any){
    const controlled=error instanceof ForgeError||error instanceof ExportError;
    return Response.json({error:controlled?error.message:'Artifact generation failed safely.',code:controlled?error.code:'EXPORT_UNAVAILABLE'},{status:controlled?error.status:503,headers:JSON_HEADERS});
  }
}
