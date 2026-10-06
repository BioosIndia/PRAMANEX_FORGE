import {readJSON} from '@/lib/request-bounds';
import {authDB,AuthError,authFailure,readOwnSession} from '@/lib/forge-auth';
import {requireSameOrigin,normalizedEmail} from '@/lib/auth-policy';
const ownerTables=[['workspaces','owner_id'],['memberships','user_id'],['signature_factors','user_id'],['shared_notes','author_id'],['object_grants','grantee_id'],['object_grants','granted_by']];
export async function POST(request:Request){try{
 requireSameOrigin(request);const body=await readJSON(request,1024);
 if(body.confirm!=='LINK_EXISTING_WORKSPACE')throw new AuthError('Explicit workspace-link confirmation is required.');
 const own=await readOwnSession(request.headers.get('cookie'));if(!own)throw new AuthError('Sign in to your FORGE account first.',401);
 const legacyId=request.headers.get('oai-authenticated-user-id'),rawEmail=request.headers.get('oai-authenticated-user-email');
 if(!legacyId||!rawEmail||legacyId.startsWith('forge:'))throw new AuthError('An existing trusted platform session is required to link the workspace.',403);
 let email:string;try{email=normalizedEmail(rawEmail);}catch{throw new AuthError('The existing trusted identity has no usable email.',403);}
 const db=authDB(),existing=await db.prepare('SELECT legacy_user_id FROM forge_auth_legacy_links WHERE account_id=?').bind(own.accountId).first<{legacy_user_id:string}>();
 if(existing){if(existing.legacy_user_id!==legacyId)throw new AuthError('This account is linked to a different identity.',409);return Response.json({ok:true,alreadyLinked:true,returnTo:'/app'},{headers:{'cache-control':'no-store'}});}
 const guard=ownerTables.map(([table,column])=>`NOT EXISTS(SELECT 1 FROM ${table} WHERE ${column}=?)`).join(' AND ');
 const result=await db.prepare(`INSERT INTO forge_auth_legacy_links(account_id,legacy_user_id,legacy_email,created_at) SELECT ?,?,?,? WHERE ${guard}`).bind(own.accountId,legacyId,email,new Date().toISOString(),...ownerTables.map(()=>own.accountId)).run();
 if(!result.meta.changes)throw new AuthError('Your new account already has workspace, sharing or signing records. Linking is blocked to preserve both identities; use an explicit migration.',409);
 return Response.json({ok:true,returnTo:'/app'},{headers:{'cache-control':'no-store'}});
 }catch(e){if(e instanceof Error&&/UNIQUE constraint/i.test(e.message))return authFailure(new AuthError('The existing identity is already linked to another account.',409));return authFailure(e);}}
