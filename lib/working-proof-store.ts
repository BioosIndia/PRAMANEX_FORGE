import {database} from './repository';
import {ForgeError} from './core.mjs';
import {WORKING_PROOF_ID,WORKING_PROOF_VERSION,buildWorkingProof,workingProofHash} from './working-proof.mjs';
type SavedProof={id:string;fixture_version:string;payload:string;hash:string;created_at:string};

/** The reader has a fixed public-safe fixture ID; it cannot enumerate or access customer workspaces. */
export async function readSavedWorkingProof(){
 const db=database();
 const read=()=>db.prepare('SELECT id,fixture_version,payload,hash,created_at FROM forge_work_samples WHERE id=?').bind(WORKING_PROOF_ID).first<SavedProof>();
 let row=await read();
 if(!row){
  const payload=JSON.stringify(await buildWorkingProof()),digest=await workingProofHash(payload),at=new Date().toISOString();
  await db.prepare('INSERT INTO forge_work_samples(id,fixture_version,payload,hash,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(WORKING_PROOF_ID,WORKING_PROOF_VERSION,payload,digest,at).run();
  row=await read();
 }
 if(!row||row.fixture_version!==WORKING_PROOF_VERSION||await workingProofHash(row.payload)!==row.hash)throw new ForgeError('WORK_SAMPLE_UNAVAILABLE','The saved work sample could not be verified. No assessment is presented as saved.',503);
 const payload=JSON.parse(row.payload);
 if(payload.id!==WORKING_PROOF_ID||payload.synthetic!==true||payload.readOnly!==true||payload.release!==false)throw new ForgeError('WORK_SAMPLE_UNAVAILABLE','The saved work sample failed its boundary checks.',503);
 return {...payload,saved:true,savedAt:row.created_at,recordHash:row.hash};
}
