export async function readJSON(request:Pick<Request,'headers'|'body'>,maxBytes=80000):Promise<Record<string,any>> {
 if(Number(request.headers.get('content-length')||0)>maxBytes)throw new Error('BODY_TOO_LARGE');
 const reader=request.body?.getReader();if(!reader)throw new SyntaxError('Missing request body');
 let size=0,body='';const decoder=new TextDecoder();
 try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>maxBytes)throw new Error('BODY_TOO_LARGE');body+=decoder.decode(value,{stream:true});}body+=decoder.decode();}
 catch(e){await reader.cancel().catch(()=>{});throw e;}
 const value=JSON.parse(body);if(!value||typeof value!=='object'||Array.isArray(value))throw new SyntaxError('An object request is required');return value;
}
export function pageRequest(url:URL){
 const raw=url.searchParams.get('limit');const limit=raw===null?50:Number(raw);
 if(!Number.isInteger(limit)||limit<1||limit>100)throw new Error('PAGE_LIMIT');
 const cursor=url.searchParams.get('cursor');if(!cursor)return {limit,cursor:null};
 try {if(cursor.length>600)throw new Error();const p=JSON.parse(atob(cursor));if(!Array.isArray(p)||p.length!==2||typeof p[0]!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(p[0])||!Number.isFinite(Date.parse(p[0]))||typeof p[1]!=='string'||p[1].length>160)throw new Error();return {limit,cursor:p as [string,string]};}catch{throw new Error('PAGE_CURSOR');}
}
export function pageCursor(row:{created_at:string;id:string}){return btoa(JSON.stringify([row.created_at,row.id]));}
