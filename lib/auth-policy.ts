export const AUTH_COOKIE='__Host-forge_session';
export const LOGGED_OUT_COOKIE='__Host-forge_signed_out';
export const OAUTH_COOKIE='__Host-forge_oauth';
export const SESSION_SECONDS=8*60*60;
export function safeReturnPath(value:unknown):string{if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||value.includes('\\')||/[\r\n]/.test(value))return '/app';try{const u=new URL(value,'https://forge.local');if(u.origin!=='https://forge.local'||/^\/(api\/auth|login|logout|signin-with-chatgpt|signout-with-chatgpt|callback)(\/|$)/.test(u.pathname))return '/app';return u.pathname+u.search+u.hash;}catch{return '/app';}}
export function normalizedEmail(value:unknown):string{if(typeof value!=='string')throw new Error('Enter a valid email address.');const email=value.trim().toLowerCase();if(email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email address.');return email;}
export function validPassword(value:unknown):string{if(typeof value!=='string'||value.length<15||new TextEncoder().encode(value).length>72)throw new Error('Use a password of at least 15 characters and at most 72 UTF-8 bytes.');return value;}
export function cookieValue(header:string|null,key:string):string|null{const value=header?.split(';').map(x=>x.trim()).find(x=>x.startsWith(key+'='))?.slice(key.length+1);return value&&/^[A-Za-z0-9_-]{1,256}$/.test(value)?value:null;}
export function cookie(key:string,value:string,seconds:number):string{return `${key}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${seconds}`;}
export function requireSameOrigin(request:Request){if(request.headers.get('origin')!==new URL(request.url).origin||request.headers.get('sec-fetch-site')==='cross-site')throw new Error('Same-origin request required.');}
export async function tokenDigest(token:string):Promise<string>{return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('');}
export function randomToken():string{return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replaceAll('+','-').replaceAll('/','_').replaceAll('=','');}
