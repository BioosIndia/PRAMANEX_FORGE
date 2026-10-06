import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {boundedBody} from '../../../lib/http.mjs';
import {ForgeError,requireValue,hash} from '../../../lib/core.mjs';
import {rateLimit} from '../../../lib/repository';
import {runtimeOverview,enqueueRuntime,controlDurableRuntime,tickDurableRuntime} from '../../../lib/runtime-repository';
export const dynamic='force-dynamic';
const json=(data:any,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
function failure(e:any){return json({error:e instanceof ForgeError?e.message:'Runtime operation failed safely.',code:e.code||'RUNTIME_UNAVAILABLE'},e.status||503);}
async function user(){const u=await getChatGPTUser();if(!u)throw new ForgeError('UNAUTHENTICATED','Sign in to use persistent workflows.',401);return u;}
export async function GET(request:Request){try{const u=await user(),workspaceId=requireValue(new URL(request.url).searchParams.get('workspace'),'Workspace ID',100);return json(await runtimeOverview(workspaceId,u.userId));}catch(e){return failure(e);}}
export async function POST(request:Request){try{
 if(!request.headers.get('content-type')?.includes('application/json'))throw new ForgeError('UNSUPPORTED_MEDIA','Use JSON.',415);let input:any;try{input=JSON.parse(new TextDecoder().decode(await boundedBody(request,20_000)));}catch(e){if(e instanceof ForgeError)throw e;throw new ForgeError('INVALID_JSON','Invalid runtime request.');}
 if(input.action==='workerTick'){const configured=(env as any).FORGE_WORKER_TOKEN,provided=request.headers.get('authorization')?.replace(/^Bearer /,'');if(!configured)throw new ForgeError('WORKER_NOT_CONFIGURED','Independent worker authentication is not configured.',503);if(!provided||await hash(provided)!==await hash(configured))throw new ForgeError('FORBIDDEN','Invalid worker authentication.',403);return json(await tickDurableRuntime({limit:Math.min(8,Number(input.limit)||4)}));}
 if(request.headers.get('origin')!==new URL(request.url).origin)throw new ForgeError('CROSS_ORIGIN_BLOCKED','Same-origin writes required.',403);const u=await user();await rateLimit(u.userId);
 if(input.action==='enqueue'){const workspaceId=requireValue(input.workspaceId,'Workspace ID',100),key=requireValue(request.headers.get('idempotency-key'),'Idempotency key',100);return json(await enqueueRuntime(workspaceId,u.userId,key,input),201);}
 if(input.action==='control')return json(await controlDurableRuntime(requireValue(input.workflowId,'Workflow ID',100),u.userId,input));
 if(input.action==='tick')return json(await tickDurableRuntime({workspaceId:requireValue(input.workspaceId,'Workspace ID',100),userId:u.userId,limit:input.limit}));
 throw new ForgeError('UNKNOWN_ACTION','Select enqueue, control or tick.');
 }catch(e){return failure(e);}}
