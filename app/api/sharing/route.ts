import {getChatGPTUser} from '../../chatgpt-auth';
import {ForgeError,requireValue} from '../../../lib/core.mjs';
import {boundedBody} from '../../../lib/http.mjs';
import {rateLimit} from '../../../lib/repository';
import {sharingIndex,sharingWrite,sharedWorkspaces} from '../../../lib/sharing-repository';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin'};
const json=(data:unknown,status=200)=>Response.json(data,{status,headers});
function error(e:any){if(e instanceof ForgeError)return json({error:e.message,code:e.code},e.status);console.error('sharing_api_failure',e instanceof Error?e.name:'unknown');return json({error:'Sharing operation unavailable. Retry safely.',code:'SHARING_UNAVAILABLE'},503);}
async function user(){const u=await getChatGPTUser();if(!u)throw new ForgeError('UNAUTHENTICATED','Sign in to access an explicit object grant.',401);return u;}
export async function GET(request:Request){try{const u=await user(),id=new URL(request.url).searchParams.get('workspace');if(!id)return json({userId:u.userId,workspaces:await sharedWorkspaces(u.userId)});return json(await sharingIndex(requireValue(id,'Workspace ID',100),u.userId));}catch(e){return error(e);}}
export async function POST(request:Request){try{if(request.headers.get('origin')!==new URL(request.url).origin)throw new ForgeError('CROSS_ORIGIN_BLOCKED','Cross-origin sharing writes are blocked.',403);if(!request.headers.get('content-type')?.includes('application/json'))throw new ForgeError('UNSUPPORTED_MEDIA','Use JSON for sharing operations.',415);const u=await user();await rateLimit(u.userId);const text=new TextDecoder().decode(await boundedBody(request,20_000));let input:any;try{input=JSON.parse(text);}catch{throw new ForgeError('INVALID_JSON','Invalid JSON request.');}const workspaceId=requireValue(input.workspaceId,'Workspace ID',100),key=requireValue(request.headers.get('idempotency-key'),'Operation key',100);return json(await sharingWrite(workspaceId,input,u,key));}catch(e){return error(e);}}
