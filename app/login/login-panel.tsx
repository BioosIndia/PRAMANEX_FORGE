'use client';
import {useEffect,useState,type FormEvent} from 'react';
import {Eye,EyeOff,ExternalLink} from 'lucide-react';
import styles from './login.module.css';
import {requestJSON} from '../../lib/client-request';
import {safeReturnPath,validPassword} from '../../lib/auth-policy';
type Session={user:{authProvider:string}|null;googleAvailable:boolean;legacyLinkAvailable:boolean;legacyWorkspaceEmail:string|null};
type AuthResponse={error?:string;ok?:boolean;returnTo?:string};
function clearWorkspaceSelection(){try{localStorage.removeItem('forge-workspace');}catch{/* Storage privacy settings must not block a successful login. */}}
async function readSession():Promise<Session>{return requestJSON<Session>('/api/auth/session',{cache:'no-store'},8000,'Account service is unavailable. Open sign-in in a new tab or retry.');}
export default function LoginPanel(){
 const [signup,setSignup]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[google,setGoogle]=useState(false),[ready,setReady]=useState(false),[returnTo,setReturnTo]=useState('/app');
 const [legacyEmail,setLegacyEmail]=useState(''),[authenticated,setAuthenticated]=useState(false),[consent,setConsent]=useState(false),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false),[googleInfo,setGoogleInfo]=useState(false),[embedded,setEmbedded]=useState(false),[blockedSession,setBlockedSession]=useState(false);
 useEffect(()=>{let active=true;const query=new URLSearchParams(location.search);setReturnTo(safeReturnPath(query.get('return_to')));setSignup(query.get('mode')==='signup');setEmbedded(window.self!==window.top);if(query.has('error'))setError('Google sign-in did not complete. Try again or use email.');readSession().then(data=>{if(!active)return;setGoogle(data.googleAvailable===true);setReady(true);if(data.user&&data.user.authProvider!=='legacy'){setAuthenticated(true);if(data.legacyLinkAvailable)setLegacyEmail(data.legacyWorkspaceEmail||'');}}).catch(e=>{if(active){setReady(true);setError((e as Error).message);}});return()=>{active=false;};},[]);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();if(busy)return;setBusy(true);setError('');setBlockedSession(false);const data=new FormData(event.currentTarget);
  try{
   if(signup)validPassword(password);
   const result=await requestJSON<AuthResponse>('/api/auth/'+(signup?'signup':'login'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:data.get('email'),password,name:data.get('name'),returnTo})},20000,'Account request could not complete. Open sign-in in a new tab or retry.');clearWorkspaceSelection();
   const session=await readSession();if(!session.user||session.user.authProvider==='legacy'){setBlockedSession(true);throw new Error('Your browser did not retain the FORGE session. Open sign-in in a new tab and try again.');}
   setPassword('');
   if(session.legacyLinkAvailable){setLegacyEmail(session.legacyWorkspaceEmail||'');setAuthenticated(true);setBusy(false);setReturnTo(safeReturnPath(result.returnTo));}else window.location.assign(safeReturnPath(result.returnTo));
  }catch(e){setError(e instanceof Error&&e.name==='TimeoutError'?'Account request timed out. Your input is preserved; try signing in again.':(e as Error).message);setBusy(false);}
 }
 async function linkLegacy(){if(!consent||busy)return;setBusy(true);setError('');try{const result=await requestJSON<AuthResponse>('/api/auth/link-legacy',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({confirm:'LINK_EXISTING_WORKSPACE'})},20000,'Workspace link could not complete. Refresh account status before retrying.');clearWorkspaceSelection();window.location.assign(safeReturnPath(result.returnTo));}catch(e){setError((e as Error).message);setBusy(false);}}
 function changeMode(next:boolean){if(busy)return;setSignup(next);setError('');setPassword('');setShowPassword(false);}
 return <main className={styles.shell}>
  <a className={styles.brand} href='/' aria-label='FORGE home'><img src='/favicon.svg' width='36' height='36' alt=''/><b>FORGE</b><span>CMC EVIDENCE OS</span></a>
  <div className={styles.layout}><section className={styles.intro}><span className={styles.eyebrow}>Your evidence. Your workspace.</span><h1>CMC evidence,<br/><em>under your control.</em></h1><p>A controlled CMC workspace, with exact source facts and independent human review.</p><div className={styles.proof}><span>Preserved originals</span><span>Named review</span><span>Frozen evidence</span></div><a href='/'>← Back to FORGE</a></section>
   <section className={styles.panel} aria-labelledby='auth-title'>
    {embedded&&<a className={styles.fullWindow} href={'https://forge.r4dewangan.chatgpt.site/login'+'?'+new URLSearchParams({return_to:returnTo,...(signup?{mode:'signup'}:{})}).toString()} target='_blank' rel='noopener noreferrer'><ExternalLink size={16}/>Open secure sign-in in a new tab</a>}
    {authenticated?<>
     <h2 id='auth-title'>Your FORGE account is signed in</h2>{legacyEmail?<><p>Your existing trusted session also has saved workspace access under <strong>{legacyEmail}</strong>. Keep its saved evidence when moving to FORGE sign-in.</p><label className={styles.consent}><input type='checkbox' checked={consent} onChange={e=>setConsent(e.target.checked)}/>I own both sessions and want this account permanently linked to that existing workspace.</label><small className={styles.note}>Linking is permitted only while your new workspace is empty. Both identities are checked; an email match alone never grants access.</small><button className={styles.submit} onClick={linkLegacy} disabled={!consent||busy}>{busy?'Verifying both identities…':'Link existing workspace'}<span>↗</span></button><p><a href='/app'>Continue with my separate new workspace</a></p></>:<p><a href='/app'>Open your saved workspace ↗</a></p>}{error&&<p className={styles.error} role='alert'>{error}</p>}<p><a href='/logout'>Sign out</a></p>
    </>:<>
     <div className={styles.tabs}><button type='button' aria-pressed={!signup} disabled={busy} onClick={()=>changeMode(false)}>Sign in</button><button type='button' aria-pressed={signup} disabled={busy} onClick={()=>changeMode(true)}>Create account</button></div>
     <h2 id='auth-title'>{signup?'Create your FORGE account':'Welcome back'}</h2><p>Use your email address and password.</p>
     {google?<a className={styles.google} href={'/api/auth/google/start?return_to='+encodeURIComponent(returnTo)} target='_top'><span aria-hidden='true'>G</span>Continue with Google</a>:ready?<><button type='button' className={styles.googleSetup} aria-expanded={googleInfo} onClick={()=>setGoogleInfo(v=>!v)}><span aria-hidden='true'>G</span>Google sign-in · not connected<span aria-hidden='true'>ⓘ</span></button>{googleInfo&&<p role='status' className={styles.note}>Google sign-in needs the owner's Google connection setup. Email sign-in works below.</p>}</>:<p className={styles.note}>Checking account options…</p>}
     <div className={styles.divider}><span>continue with email</span></div>
     <form onSubmit={submit} aria-busy={busy}>
      {signup&&<label>Full name<input name='name' disabled={busy} autoComplete='name' minLength={2} maxLength={100} required/></label>}
      <label>Email address<input name='email' disabled={busy} type='email' autoComplete='email' maxLength={254} required placeholder='you@organisation.com'/></label>
      <label htmlFor='forge-password'>Password</label><div className={styles.passwordField}><input id='forge-password' name='password' disabled={busy} type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete={signup?'new-password':'current-password'} minLength={signup?15:undefined} maxLength={72} required aria-describedby='password-help' spellCheck={false} autoCapitalize='none'/><button type='button' onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}<span>{showPassword?'Hide':'Show'}</span></button></div>
      <small id='password-help'>{signup?'Create a password with at least 15 characters. Spaces are allowed. Maximum 72 UTF-8 bytes.':'Enter the password you created for FORGE.'}{signup&&password.length>0&&<span className={styles.passwordHint}>{password.length<15?`${password.length}/15 characters · add ${15-password.length} more`:'Minimum length reached'}</span>}</small>
      {error&&<p role='alert' className={styles.error}>{error}</p>}{blockedSession&&<a className={styles.fullWindow} href={'https://forge.r4dewangan.chatgpt.site/login'+'?'+new URLSearchParams({return_to:returnTo,...(signup?{mode:'signup'}:{})}).toString()} target='_blank' rel='noopener noreferrer'>Open FORGE sign-in in a new tab ↗</a>}
      <button className={styles.submit} disabled={busy}>{busy?'Signing you in…':signup?'Create account & open workspace':'Sign in & open workspace'}<span aria-hidden='true'>↗</span></button>
     </form>
     <p className={styles.boundary}>New email accounts use a private workspace. Shared workspace access requires a verified identity. Email verification and password recovery are not yet available.</p>
    </>}
   </section>
  </div>
 </main>;
}
