/** Bounded wording checks. Scientific interpretation still requires human review. */
export function statementIssues(text,field){
 const issues=[];
 if(typeof text!=='string')return ['Statement text is missing.'];
 const escape=v=>String(v).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
 const contains=v=>typeof v==='string'&&v.trim()&&new RegExp('(?<![\\w-])'+escape(v)+'(?![\\w-])','i').test(text);
 if(![field.parameter,field.batch,field.method].every(contains))issues.push('Preserve the cited parameter, batch and method explicitly; do not leave their context implicit.');
 const withoutIds=text.replaceAll(field.method||'','').replaceAll(field.batch||'','');
 const quantities=Array.from(withoutIds.matchAll(/([+-]?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)\s*(mg\/ml|mmol\/l|mg\/g|g\/kg|percent|ppm|mg|ml|kg|%|g|ph)(?![a-z])/gi));
 const unit=String(field.unit).toLowerCase();
 if(!quantities.some(m=>m[1]===String(field.value)&&m[2].toLowerCase().replace('percent','%')===unit))issues.push('Write the cited number directly beside its correct unit.');
 if(quantities.some(m=>m[1]!==String(field.value)||m[2].toLowerCase().replace('percent','%')!==unit))issues.push('The statement contains an unsupported quantity or unit.');
 return issues;
}
