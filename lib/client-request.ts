/** Browser requests report safe errors and never retry a mutation automatically. */
export async function requestJSON<T>(url:string,init:RequestInit={},timeoutMs=15000,failureMessage='The service is unavailable. Please retry.'):Promise<T>{
 const signal=init.signal?AbortSignal.any([init.signal,AbortSignal.timeout(timeoutMs)]):AbortSignal.timeout(timeoutMs);
 try{
  const response=await fetch(url,{...init,signal});
  let data:any;
  try{data=await response.json();}catch{throw new Error(failureMessage);}
  if(!response.ok)throw new Error(typeof data?.error==='string'?data.error:failureMessage);
  return data as T;
 }catch(error){
  if(error instanceof Error&&error.name==='TimeoutError')throw new Error(init.method&&init.method!=='GET'?'The request timed out. It may still finish on the server; refresh saved status before trying again.':'The status request timed out. Refresh to try again.');
  throw error;
 }
}
