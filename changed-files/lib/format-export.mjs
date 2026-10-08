import {PDFDocument, rgb} from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import {exportFontBytes} from './export-font.mjs';

/** Pure bounded artifact generation from a frozen, server-authorized evidence manifest. */
const encoder = new TextEncoder();
const MAX_BYTES = 1_000_000, MAX_FACTS = 500, MAX_PAGES = 120;
const BOUNDARY = 'Technical evidence handoff only. release=false. This package is not regulator acceptance, production eCTD conformance, a qualified dossier or a batch-release decision.';
const XML_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
export class ExportError extends Error { constructor(code, message, status=422) { super(message);this.code=code;this.status=status; } }
const fail = (code, message, status) => {throw new ExportError(code,message,status);};
const str = value => value === null || value === undefined ? 'Not recorded' : String(value);
const x = value => str(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const escapeHTML = x;
async function sha(bytes) { return [...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof bytes==='string'?encoder.encode(bytes):bytes))].map(n=>n.toString(16).padStart(2,'0')).join(''); }
export function safeExportFilename(value, extension='') {
  if(typeof value!=='string' || !value || value.length>140 || /[/\\\u0000-\u001f\u007f]|\.\.|^[.]/.test(value) || !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(value)) fail('UNSAFE_EXPORT_FILENAME','Use a short, plain ASCII artifact filename without paths.');
  if(extension && !value.endsWith(`.${extension}`)) fail('EXPORT_EXTENSION_MISMATCH','The artifact filename must match its actual format.');
  return value;
}
function validateText(value) {
  for(const ch of value) { const c=ch.codePointAt(0); if((c<32&&!['\t','\n','\r'].includes(ch))||(c>=0xd800&&c<=0xdfff)||c===0xfffe||c===0xffff) fail('UNSUPPORTED_CONTROL_CHARACTER',`Artifact text contains an unsupported XML control character U+${c.toString(16).toUpperCase()}.`); }
}
function boundedSnapshot(input) {
  let text; try {text=JSON.stringify(input);} catch {fail('INVALID_MANIFEST','A JSON-compatible frozen manifest is required.');}
  if(!text||encoder.encode(text).length>MAX_BYTES) fail('EXPORT_LIMIT','Frozen manifest exceeds the one megabyte export limit.',413);
  const m=JSON.parse(text);
  if(!m?.draft||!Array.isArray(m.fields)||!Array.isArray(m.sources)||!Array.isArray(m.draft.statements)||m.fields.length>MAX_FACTS||m.sources.length>MAX_FACTS||m.draft.statements.length>MAX_FACTS) fail('INVALID_MANIFEST','A bounded FORGE draft, evidence and source manifest is required.');
  const visit=(v,depth=0)=>{if(depth>30)fail('EXPORT_LIMIT','Manifest nesting exceeds the technical export limit.');if(typeof v==='string')validateText(v);else if(Array.isArray(v))v.forEach(child=>visit(child,depth+1));else if(v&&typeof v==='object')Object.values(v).forEach(child=>visit(child,depth+1));};visit(m);
  return {manifest:m,json:text};
}
function location(span={}) {
  const items=[];
  if(span.page!==null&&span.page!==undefined)items.push(`page ${span.page}`);
  if(span.line!==null&&span.line!==undefined)items.push(`line ${span.line}`);
  if(span.path)items.push(`path ${span.path}`);
  if(span.table)items.push(`table ${span.table}`);
  if(span.row!==null&&span.row!==undefined)items.push(`row ${span.row}`);
  if(span.column)items.push(`column ${span.column}`);
  if(span.start!==null&&span.start!==undefined)items.push(`offset ${span.start} to ${span.end} (${span.offsetKind||'recorded offsets'})`);
  if(span.bbox)items.push(`region ${JSON.stringify(span.bbox)}`);
  return items.join('; ')||'Location not recorded';
}
function citation(f) {return `${f.sourceId} | source version ${f.sourceVersion} | ${location(f.span)}`;}
function sourceRows(m) {return m.sources.map(s=>[str(s.id),str(s.name),str(s.version),str(s.hash),str(s.type),str(s.permission),str(s.purpose),str(s.dataLabel)]);}
function factRows(m) {return m.fields.map(f=>[str(f.id),str(f.parameter),str(f.batch),`${str(f.rawValue)} ${str(f.rawUnit)}`,`${str(f.value)} ${str(f.unit)}`,str(f.method),str(f.basis),`${str(f.rawLow)} to ${str(f.rawHigh)}`,`${str(f.low)} to ${str(f.high)}`,citation(f),str(f.status)]);}
function csvCell(value) {const text=str(value);if(/^\s*[=@]/.test(text)||/^\s*[+-](?!\d)/.test(text))fail('UNSAFE_CSV_FORMULA','A CSV cell resembles an executable spreadsheet formula. Use DOCX/PDF/HTML to preserve that original text safely.');return `"${text.replaceAll('"','""')}"`;}
function csv(rows) {return encoder.encode(rows.map(row=>row.map(csvCell).join(',')).join('\r\n')+'\r\n');}
export function evidenceTables(manifest) {
  const {manifest:m}=boundedSnapshot(manifest);
  return [
    {name:'evidence-table.csv',mime:'text/csv; charset=utf-8',bytes:csv([['Fact ID','Parameter','Batch','Raw value and unit','Normalized value and unit','Method','Basis','Raw limits','Normalized limits','Source citation','Frozen status'],...factRows(m)])},
    {name:'reference-register.csv',mime:'text/csv; charset=utf-8',bytes:csv([['Source ID','Name','Version','SHA-256','Type','Permission','Purpose','Data label'],...sourceRows(m)])}
  ];
}

/** Checks technical skeleton/evidence consistency. It does not grant a regulatory or signature authority. */
export async function preflightPackage(input, options={}) {
  const {manifest:m,json}=boundedSnapshot(input), checks=[];
  const add=(id,pass,detail,kind='ERROR')=>checks.push({id,status:pass?'PASS':kind==='WARNING'?'WARNING':'FAIL',detail});
  add('MANIFEST_FORMAT',m.format==='FORGE controlled evidence package/1','A FORGE controlled evidence package version 1 manifest is required.');
  add('RELEASE_LOCK',m.release===false,'Release must remain explicitly false.');
  add('FROZEN_TIME',Boolean(m.createdAt&&Number.isFinite(Date.parse(m.createdAt))),'A valid frozen snapshot time is required.');
  add('CTD_SECTION',/^(?:2\.3(?:\.[SP](?:\.\d+)*)?|3\.2\.[SP](?:\.\d+)*)$/.test(m.draft.section||''),'The bounded draft needs an explicit 2.3, 3.2.P or 3.2.S section; this does not establish complete CTD coverage.');
  add('SECTION_STRUCTURE',Boolean(m.draft.title&&m.draft.statements.length&&m.fields.length&&m.sources.length),'Technical section includes title, supported statements, evidence table and reference register.');
  add('APPROVED_FROZEN_DRAFT',m.draft.status==='APPROVED'&&m.draft.qc?.passed===true,'The frozen draft must be approved with passing recorded technical QC.');
  add('EXACT_REVIEW_DECISION',m.decision?.action==='APPROVE'&&m.decision?.status==='CURRENT'&&m.decision?.targetId===m.draft.id&&m.decision?.revision===m.draft.revision&&Boolean(m.decision?.reviewer&&m.decision?.reason&&m.decision?.at),'Approval must bind the frozen draft ID and revision and include reviewer, reason and time.');
  add('UNIQUE_FACT_IDS',new Set(m.fields.map(f=>f.id)).size===m.fields.length&&m.fields.every(f=>typeof f.id==='string'&&f.id),'Fact identifiers must be unique and recorded.');
  add('UNIQUE_SOURCE_IDS',new Set(m.sources.map(s=>s.id)).size===m.sources.length&&m.sources.every(s=>typeof s.id==='string'&&s.id),'Source identifiers must be unique and recorded.');
  const fields=new Map(m.fields.map(f=>[f.id,f])),sources=new Map(m.sources.map(s=>[s.id,s]));
  const gap=m.fields.filter(f=>{const s=sources.get(f.sourceId);return !s||f.sourceVersion!==s.version||f.sourceHash!==s.hash||!/^[a-f0-9]{64}$/i.test(s.hash||'')||!f.span?.raw||f.status!=='APPROVED'||f.value===null||f.value===undefined||!f.unit;});
  add('SOURCE_CITATION_INTEGRITY',!gap.length,gap.length?`Unresolved frozen source citation for ${gap.map(f=>f.id).join(', ')}`:'Every approved fact has the recorded source ID/version/hash and original source span.');
  const unsupported=m.draft.statements.filter(st=>{const f=fields.get(st.fieldId);return !f||st.value!==f.value||st.unit!==f.unit||st.sourceId!==f.sourceId||st.sourceVersion!==f.sourceVersion||!st.text?.includes(String(f.value))||!st.text?.includes(f.unit);});
  add('STATEMENT_REFERENCE_INTEGRITY',!unsupported.length,unsupported.length?'One or more statements disagree with their frozen fact or source reference.':'Every statement resolves to its frozen evidence value, unit and source revision.');
  const ids=m.draft.fieldIds||[];add('CITED_FIELD_SET',ids.length>0&&ids.every(id=>fields.has(id))&&m.fields.every(f=>ids.includes(f.id)),'Draft field references and the frozen evidence set must agree.');
  add('RAW_VALUE_PRESERVED',m.fields.every(f=>typeof f.rawValue==='string'&&typeof f.rawUnit==='string'),'Original scientific value lexemes and raw units are required separately from normalized values.');
  add('SOURCE_PERMISSION',m.sources.every(s=>s.permission&&s.purpose),'Each cited source retains recorded permission and purpose.');
  const checksum=await sha(json), record=options.exportRecord;
  if(record) add('MANIFEST_CHECKSUM',record.hash===checksum,'Server-owned export checksum must match these exact frozen manifest bytes.');
  let signed=false;
  if(m.signingPayload){const p=m.signingPayload;const same=p.draftId===m.draft.id&&p.revision===m.draft.revision&&p.title===m.draft.title&&p.section===m.draft.section&&JSON.stringify(p.statements)===JSON.stringify(m.draft.statements)&&p.decisionId===m.decision?.id&&p.policyVersion===m.policyVersion&&p.workflowVersion===m.workflowVersion&&Array.isArray(p.fields)&&p.fields.length===m.fields.length&&p.fields.every(f=>{const frozen=fields.get(f.id);return frozen&&f.revision===frozen.revision&&f.value===frozen.value&&f.unit===frozen.unit&&f.sourceId===frozen.sourceId&&f.sourceVersion===frozen.sourceVersion&&f.sourceHash===frozen.sourceHash;});add('SCIENTIFIC_SIGNING_PAYLOAD',same,'Rendered content and evidence must agree with the frozen scientific signing payload.');}
  if(record?.finalized){
    const valid=Boolean(record.signature?.signer&&record.signature?.at&&['Authored','Technical Review','Regulatory Approval'].includes(record.signature?.reason)&&m.signingPayload&&record.signature.revisionHash===await sha(JSON.stringify(m.signingPayload)));
    add('SIGNATURE_RECORD_BINDING',valid,'Recorded signature must bind the exact frozen scientific signing payload; authenticity remains the parent server control.');signed=valid;
  }else add('UNSIGNED_BOUNDARY',true,'No finalized server-owned signature metadata supplied. Artifact is explicitly unsigned.');
  const artifacts=options.artifacts||[];
  if(!Array.isArray(artifacts)||artifacts.length>12)fail('EXPORT_LIMIT','At most twelve handoff artifacts may be checked.');
  const files=[];
  for(const a of artifacts){safeExportFilename(a.name);if(!(a.bytes instanceof Uint8Array)||a.bytes.length>12_000_000)fail('EXPORT_LIMIT','Invalid or oversized handoff artifact.');files.push({name:a.name,mime:a.mime||'application/octet-stream',bytes:a.bytes.length,sha256:await sha(a.bytes)});}
  add('UNIQUE_ARTIFACT_NAMES',new Set(files.map(f=>f.name)).size===files.length,'Handoff paths are flat, bounded and unique.');
  const supportedProfile=!options.profile||options.profile==='FORGE_TECHNICAL_HANDOFF/1';
  add('TECHNICAL_PROFILE',supportedProfile,supportedProfile?'FORGE technical handoff profile selected.':'The requested regional/publishing profile has not been implemented or validated.');
  add('ORIGINAL_BYTE_VERIFICATION',false,'The frozen manifest records source hashes and spans; complete original source bytes are not embedded or independently reverified by this formatter.','WARNING');
  add('ECTD_BOUNDARY',false,'Regional Module 1, sequence metadata, lifecycle operations, controlled vocabularies, PDF/A profiles and agency eCTD validation are outside this technical handoff.','WARNING');
  const xml=`<?xml version="1.0" encoding="UTF-8"?>\n<forge-package profile="FORGE_TECHNICAL_HANDOFF/1" release="false" signed="${signed}"><section code="${x(m.draft.section)}" draft-id="${x(m.draft.id)}" revision="${x(m.draft.revision)}"><title>${x(m.draft.title)}</title></section><manifest checksum-algorithm="SHA-256" checksum="${checksum}"/><artifacts>${files.map(f=>`<artifact filename="${x(f.name)}" media-type="${x(f.mime)}" bytes="${f.bytes}" checksum-algorithm="SHA-256" checksum="${f.sha256}"/>`).join('')}</artifacts><boundary>${x(BOUNDARY)}</boundary></forge-package>`;
  return {ok:!checks.some(c=>c.status==='FAIL'),profile:'FORGE_TECHNICAL_HANDOFF/1',checks,manifestChecksum:checksum,files,indexXml:xml,signatureState:signed?'SIGNATURE_BOUND_TECHNICAL_RECORD':'UNSIGNED',release:false,boundary:BOUNDARY};
}
function rowsForContent(m,report,record) {
  const content=[{kind:'title',text:'PRAMANEX FORGE'},{kind:'subtitle',text:'Controlled CMC evidence package'},{kind:'boundary',text:`${report.signatureState} | release=false`},{kind:'p',text:BOUNDARY},{kind:'h',text:`${m.draft.section} - ${m.draft.title}`},{kind:'p',text:`Product: ${str(m.product)}`},{kind:'p',text:`Draft: ${m.draft.id} | revision ${m.draft.revision} | frozen status ${m.draft.status}`},{kind:'p',text:`Frozen at: ${str(m.createdAt)} | workflow ${str(m.workflowVersion)} | policy ${str(m.policyVersion)}`},{kind:'p',text:`Manifest SHA-256: ${report.manifestChecksum}`},{kind:'h',text:'Source-backed section narrative'}];
  m.draft.statements.forEach((st,i)=>{const f=m.fields.find(f=>f.id===st.fieldId);content.push({kind:'p',text:`${i+1}. ${st.text}`},{kind:'citation',text:`Fact ${f.id}; ${citation(f)}`});});
  content.push({kind:'h',text:'Scientific evidence table'});
  for(const f of m.fields){content.push({kind:'subhead',text:`${f.parameter} | batch ${f.batch} | ${f.id}`},{kind:'table',rows:[['Raw value / unit',`${str(f.rawValue)} ${str(f.rawUnit)}`],['Normalized value / unit',`${str(f.value)} ${str(f.unit)}`],['Method / scientific basis',`${str(f.method)} / ${str(f.basis)}`],['Raw specification limits',`${str(f.rawLow)} to ${str(f.rawHigh)}`],['Normalized limits',`${str(f.low)} to ${str(f.high)}`],['Frozen status / revision',`${str(f.status)} / ${str(f.revision)}`],['Conversion rule',f.normalization?str(f.normalization.rule):'No conversion recorded'],['Source citation',citation(f)],['Source SHA-256',str(f.sourceHash)]]},{kind:'citation',text:'Original source span (line wrapping is presentational; the attached JSON retains exact characters):'},{kind:'quote',text:f.span.raw});}
  content.push({kind:'h',text:'Reference register'});
  for(const s of m.sources)content.push({kind:'subhead',text:`${s.id} | ${s.name}`},{kind:'table',rows:[['Version / frozen status',`${s.version} / ${s.status}`],['SHA-256',s.hash],['Media type / data label',`${str(s.type)} / ${str(s.dataLabel)}`],['Recorded source permission',str(s.permission)],['Purpose',str(s.purpose)]]});
  content.push({kind:'h',text:'Recorded human decision'},{kind:'table',rows:[['Decision / action',`${m.decision.id} / ${m.decision.action}`],['Reviewer',str(m.decision.reviewer)],['Reason',str(m.decision.reason)],['Time / frozen status',`${str(m.decision.at)} / ${str(m.decision.status)}`],['Bound draft revision',str(m.decision.revision)]]});
  content.push({kind:'h',text:'Signature and technical handoff boundary'});
  if(report.signatureState==='SIGNATURE_BOUND_TECHNICAL_RECORD')content.push({kind:'table',rows:[['Recorded signer',record.signature.signer],['Recorded signature reason',record.signature.reason],['Recorded signature time',record.signature.at],['Scientific revision hash',record.signature.revisionHash],['Authentication record',str(record.signature.authentication)]]},{kind:'p',text:'A signature-bound technical record is present. This formatter does not independently authenticate the signer, qualify identity procedures or establish regulatory signature validity.'});
  else content.push({kind:'p',text:'UNSIGNED: no finalized server-owned signature record has been verified for this artifact. Recorded human approval is not a dossier-finalization or batch-release decision.'});
  for(const c of report.checks)content.push({kind:'citation',text:`${c.status} | ${c.id}: ${c.detail}`});
  return content;
}

const crcTable=Uint32Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
export function artifactCRC32(bytes){let crc=0xffffffff;for(const b of bytes)crc=crcTable[(crc^b)&255]^(crc>>>8);return (crc^0xffffffff)>>>0;}
function concat(parts){const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let offset=0;for(const p of parts){out.set(p,offset);offset+=p.length;}return out;}
function header(size){const bytes=new Uint8Array(size);return {bytes,view:new DataView(bytes.buffer)};}
/** Standard ZIP with stored members, UTF-8 filename flag, local/central records and CRC-32. */
function makeZip(entries){const local=[],central=[];let offset=0;for(const e of entries){if(!/^[A-Za-z0-9_\[\]./-]+$/.test(e.name)||e.name.includes('..')||e.name.startsWith('/'))fail('UNSAFE_EXPORT_FILENAME','Unsafe internal package member.');const name=encoder.encode(e.name),data=e.bytes,crc=artifactCRC32(data),h=header(30),c=header(46);h.view.setUint32(0,0x04034b50,true);h.view.setUint16(4,20,true);h.view.setUint16(6,0x800,true);h.view.setUint16(12,0x21,true);h.view.setUint32(14,crc,true);h.view.setUint32(18,data.length,true);h.view.setUint32(22,data.length,true);h.view.setUint16(26,name.length,true);c.view.setUint32(0,0x02014b50,true);c.view.setUint16(4,20,true);c.view.setUint16(6,20,true);c.view.setUint16(8,0x800,true);c.view.setUint16(14,0x21,true);c.view.setUint32(16,crc,true);c.view.setUint32(20,data.length,true);c.view.setUint32(24,data.length,true);c.view.setUint16(28,name.length,true);c.view.setUint32(42,offset,true);local.push(h.bytes,name,data);central.push(c.bytes,name);offset+=h.bytes.length+name.length+data.length;}
 const dir=concat(central),end=header(22);end.view.setUint32(0,0x06054b50,true);end.view.setUint16(8,entries.length,true);end.view.setUint16(10,entries.length,true);end.view.setUint32(12,dir.length,true);end.view.setUint32(16,offset,true);return concat([...local,dir,end.bytes]);}
function wordParagraph(text,kind='p'){const props=kind==='title'?'<w:pStyle w:val="Title"/>':kind==='h'?'<w:pStyle w:val="Heading1"/>':kind==='subhead'?'<w:pStyle w:val="Heading2"/>':'';return `<w:p><w:pPr>${props}<w:spacing w:after="100"/></w:pPr><w:r><w:t xml:space="preserve">${x(text)}</w:t></w:r></w:p>`;}
function wordTable(rows){return `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/><w:tblBorders>${['top','left','bottom','right','insideH','insideV'].map(p=>`<w:${p} w:val="single" w:sz="4" w:color="CBD5E1"/>`).join('')}</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="2800"/><w:gridCol w:w="7000"/></w:tblGrid>${rows.map(row=>`<w:tr>${row.map((cell,i)=>`<w:tc><w:tcPr><w:tcW w:w="${i===0?2800:7000}" w:type="dxa"/></w:tcPr>${wordParagraph(cell)}</w:tc>`).join('')}</w:tr>`).join('')}</w:tbl>`;}
function docx(content,json,m){const body=content.map(c=>c.kind==='table'?wordTable(c.rows):wordParagraph(c.text,c.kind)).join(''),entries=[
 {name:'[Content_Types].xml',text:'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="json" ContentType="application/json"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>'},
 {name:'_rels/.rels',text:'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>'},
 {name:'word/document.xml',text:`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="${XML_NS}"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="900" w:right="900" w:bottom="900" w:left="900"/></w:sectPr></w:body></w:document>`},
 {name:'word/styles.xml',text:`<?xml version="1.0" encoding="UTF-8"?><w:styles xmlns:w="${XML_NS}"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="20"/></w:rPr></w:rPrDefault></w:docDefaults><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="36"/><w:color w:val="182A38"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:pPr><w:keepNext/><w:spacing w:before="250" w:after="140"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="076D84"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:pPr><w:keepNext/></w:pPr><w:rPr><w:b/><w:sz w:val="22"/></w:rPr></w:style></w:styles>`},
 {name:'word/_rels/document.xml.rels',text:'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
 {name:'docProps/core.xml',text:`<?xml version="1.0" encoding="UTF-8"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${x(m.draft.title)}</dc:title><dc:creator>PRAMANEX FORGE technical exporter</dc:creator><dc:description>Controlled evidence package; release=false; no regulator acceptance claim.</dc:description></cp:coreProperties>`},
 {name:'forge/manifest.json',text:json}
 ];return makeZip(entries.map(e=>({name:e.name,bytes:encoder.encode(e.text)})));}
function html(content,json){return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>FORGE controlled evidence package</title><style>body{font:15px/1.6 system-ui,sans-serif;max-width:900px;margin:48px auto;padding:0 24px;color:#182a38;background:#f7f8f7}h1,h2,h3{line-height:1.2}h2{margin-top:40px;color:#076d84}small,.citation{font-size:12px;overflow-wrap:anywhere}.boundary{border:1px solid #076d84;padding:14px;background:#e5eff1}table{border-collapse:collapse;width:100%;margin:16px 0}td{border:1px solid #cbd5e1;padding:8px;vertical-align:top;overflow-wrap:anywhere}td:first-child{width:28%;font-weight:600}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:12px/1.6 ui-monospace,monospace;background:#eaf0f2;padding:16px}@media print{body{background:white;margin:0}h2,h3{break-after:avoid}table{break-inside:avoid}}</style></head><body>${content.map(c=>c.kind==='table'?`<table>${c.rows.map(r=>`<tr>${r.map(t=>`<td>${escapeHTML(t)}</td>`).join('')}</tr>`).join('')}</table>`:c.kind==='title'?`<h1>${escapeHTML(c.text)}</h1>`:c.kind==='h'?`<h2>${escapeHTML(c.text)}</h2>`:c.kind==='subhead'?`<h3>${escapeHTML(c.text)}</h3>`:c.kind==='quote'?`<pre>${escapeHTML(c.text)}</pre>`:`<p class="${c.kind}">${escapeHTML(c.text)}</p>`).join('')}<details><summary>Exact frozen JSON manifest</summary><pre>${escapeHTML(json)}</pre></details></body></html>`;}
async function pdf(content,json,m){
 const document=await PDFDocument.create();document.registerFontkit(fontkit);const bytes=exportFontBytes(),font=await document.embedFont(bytes,{subset:false}),face=fontkit.create(bytes),supported=new Set(face.characterSet);
 // No script reshaping or scientific-character substitution is permitted silently.
 const text=content.flatMap(c=>c.kind==='table'?c.rows.flat():[c.text]).join('\n');
 for(const ch of text){const cp=ch.codePointAt(0);if(['\n','\r','\t'].includes(ch))continue;if(!supported.has(cp))fail('UNSUPPORTED_PDF_CHARACTER',`PDF font cannot preserve U+${cp.toString(16).toUpperCase()}; use Unicode-preserving DOCX/HTML or a qualified font configuration.`);}
 const W=595.28,H=841.89,margin=44,width=W-margin*2;let page,y,pageCount=0;const ink=rgb(0.095,0.165,0.22),accent=rgb(0.027,0.427,0.518),muted=rgb(0.32,0.39,0.45);
 const newPage=()=>{if(++pageCount>MAX_PAGES)fail('EXPORT_LIMIT','PDF exceeds the 120 page technical export limit.',413);page=document.addPage([W,H]);y=H-margin;page.drawText('FORGE | Controlled evidence | release=false',{x:margin,y:24,size:8,font,color:muted});page.drawText(String(pageCount),{x:W-margin-18,y:24,size:8,font,color:muted});};newPage();
 const ensure=height=>{if(y-height<46)newPage();};
 const wrap=(text,size,w)=>{const result=[];for(const paragraph of String(text).split(/\r\n|\n|\r/)){let line='';for(const token of (paragraph.replaceAll('\t','    ').match(/\s+|\S+/gu)||[])){if(font.widthOfTextAtSize(line+token,size)<=w){line+=token;continue;}if(line.trim()){result.push(line.trimEnd());line='';}if(!token.trim())continue;for(const char of token){if(line&&font.widthOfTextAtSize(line+char,size)>w){result.push(line);line='';}line+=char;}}result.push(line.trimEnd());}return result;};
 const drawLines=(text,{size=10.2,color=ink,left=margin,w=width,space=6}={})=>{for(const line of wrap(text,size,w)){ensure(size*1.45);page.drawText(line,{x:left,y:y-size,size,font,color});y-=size*1.45;}y-=space;};
 const tableHeight=rows=>rows.reduce((sum,row)=>sum+Math.max(wrap(row[0],9,135).length,wrap(row[1],9,width-151).length)*13+8,0)+10;
 for(let index=0;index<content.length;index++){const c=content[index];if(['h','subhead'].includes(c.kind)){const next=content[index+1],after=content[index+2];const block=next?.kind==='table'?tableHeight(next.rows)+50:next?.kind==='subhead'&&after?.kind==='table'?tableHeight(after.rows)+90:100;ensure(Math.min(block,H-margin-70));}if(c.kind==='table'){for(const row of c.rows){const label=wrap(row[0],9,135),value=wrap(row[1],9,width-151),height=Math.max(label.length,value.length)*13+12;ensure(Math.min(height,80));let start=y;const lines=Math.max(label.length,value.length);for(let i=0;i<lines;i++){ensure(13);if(y!==start-i*13){start=y+i*13;}if(label[i])page.drawText(label[i],{x:margin+5,y:y-10,size:9,font,color:muted});if(value[i])page.drawText(value[i],{x:margin+150,y:y-10,size:9,font,color:ink});y-=13;}y-=8;page.drawLine({start:{x:margin,y:y+3},end:{x:W-margin,y:y+3},color:rgb(.79,.84,.87),thickness:.35});}y-=10;}else{const spec=c.kind==='title'?{size:25,color:ink,space:8}:c.kind==='h'?{size:15,color:accent,space:10}:c.kind==='subhead'?{size:11.5,color:accent,space:8}:c.kind==='citation'||c.kind==='quote'?{size:8.5,color:muted,space:8}:c.kind==='boundary'?{size:11,color:accent,space:8}:{};if(['h','subhead'].includes(c.kind)){y-=10;ensure(55);}drawLines(c.text,spec);}}
 document.setTitle(m.draft.title);document.setAuthor('PRAMANEX FORGE technical exporter');document.setSubject(BOUNDARY);document.setProducer('FORGE controlled artifact renderer/1');document.setCreationDate(new Date(m.createdAt||'2026-01-01T00:00:00Z'));document.setModificationDate(new Date(m.createdAt||'2026-01-01T00:00:00Z'));
 await document.attach(encoder.encode(json),'frozen-manifest.json',{mimeType:'application/json',description:'Exact immutable scientific evidence manifest; source originals are not embedded.'});
 return document.save({useObjectStreams:false});
}
export async function formatEvidence(input,options={}){
 const format=options.format;if(!['docx','pdf','html'].includes(format))fail('UNSUPPORTED_EXPORT_FORMAT','Select DOCX, PDF or HTML.');
 const {manifest:m,json}=boundedSnapshot(input), report=await preflightPackage(m,options);if(!report.ok)fail('EXPORT_PREFLIGHT_FAILED',report.checks.filter(c=>c.status==='FAIL').map(c=>`${c.id}: ${c.detail}`).join('; '));
 const filename=safeExportFilename(options.filename||`FORGE-${m.draft.section.replaceAll('.','-')}-r${m.draft.revision}.${format}`,format),content=rowsForContent(m,report,options.exportRecord);
 const bytes=format==='docx'?docx(content,json,m):format==='html'?encoder.encode(html(content,json)):await pdf(content,json,m);
 const mime={docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',pdf:'application/pdf',html:'text/html; charset=utf-8'}[format];
 return {bytes,mime,filename,sha256:await sha(bytes),checks:report,release:false};
}
export async function packageEvidence(input,options={}){
 const artifacts=[];for(const format of ['docx','pdf','html']){const a=await formatEvidence(input,{...options,format});artifacts.push({name:a.filename,bytes:a.bytes,mime:a.mime});}
 artifacts.push(...evidenceTables(input));const report=await preflightPackage(input,{...options,artifacts});if(!report.ok)fail('EXPORT_PREFLIGHT_FAILED','Technical package preflight failed.');
 const {json}=boundedSnapshot(input),members=[...artifacts,{name:'manifest.json',bytes:encoder.encode(json)},{name:'index.xml',bytes:encoder.encode(report.indexXml)},{name:'technical-checks.json',bytes:encoder.encode(JSON.stringify(report,null,2))}];
 const bytes=makeZip(members);return {bytes,mime:'application/zip',filename:safeExportFilename(options.filename||'FORGE-technical-handoff.zip','zip'),sha256:await sha(bytes),checks:report,release:false};
}
