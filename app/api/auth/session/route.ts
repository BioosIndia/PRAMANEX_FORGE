import {headers} from 'next/headers';
import {getChatGPTUser} from '@/app/chatgpt-auth';import {authDB,authFailure,googleConfigured} from '@/lib/forge-auth';
export async function GET(){try{
 const user=await getChatGPTUser(),h=await headers(),legacyId=h.get('oai-authenticated-user-id'),legacyEmail=h.get('oai-authenticated-user-email');
 let legacyLinkAvailable=false;
 if(legacyId&&legacyEmail&&user&&user.authProvider!=='legacy'&&user.userId!==legacyId){
  const saved=await authDB().prepare('SELECT (EXISTS(SELECT 1 FROM workspaces WHERE owner_id=?) OR EXISTS(SELECT 1 FROM memberships WHERE user_id=? AND active=1) OR EXISTS(SELECT 1 FROM object_grants WHERE grantee_id=?) OR EXISTS(SELECT 1 FROM signature_factors WHERE user_id=?)) AS present').bind(legacyId,legacyId,legacyId,legacyId).first<{present:number}>();
  legacyLinkAvailable=!!saved?.present;
 }
 return Response.json({legacyLinkAvailable,legacyWorkspaceEmail:legacyLinkAvailable?legacyEmail:null,user:user?{userId:user.userId,displayName:user.displayName,email:user.email,emailVerified:user.emailVerified??true,authProvider:user.authProvider??'legacy'}:null,googleAvailable:googleConfigured(),emailVerificationAvailable:false,passwordRecoveryAvailable:false},{headers:{'cache-control':'no-store'}});
 }catch(e){return authFailure(e);}}
