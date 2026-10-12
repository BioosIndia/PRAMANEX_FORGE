import {env} from 'cloudflare:workers';
import {qualityAdapter} from '@/lib/quality-adapter';
import {authorizeQuality,runQualityMonitoring,readQualityMonitoring} from '@/lib/quality-monitor';
export const dynamic='force-dynamic';
export async function POST(req:Request){return runQualityMonitoring(env,req,qualityAdapter);}
export async function GET(req:Request){try{await authorizeQuality(req,env);return readQualityMonitoring(env,qualityAdapter);}catch{return Response.json({error:'Service authorization required.'},{status:403,headers:{'Cache-Control':'no-store'}});}}
