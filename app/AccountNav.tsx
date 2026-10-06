'use client';
import {useEffect,useState} from 'react';
type User={displayName:string;authProvider:string};
export default function AccountNav({open}:{open:(url:string,label:string)=>void}){
 const [user,setUser]=useState<User|null>(null),[ready,setReady]=useState(false);
 useEffect(()=>{let active=true;fetch('/api/auth/session',{cache:'no-store',signal:AbortSignal.timeout(8000)}).then(async r=>{if(!r.ok)throw Error();return r.json() as Promise<{user:User|null}>;}).then(d=>{if(active){setUser(d.user);setReady(true);}}).catch(()=>{if(active)setReady(true);});return()=>{active=false;};},[]);
 return <div className="forge-account-nav">{user?<><button className="bio-outline" onClick={()=>open('/app','your saved workspace')}>Workspace ↗</button><button className="account-link" onClick={()=>open('/logout','sign out')}>Sign out</button>{user.authProvider==='legacy'&&<button className="account-link" onClick={()=>open('/login?mode=signup','create a FORGE account')}>Create account</button>}</>:<><button className="account-link" onClick={()=>open('/login','FORGE sign in')}>Sign in</button><button className="bio-pill small" onClick={()=>open('/login?mode=signup','create a FORGE account')}>Create account ↗</button></>}{!ready&&<span className="account-check" role="status">Checking access…</span>}</div>;
}
