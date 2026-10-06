import {closeSession,authFailure} from '@/lib/forge-auth';import {requireSameOrigin} from '@/lib/auth-policy';
export async function POST(request:Request){try{requireSameOrigin(request);return new Response(JSON.stringify({ok:true}),{headers:await closeSession(request.headers.get('cookie'))});}catch(e){return authFailure(e);}}
