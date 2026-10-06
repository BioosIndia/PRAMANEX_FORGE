import {providerConfig,providerConfigured} from '../../../lib/provider-config.mjs';
import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../../chatgpt-auth';
import {loadWorkspace,database} from '../../../lib/repository';
import {ForgeError,requireValue} from '../../../lib/core.mjs';
import {probeReadiness} from '../../../lib/readiness.mjs';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
export async function GET(request:Request){try{const u=await getChatGPTUser();if(!u)throw new ForgeError('UNAUTHENTICATED','Sign in before inspecting readiness.',401);const url=new URL(request.url),id=requireValue(url.searchParams.get('workspace'),'Workspace',100),profile=url.searchParams.get('profile')||'DETERMINISTIC';if(!['DETERMINISTIC','AUTHORING','VISION'].includes(profile))throw new ForgeError('INVALID_PROFILE','Choose deterministic, authoring or vision readiness.');const ws=await loadWorkspace(id,u.userId);const result=await probeReadiness({db:database(),bucket:env.BUCKET,state:ws.state,workspaceId:id,profile,config:{...providerConfig(env),signingKey:(env as any).FORGE_SIGNING_KEY}});return Response.json(result,{status:result.ready?200:503,headers});}catch(e:any){if(e instanceof ForgeError)return Response.json({error:e.message,code:e.code},{status:e.status,headers});console.error('forge_readiness_failed',e?.name||'unknown');return Response.json({error:'Readiness inspection failed. The service is on HOLD.',code:'READINESS_UNAVAILABLE'},{status:503,headers});}}
