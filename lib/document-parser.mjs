/**
 * Bounded, schema-specific XML / OOXML parameter ingestion.
 * Worker-compatible: Web Crypto and DecompressionStream only; no native ZIP/XML code.
 * Every extracted value remains a candidate tied to an exact package XML part.
 */
export const DOCUMENT_PARSER_VERSION = 'controlled-document-parameters/1.0.0';
const INPUT_LIMIT = 5 * 1024 * 1024;
const OUTPUT_LIMIT = 10 * 1024 * 1024;
const FILE_LIMIT = 200;
const ROW_LIMIT = 5000;
const REQUIRED = ['parameter', 'value', 'unit', 'method', 'batch', 'basis', 'low', 'high', 'condition'];
const OPTIONAL = ['product', 'facility'];
const FIELDS = new Set([...REQUIRED, ...OPTIONAL]);
const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const S = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PKG_R = 'http://schemas.openxmlformats.org/package/2006/relationships';
const CT = 'http://schemas.openxmlformats.org/package/2006/content-types';
const OFFICE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument';
const XML = 'http://www.w3.org/XML/1998/namespace';
class DocumentFailure extends Error { constructor(code, message) { super(message); this.code = code; } }
const stop = (code, message) => { throw new DocumentFailure(code, message); };
const utf8 = bytes => { try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(bytes); } catch { stop('UNSUPPORTED_ENCODING', 'Only valid UTF-8 XML package parts are supported.'); } };
const validXMLCode = n => n === 9 || n === 10 || n === 13 || n >= 32 && n <= 0xD7FF || n >= 0xE000 && n <= 0xFFFD || n >= 0x10000 && n <= 0x10FFFF;
function decodeXML(raw) {
  if (/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(raw)) stop('MALFORMED_XML', 'Forbidden XML control character.');
  const entities = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
  return raw.replace(/&([^;]*);|&/g, (all, entity) => {
    if (!entity) stop('MALFORMED_XML', 'Unclosed XML entity.');
    if (Object.hasOwn(entities, entity)) return entities[entity];
    if (!/^#(?:[0-9]+|x[0-9a-fA-F]+)$/.test(entity)) stop('ENTITY_FORBIDDEN', 'Custom or external XML entities are not accepted.');
    const n = entity[1] === 'x' ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    if (!validXMLCode(n)) stop('MALFORMED_XML', 'Invalid numeric XML character reference.');
    return String.fromCodePoint(n);
  });
}

/** Strict non-expanding XML scanner. Offsets always refer to this original XML text. */
function parseXML(text, part) {
  if (text.length > OUTPUT_LIMIT) stop('XML_LIMIT', 'XML part exceeds the structural limit.');
  if (/<!\s*(?:DOCTYPE|ENTITY)/i.test(text)) stop('DTD_FORBIDDEN', 'DTD declarations and external entities are forbidden.');
  let i = text.charCodeAt(0) === 0xFEFF ? 1 : 0, count = 0, root = null;
  const stack = [], namePattern = /^[A-Za-z_][A-Za-z0-9_.:-]*/;
  const whitespace = () => { while (/[\t\n\r ]/.test(text[i] || '')) i++; };
  const readName = () => { const m = namePattern.exec(text.slice(i)); if (!m || m[0].split(':').length > 2) stop('MALFORMED_XML', `Invalid XML name in ${part}.`); i += m[0].length; return m[0]; };
  const resolve = (name, ns, attribute = false) => { const pieces = name.split(':'); if (pieces.length === 2 && !ns[pieces[0]]) stop('MALFORMED_XML', 'Undeclared namespace prefix.'); return { local: pieces.at(-1), uri: pieces.length === 2 ? ns[pieces[0]] : attribute ? '' : ns[''] || '' }; };
  while (i < text.length) {
    if (text[i] !== '<') {
      const start = i, end = text.indexOf('<', i); i = end < 0 ? text.length : end;
      const raw = text.slice(start, i); if (raw.includes(']]>')) stop('MALFORMED_XML', 'Invalid XML text delimiter.');
      const decoded = decodeXML(raw);
      if (!stack.length) { if (decoded.trim()) stop('MALFORMED_XML', 'Text outside the XML root is forbidden.'); }
      else stack.at(-1).segments.push({ start, end: i, raw, text: decoded });
      continue;
    }
    if (text.startsWith('<!--', i)) { const end = text.indexOf('-->', i + 4); if (end < 0 || text.slice(i + 4, end).includes('--')) stop('MALFORMED_XML', 'Invalid XML comment.'); i = end + 3; continue; }
    if (text.startsWith('<?', i)) {
      const end = text.indexOf('?>', i + 2), declaration = end < 0 ? '' : text.slice(i, end + 2);
      if (root || stack.length || i > (text.charCodeAt(0) === 0xFEFF ? 1 : 0) || !/^<\?xml\s+version\s*=\s*(['"])1\.0\1(?:\s+encoding\s*=\s*(['"])UTF-8\2)?(?:\s+standalone\s*=\s*(['"])(?:yes|no)\3)?\s*\?>$/i.test(declaration)) stop('INSTRUCTION_FORBIDDEN', 'Only an initial XML 1.0 UTF-8 declaration is accepted; processing instructions are forbidden.');
      i = end + 2; continue;
    }
    if (text.startsWith('<!', i)) stop('DECLARATION_FORBIDDEN', 'CDATA, DTD and arbitrary XML declarations are unsupported.');
    if (text.startsWith('</', i)) {
      i += 2; const name = readName(); whitespace(); if (text[i++] !== '>') stop('MALFORMED_XML', 'Malformed closing tag.');
      const node = stack.pop(); if (!node || node.name !== name) stop('MALFORMED_XML', 'Mismatched XML closing tag.'); node.end = i; node.closeStart = text.lastIndexOf('</', i - 1); continue;
    }
    const start = i++; const name = readName(), attributes = Object.create(null); whitespace();
    while (i < text.length && text[i] !== '>' && !text.startsWith('/>', i)) {
      const key = readName(); if (Object.hasOwn(attributes, key)) stop('MALFORMED_XML', 'Duplicate XML attribute.'); whitespace(); if (text[i++] !== '=') stop('MALFORMED_XML', 'Attribute value is required.'); whitespace(); const quote = text[i++]; if (quote !== '"' && quote !== "'") stop('MALFORMED_XML', 'XML attributes must be quoted.');
      const end = text.indexOf(quote, i); if (end < 0 || text.slice(i, end).includes('<')) stop('MALFORMED_XML', 'Malformed attribute value.'); attributes[key] = decodeXML(text.slice(i, end)); i = end + 1;
      if (text[i] !== '>' && !text.startsWith('/>', i) && !/[\t\n\r ]/.test(text[i] || '')) stop('MALFORMED_XML', 'XML attributes require whitespace separation.'); whitespace();
    }
    const selfClosing = text.startsWith('/>', i); if (selfClosing) i += 2; else if (text[i++] !== '>') stop('MALFORMED_XML', 'Unclosed XML tag.');
    const parent = stack.at(-1), ns = { ...(parent?.ns || { xml: XML }) };
    for (const [key, value] of Object.entries(attributes)) if (key === 'xmlns') ns[''] = value; else if (key.startsWith('xmlns:')) { const prefix = key.slice(6); if (!value || prefix === 'xmlns' || prefix === 'xml' && value !== XML) stop('MALFORMED_XML', 'Invalid namespace declaration.'); ns[prefix] = value; }
    const resolved = resolve(name, ns), expandedAttributes = new Set();
    for (const key of Object.keys(attributes)) { if (key === 'xmlns' || key.startsWith('xmlns:')) continue; const a = resolve(key, ns, true), expanded = `${a.uri}|${a.local}`; if (expandedAttributes.has(expanded)) stop('MALFORMED_XML', 'Duplicate expanded XML attribute.'); expandedAttributes.add(expanded); }
    const node = { name, ...resolved, attrs: attributes, ns, start, openEnd: i, end: selfClosing ? i : null, closeStart: selfClosing ? i : null, children: [], segments: [], parent, part };
    if (++count > 100000 || stack.length >= 40) stop('XML_LIMIT', 'XML node count or nesting limit exceeded.');
    if (parent) parent.children.push(node); else { if (root) stop('MALFORMED_XML', 'Multiple XML roots are forbidden.'); root = node; }
    if (!selfClosing) stack.push(node);
  }
  if (stack.length || !root) stop('MALFORMED_XML', 'XML has an incomplete or missing root.');
  return root;
}
const children = (node, local, uri) => node.children.filter(n => n.local === local && (uri === undefined || n.uri === uri));
const one = (node, local, uri) => { const hits = children(node, local, uri); if (hits.length > 1) stop('FORMAT_DRIFT', `Duplicate ${local} element.`); return hits[0]; };
const descendants = (node, local, uri) => { const result = []; const visit = n => { for (const child of n.children) { if (child.local === local && (uri === undefined || child.uri === uri)) result.push(child); visit(child); } }; visit(node); return result; };
const directText = node => { if (node.children.length) stop('FORMAT_DRIFT', 'Typed field text cannot contain nested instructions or arbitrary elements.'); return node.segments.map(s => s.text).join(''); };
const attr = (node, local, uri) => { for (const [key, value] of Object.entries(node.attrs)) { const p = key.split(':'); if (p.at(-1) === local && (p.length === 2 ? node.ns[p[0]] : '') === uri) return value; } return undefined; };
const numericPattern = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/;
function checkedNumeric(value) { const lexeme = String(value).trim(), n = Number(lexeme), significant = lexeme.split(/[eE]/)[0].replace(/^[+-]/, '').replace('.', '').replace(/^0+/, '').replace(/0+$/, ''); if (!Number.isFinite(n) || significant.length > 15 || Number.isInteger(n) && !Number.isSafeInteger(n) || n === 0 && /[1-9]/.test(lexeme.split(/[eE]/)[0])) stop('AMBIGUOUS_NUMBER', 'Original numeric precision/range exceeds the controlled JavaScript number representation; manual decimal review is required.'); return n; }
const numberOrNull = value => { if (value === undefined || !String(value).trim()) return null; if (!numericPattern.test(String(value).trim())) stop('AMBIGUOUS_LIMIT', 'Recorded low/high limits must be numeric lexemes or empty.'); return checkedNumeric(value); };
function evidenceCell(node, text, xml, path, coordinate, tokens = node.segments, content) {
  return { part: node.part, path, cell: coordinate || null, start: node.start, end: node.end, raw: xml.slice(node.start, node.end), text, offsetKind: 'UTF-16 character offsets within original XML package part', tokens: tokens.map(t => ({ start: t.start, end: t.end, raw: t.raw, text: t.text })), ...(content ? { content } : {}) };
}
function typedRow(cells, node, xml, row, path, table, warnings) {
  const values = Object.fromEntries(Object.entries(cells).map(([key, cell]) => [key, cell.text]));
  if (!String(values.parameter || '').trim()) stop('FORMAT_DRIFT', 'A parameter row has no parameter name.');
  for (const [key, value] of Object.entries(values)) if (value.length > (key === 'method' || key === 'condition' ? 2000 : 500)) stop('FIELD_LIMIT', `The ${key} field exceeds its controlled limit.`);
  if (values.parameter.trim().length > 100) stop('FIELD_LIMIT', 'Parameter name exceeds 100 characters.');
  if (!values.value.trim() || !values.unit.trim() || !values.method.trim() || !values.batch.trim()) warnings.push(`Row ${row} has missing value/unit/method/batch; human evidence review is required.`);
  if (numericPattern.test(values.value.trim())) checkedNumeric(values.value);
  const valueCell = cells.value;
  return { parameter: values.parameter.trim().toLowerCase(), rawValue: values.value, rawUnit: values.unit.trim(), method: values.method.trim(), batch: values.batch.trim() || 'UNSPECIFIED', basis: values.basis.trim(), condition: values.condition.trim(), product: (values.product || '').trim(), facility: (values.facility || '').trim(), low: numberOrNull(values.low), high: numberOrNull(values.high), rawLowLexeme: values.low, rawHighLexeme: values.high, status: 'CANDIDATE', span: { page: null, line: xml.slice(0, node.start).split('\n').length, table, row, column: 'value', part: node.part, path: valueCell.path, cell: valueCell.cell, start: node.start, end: node.end, raw: xml.slice(node.start, node.end), offsetKind: 'UTF-16 character offsets within original XML package part', valueToken: values.value, fields: cells } };
}
function parseTypedXML(xml, part, warnings) {
  const root = parseXML(xml, part);
  if (root.uri || root.local !== 'parameters' || root.attrs.schema !== 'pramanex-parameters/1' || Object.keys(root.attrs).some(k => k !== 'schema')) stop('UNKNOWN_SCHEMA', 'XML requires <parameters schema="pramanex-parameters/1"> and the documented typed row schema.');
  if (root.segments.some(s => s.text.trim())) stop('FORMAT_DRIFT', 'Text outside typed XML rows is unsupported.');
  const rows = [];
  for (const row of root.children) {
    if (row.uri || row.local !== 'row' || Object.keys(row.attrs).length || row.segments.some(s => s.text.trim())) stop('FORMAT_DRIFT', 'The typed XML schema allows plain row elements only.');
    const cells = Object.create(null), index = rows.length + 1;
    for (const cell of row.children) {
      if (cell.uri || !FIELDS.has(cell.local) || Object.hasOwn(cells, cell.local) || Object.keys(cell.attrs).length) stop('FORMAT_DRIFT', 'Unknown, duplicate or attributed typed XML field.');
      cells[cell.local] = evidenceCell(cell, directText(cell), xml, `/parameters/row[${index}]/${cell.local}`, `${index}:${cell.local}`);
    }
    if (REQUIRED.some(key => !Object.hasOwn(cells, key))) stop('FORMAT_DRIFT', 'Every typed XML row needs all nine named fields; empty values may remain explicit.');
    rows.push(typedRow(cells, row, xml, index, `/parameters/row[${index}]`, 'parameters', warnings));
    if (rows.length > ROW_LIMIT) stop('ROW_LIMIT', 'Parameter row count exceeds 5,000.');
  }
  if (!rows.length) stop('NO_TYPED_ROWS', 'No supported parameter rows were found.');
  return rows;
}

const crcTable = Array.from({ length: 256 }, (_, n) => { for (let i = 0; i < 8; i++) n = n & 1 ? 0xEDB88320 ^ n >>> 1 : n >>> 1; return n >>> 0; });
const crc32 = bytes => { let crc = 0xFFFFFFFF; for (const b of bytes) crc = crcTable[(crc ^ b) & 255] ^ crc >>> 8; return (crc ^ 0xFFFFFFFF) >>> 0; };
function safePartName(name) {
  if (!name || !/^[A-Za-z0-9_.\/[\]-]+$/.test(name) || name.startsWith('/') || name.includes('//') || name.split('/').some(p => p === '.' || p === '..') || name.includes('\\')) stop('ARCHIVE_PATH', 'Archive paths must be relative, canonical OOXML part names.');
  return name;
}
async function inflateBounded(bytes, expected) {
  let stream; try { stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')); } catch { stop('DECOMPRESSION_UNAVAILABLE', 'This runtime has no bounded raw-DEFLATE support.'); }
  const reader = stream.getReader(), chunks = []; let size = 0;
  try { while (true) { const next = await reader.read(); if (next.done) break; size += next.value.byteLength; if (size > expected || size > OUTPUT_LIMIT) { await reader.cancel(); stop('ARCHIVE_LIMIT', 'Inflated entry exceeds its declared size or extraction limit.'); } chunks.push(next.value); } } catch (e) { if (e instanceof DocumentFailure) throw e; stop('ARCHIVE_CORRUPT', 'Invalid compressed archive entry.'); }
  if (size !== expected) stop('ARCHIVE_CORRUPT', 'Inflated archive entry size differs from its metadata.');
  const result = new Uint8Array(size); let at = 0; for (const chunk of chunks) { result.set(chunk, at); at += chunk.byteLength; } return result;
}
async function readZIP(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), size = bytes.byteLength;
  const u16 = n => { if (n < 0 || n + 2 > size) stop('ARCHIVE_CORRUPT', 'Truncated ZIP metadata.'); return view.getUint16(n, true); }, u32 = n => { if (n < 0 || n + 4 > size) stop('ARCHIVE_CORRUPT', 'Truncated ZIP metadata.'); return view.getUint32(n, true); };
  let end = -1; for (let i = size - 22; i >= Math.max(0, size - 65557); i--) if (u32(i) === 0x06054B50 && i + 22 + u16(i + 20) === size) { end = i; break; }
  if (end < 0 || u32(0) !== 0x04034B50) stop('ARCHIVE_CORRUPT', 'A complete ordinary OOXML ZIP archive is required.');
  const count = u16(end + 10), centralSize = u32(end + 12), centralOffset = u32(end + 16);
  if (u16(end + 4) || u16(end + 6) || u16(end + 8) !== count || count === 0xFFFF || centralSize === 0xFFFFFFFF || centralOffset === 0xFFFFFFFF) stop('ARCHIVE_UNSUPPORTED', 'Split, ZIP64 and encrypted archives are unsupported.');
  if (!count || count > FILE_LIMIT || centralOffset + centralSize !== end) stop('ARCHIVE_LIMIT', 'ZIP has too many entries or an invalid central directory.');
  const entries = [], names = new Set(), ranges = []; let at = centralOffset, declared = 0;
  for (let index = 0; index < count; index++) {
    if (u32(at) !== 0x02014B50 || at + 46 > end) stop('ARCHIVE_CORRUPT', 'Invalid ZIP central-directory record.');
    const flags = u16(at + 8), method = u16(at + 10), crc = u32(at + 16), compressed = u32(at + 20), uncompressed = u32(at + 24), nameLength = u16(at + 28), extraLength = u16(at + 30), commentLength = u16(at + 32), local = u32(at + 42), external = u32(at + 38);
    if (flags & 1 || flags & ~0x80E || method !== 0 && method !== 8) stop('ARCHIVE_UNSUPPORTED', 'Encrypted, unusual flags and unsupported compression are forbidden.');
    if (u16(at + 6) > 20 || u16(at + 34) || compressed === 0xFFFFFFFF || uncompressed === 0xFFFFFFFF || local === 0xFFFFFFFF || (external >>> 16 & 0xF000) === 0xA000) stop('ARCHIVE_UNSUPPORTED', 'Split archives, ZIP64 and symbolic links are forbidden.');
    const recordEnd = at + 46 + nameLength + extraLength + commentLength; if (recordEnd > end || !nameLength) stop('ARCHIVE_CORRUPT', 'Truncated ZIP entry name.');
    const nameBytes = bytes.subarray(at + 46, at + 46 + nameLength); if (!(flags & 0x800) && nameBytes.some(b => b > 127)) stop('ARCHIVE_PATH', 'Non-UTF-8 part names are unsupported.');
    const name = safePartName(utf8(nameBytes)); if (names.has(name)) stop('ARCHIVE_PATH', 'Duplicate archive part name.'); names.add(name);
    if (/vba|active[xs]|embeddings|\.bin$/i.test(name)) stop('ACTIVE_CONTENT', 'Macros, embedded objects and active binary parts are forbidden.');
    let extraAt = at + 46 + nameLength; while (extraAt < at + 46 + nameLength + extraLength) { const tag = u16(extraAt), length = u16(extraAt + 2); if (tag === 1 || tag === 0x9901) stop('ARCHIVE_UNSUPPORTED', 'ZIP64/AES metadata is forbidden.'); extraAt += 4 + length; } if (extraAt !== at + 46 + nameLength + extraLength) stop('ARCHIVE_CORRUPT', 'Malformed ZIP extra metadata.');
    declared += uncompressed; if (declared > OUTPUT_LIMIT || uncompressed > OUTPUT_LIMIT || compressed > INPUT_LIMIT || uncompressed && !compressed || name.endsWith('/') && (compressed || uncompressed)) stop('ARCHIVE_LIMIT', 'ZIP decompressed total exceeds 10 MB or entry metadata is invalid.');
    if (local + 30 > centralOffset || u32(local) !== 0x04034B50 || u16(local + 4) > 20 || u16(local + 6) !== flags || u16(local + 8) !== method) stop('ARCHIVE_CORRUPT', 'ZIP local header does not match its central directory.');
    const localNameLength = u16(local + 26), localExtraLength = u16(local + 28), dataStart = local + 30 + localNameLength + localExtraLength, dataEnd = dataStart + compressed;
    if (dataEnd > centralOffset || utf8(bytes.subarray(local + 30, local + 30 + localNameLength)) !== name) stop('ARCHIVE_CORRUPT', 'ZIP part name or compressed range does not match.');
    let localExtraAt = local + 30 + localNameLength; while (localExtraAt < dataStart) { const tag = u16(localExtraAt), length = u16(localExtraAt + 2); if (tag === 1 || tag === 0x9901) stop('ARCHIVE_UNSUPPORTED', 'Local ZIP64/AES metadata is forbidden.'); localExtraAt += 4 + length; } if (localExtraAt !== dataStart) stop('ARCHIVE_CORRUPT', 'Malformed local ZIP extra metadata.');
    if (!(flags & 8) && (u32(local + 14) !== crc || u32(local + 18) !== compressed || u32(local + 22) !== uncompressed)) stop('ARCHIVE_CORRUPT', 'ZIP local sizes or CRC differ from the central directory.');
    let rangeEnd = dataEnd; if (flags & 8) { let descriptor = dataEnd; if (u32(descriptor) === 0x08074B50) descriptor += 4; if (u32(descriptor) !== crc || u32(descriptor + 4) !== compressed || u32(descriptor + 8) !== uncompressed) stop('ARCHIVE_CORRUPT', 'Invalid ZIP data descriptor.'); rangeEnd = descriptor + 12; if (rangeEnd > centralOffset) stop('ARCHIVE_CORRUPT', 'ZIP descriptor crosses central metadata.'); }
    ranges.push([local, rangeEnd]); entries.push({ name, method, crc, compressed, uncompressed, dataStart, dataEnd }); at = recordEnd;
  }
  if (at !== end) stop('ARCHIVE_CORRUPT', 'Unexpected central-directory trailing content.');
  ranges.sort((a, b) => a[0] - b[0]); for (let i = 1; i < ranges.length; i++) if (ranges[i][0] < ranges[i - 1][1]) stop('ARCHIVE_CORRUPT', 'Overlapping ZIP entry ranges.');
  const parts = new Map();
  for (const entry of entries) { if (entry.name.endsWith('/')) continue; const original = bytes.subarray(entry.dataStart, entry.dataEnd), data = entry.method === 0 ? new Uint8Array(original) : await inflateBounded(original, entry.uncompressed); if (data.byteLength !== entry.uncompressed || crc32(data) !== entry.crc) stop('ARCHIVE_CORRUPT', 'Archive data fails its size/CRC integrity check.'); parts.set(entry.name, { bytes: data }); }
  return parts;
}
function relationshipTarget(base, target) {
  if (!target || /[:\\%?#\u0000-\u0020]/.test(target)) stop('EXTERNAL_RELATIONSHIP', 'Relationship target must be a plain internal package part.');
  const path = target.startsWith('/') ? [] : base.split('/').slice(0, -1);
  for (const bit of target.split('/')) { if (!bit || bit === '.') continue; if (bit === '..') { if (!path.length) stop('ARCHIVE_PATH', 'Relationship escapes the package root.'); path.pop(); } else path.push(bit); }
  return safePartName(path.join('/'));
}
function inspectPackage(parts, kind) {
  for (const [name, part] of parts) if (/\.xml$|\.rels$/i.test(name)) { part.text = utf8(part.bytes); part.root = parseXML(part.text, name); }
  const types = parts.get('[Content_Types].xml')?.root;
  if (!types || types.local !== 'Types' || types.uri !== CT) stop('FORMAT_DRIFT', 'OOXML content types are missing or use an unsupported schema.');
  const expected = kind === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml';
  const main = kind === 'docx' ? 'word/document.xml' : 'xl/workbook.xml'; let matched = false; const typeKeys = new Set();
  for (const item of types.children) { if (!['Override', 'Default'].includes(item.local) || item.uri !== CT) stop('FORMAT_DRIFT', 'Unsupported OOXML content-type entry.'); const type = item.attrs.ContentType || '', key = `${item.local}:${item.local === 'Override' ? item.attrs.PartName : item.attrs.Extension}`; if (!type || key.endsWith(':undefined') || typeKeys.has(key)) stop('FORMAT_DRIFT', 'Duplicate or incomplete OOXML content-type declaration.'); typeKeys.add(key); if (/macro|vba|active[xs]|oleObject/i.test(type)) stop('ACTIVE_CONTENT', 'Active or macro-enabled OOXML is forbidden.'); if (item.attrs.PartName === `/${main}` && type === expected) matched = true; }
  if (!matched) stop('FORMAT_DRIFT', 'OOXML main part does not match its declared DOCX/XLSX format.');
  const relationships = new Map();
  for (const [name, part] of parts) if (name.endsWith('.rels')) {
    if (part.root.local !== 'Relationships' || part.root.uri !== PKG_R) stop('FORMAT_DRIFT', 'Unsupported package relationship schema.');
    const base = name === '_rels/.rels' ? '' : name.replace(/(^|\/)\_rels\//, '$1').slice(0, -5), map = new Map();
    for (const rel of part.root.children) {
      if (rel.local !== 'Relationship' || rel.uri !== PKG_R || !rel.attrs.Id || !rel.attrs.Type || !rel.attrs.Target || map.has(rel.attrs.Id)) stop('FORMAT_DRIFT', 'Invalid or duplicate OOXML relationship.');
      if (rel.attrs.TargetMode && rel.attrs.TargetMode !== 'Internal') stop('EXTERNAL_RELATIONSHIP', 'External document relationships are forbidden.');
      const target = relationshipTarget(base, rel.attrs.Target); if (!parts.has(target)) stop('FORMAT_DRIFT', 'An internal relationship has no original package part.'); map.set(rel.attrs.Id, { target, type: rel.attrs.Type });
    }
    relationships.set(base, map);
  }
  if (![...(relationships.get('')?.values() || [])].some(r => r.type === OFFICE && r.target === main)) stop('FORMAT_DRIFT', 'Package root must identify the expected office document.');
  if (!parts.has(main)) stop('FORMAT_DRIFT', 'OOXML main document part is absent.');
  return { main, relationships };
}
function headerMap(cells) {
  const labels = cells.map(c => c.text.trim().toLowerCase()), marker = labels.includes('parameter') || labels.includes('value');
  if (!marker) return null;
  if (labels.some(label => !FIELDS.has(label)) || new Set(labels).size !== labels.length || REQUIRED.some(field => !labels.includes(field))) stop('FORMAT_DRIFT', 'Parameter table headers must contain each documented field once; unknown/missing headers are held.');
  return labels;
}
function wordCell(cell, xml, path, coordinate) {
  if (descendants(cell, 'tbl', W).length || descendants(cell, 'gridSpan', W).length || descendants(cell, 'vMerge', W).length) stop('AMBIGUOUS_COORDINATES', 'Nested or merged Word table cells are unsupported.');
  if (['fldSimple', 'fldChar', 'instrText', 'del', 'ins', 'customXml', 'object', 'drawing', 'altChunk', 'delText'].some(type => descendants(cell, type, W).length)) stop('ACTIVE_CONTENT', 'Computed fields, hidden/embedded content and unresolved tracked changes cannot be treated as approved source values.');
  const paragraphs = descendants(cell, 'p', W), tokens = [], texts = paragraphs.map(p => { const pieces = []; const visit = node => { for (const n of node.children) { if (n.uri === W && n.local === 't') { const text = directText(n); pieces.push(text); tokens.push(...n.segments); } else if (n.uri === W && n.local === 'tab') pieces.push('\t'); else if (n.uri === W && (n.local === 'br' || n.local === 'cr')) pieces.push('\n'); else visit(n); } }; visit(p); return pieces.join(''); });
  return evidenceCell(cell, texts.join('\n'), xml, path, coordinate, tokens);
}
function parseWord(parts, warnings) {
  const part = parts.get('word/document.xml'), root = part.root;
  if (root.local !== 'document' || root.uri !== W) stop('FORMAT_DRIFT', 'Word document namespace is unsupported.');
  const body = one(root, 'body', W); if (!body) stop('FORMAT_DRIFT', 'Word document body is missing.');
  if (['del', 'ins', 'moveFrom', 'moveTo'].some(type => descendants(body, type, W).length)) stop('ACTIVE_CONTENT', 'Unresolved tracked document changes require manual source review.');
  const tables = descendants(body, 'tbl', W), result = []; let tableNumber = 0;
  for (const table of tables) {
    tableNumber++; if (table.parent?.local === 'tc') stop('AMBIGUOUS_COORDINATES', 'Nested Word tables are not supported.');
    const rows = children(table, 'tr', W); if (!rows.length) continue;
    const header = children(rows[0], 'tc', W).map((cell, column) => wordCell(cell, part.text, `/w:document/w:body/w:tbl[${tableNumber}]/w:tr[1]/w:tc[${column + 1}]`, `T${tableNumber}:R1:C${column + 1}`));
    const labels = headerMap(header); if (!labels) { warnings.push(`Word table ${tableNumber} has no controlled parameter schema and was not interpreted.`); continue; }
    for (let index = 1; index < rows.length; index++) {
      const row = rows[index], rowCells = children(row, 'tc', W); if (rowCells.length !== labels.length) stop('FORMAT_DRIFT', 'Word parameter table changed its column count.');
      const cells = Object.fromEntries(rowCells.map((cell, column) => [labels[column], wordCell(cell, part.text, `/w:document/w:body/w:tbl[${tableNumber}]/w:tr[${index + 1}]/w:tc[${column + 1}]`, `T${tableNumber}:R${index + 1}:C${column + 1}`)]));
      if (Object.values(cells).every(cell => !cell.text.trim())) continue;
      result.push(typedRow(cells, row, part.text, index + 1, '', `Word table ${tableNumber}`, warnings)); if (result.length > ROW_LIMIT) stop('ROW_LIMIT', 'Parameter row count exceeds 5,000.');
    }
  }
  if (!result.length) stop('NO_TYPED_ROWS', 'No Word table with the controlled parameter headers was found.'); return result;
}
function cellCoordinate(value) {
  const match = /^([A-Z]{1,3})([1-9]\d{0,6})$/.exec(value || ''); if (!match) stop('AMBIGUOUS_COORDINATES', 'Spreadsheet cell has no canonical A1 coordinate.');
  const column = [...match[1]].reduce((sum, c) => sum * 26 + c.charCodeAt(0) - 64, 0), row = Number(match[2]); if (column > 16384 || row > 1048576) stop('AMBIGUOUS_COORDINATES', 'Spreadsheet coordinate exceeds the XLSX bounds.'); return { column, row };
}
function richSpreadsheetText(node) {
  if (descendants(node, 'rPh', S).length) stop('FORMAT_DRIFT', 'Phonetic spreadsheet text requires a reviewed rich-string schema.');
  const texts = descendants(node, 't', S); if (!texts.length) return { text: '', tokens: [] };
  return { text: texts.map(directText).join(''), tokens: texts.flatMap(t => t.segments) };
}
function parseSheet(parts, name, label, shared, warnings) {
  const part = parts.get(name); if (!part?.root || part.root.local !== 'worksheet' || part.root.uri !== S) stop('FORMAT_DRIFT', 'Worksheet source part is missing or unsupported.');
  if (descendants(part.root, 'mergeCell', S).length || descendants(part.root, 'f', S).length) stop('AMBIGUOUS_COORDINATES', 'Merged spreadsheet cells and formula caches are not accepted as original measured values.');
  const data = one(part.root, 'sheetData', S); if (!data) stop('FORMAT_DRIFT', 'Spreadsheet sheetData is absent.');
  const matrix = [], coordinates = new Set(); let previousRow = 0;
  for (const row of children(data, 'row', S)) {
    if (!/^[1-9]\d*$/.test(row.attrs.r || '') || Number(row.attrs.r) <= previousRow || Number(row.attrs.r) > 1048576) stop('AMBIGUOUS_COORDINATES', 'Spreadsheet row coordinates are invalid, duplicate or unsorted.');
    previousRow = Number(row.attrs.r); const cells = new Map(); let previousColumn = 0;
    for (const cell of children(row, 'c', S)) {
      const coordinate = cellCoordinate(cell.attrs.r); if (coordinate.row !== previousRow || coordinate.column <= previousColumn || coordinates.has(cell.attrs.r)) stop('AMBIGUOUS_COORDINATES', 'Spreadsheet cell coordinates do not match their row or duplicate a cell.'); previousColumn = coordinate.column; coordinates.add(cell.attrs.r);
      if (cell.children.some(n => n.uri !== S || !['v', 'is'].includes(n.local))) stop('FORMAT_DRIFT', 'Unknown spreadsheet cell content requires a reviewed schema.');
      const value = one(cell, 'v', S), inline = one(cell, 'is', S), type = cell.attrs.t || 'n'; let text = '', tokens = [], content;
      if (type === 'inlineStr') { if (value || !inline) stop('FORMAT_DRIFT', 'Inline spreadsheet string has conflicting cell storage.'); const rich = richSpreadsheetText(inline); text = rich.text; tokens = rich.tokens; }
      else if (type === 's') { if (!value || inline) stop('FORMAT_DRIFT', 'Shared string reference is malformed.'); const index = directText(value); if (!/^\d+$/.test(index) || !shared || !shared[Number(index)]) stop('FORMAT_DRIFT', 'Shared string index has no original source entry.'); const s = shared[Number(index)]; text = s.text; tokens = value.segments; content = s.evidence; }
      else if (type === 'n' || type === 'str') { if (inline) stop('FORMAT_DRIFT', 'Spreadsheet cell storage type conflicts.'); text = value ? directText(value) : ''; tokens = value?.segments || []; if (type === 'n' && text && !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(text.trim())) stop('FORMAT_DRIFT', 'Numeric spreadsheet value has an invalid original lexeme.'); }
      else stop('FORMAT_DRIFT', 'Boolean, error, date and unknown spreadsheet cell types need a reviewed schema.');
      cells.set(coordinate.column, evidenceCell(cell, text, part.text, `/worksheet/sheetData/row[@r="${previousRow}"]/c[@r="${cell.attrs.r}"]`, `${label}!${cell.attrs.r}`, tokens, content));
    }
    matrix.push({ row, number: previousRow, cells }); if (matrix.length > 10000 || coordinates.size > 100000) stop('ROW_LIMIT', 'Spreadsheet structural limits exceeded.');
  }
  let header = null, result = [];
  for (const entry of matrix) {
    const nonEmpty = [...entry.cells].filter(([, cell]) => cell.text.trim()); if (!nonEmpty.length) continue;
    if (!header) { const labels = headerMap(nonEmpty.map(([, cell]) => cell)); if (!labels) continue; header = nonEmpty.map(([column], index) => ({ column, field: labels[index] })); continue; }
    if (nonEmpty.some(([column]) => !header.some(h => h.column === column))) stop('FORMAT_DRIFT', 'Spreadsheet parameter row has data outside the controlled header columns.');
    if (header.some(h => !entry.cells.has(h.column))) stop('FORMAT_DRIFT', 'Spreadsheet parameter row must retain an explicit cell for every controlled field, including empty values.');
    const cells = Object.fromEntries(header.map(h => [h.field, entry.cells.get(h.column)])); result.push(typedRow(cells, entry.row, part.text, entry.number, '', `Worksheet ${label}`, warnings)); if (result.length > ROW_LIMIT) stop('ROW_LIMIT', 'Parameter row count exceeds 5,000.');
  }
  if (!header) warnings.push(`Worksheet ${label} has no controlled parameter schema and was not interpreted.`); return result;
}
function parseSpreadsheet(parts, relationships, warnings) {
  const workbook = parts.get('xl/workbook.xml').root; if (workbook.local !== 'workbook' || workbook.uri !== S) stop('FORMAT_DRIFT', 'Workbook namespace is unsupported.');
  if (descendants(workbook, 'externalReferences', S).length) stop('EXTERNAL_RELATIONSHIP', 'External workbook dependencies are forbidden.');
  const sheets = one(workbook, 'sheets', S); if (!sheets) stop('FORMAT_DRIFT', 'Workbook sheet definitions are missing.');
  const sharedPart = parts.get('xl/sharedStrings.xml'); let shared;
  if (sharedPart) { if (sharedPart.root.local !== 'sst' || sharedPart.root.uri !== S) stop('FORMAT_DRIFT', 'Shared strings use an unsupported schema.'); shared = children(sharedPart.root, 'si', S).map((item, index) => { const rich = richSpreadsheetText(item); return { ...rich, evidence: evidenceCell(item, rich.text, sharedPart.text, `/sst/si[${index + 1}]`, `sharedString[${index}]`, rich.tokens) }; }); }
  const result = [], names = new Set(), targets = new Set();
  for (const sheet of children(sheets, 'sheet', S)) {
    const id = attr(sheet, 'id', R), rel = relationships.get('xl/workbook.xml')?.get(id); if (!sheet.attrs.name || names.has(sheet.attrs.name) || !rel || rel.type !== `${R}/worksheet` || targets.has(rel.target)) stop('FORMAT_DRIFT', 'Worksheet definition is missing, duplicated or references the wrong relationship type.'); names.add(sheet.attrs.name); targets.add(rel.target);
    result.push(...parseSheet(parts, rel.target, sheet.attrs.name, shared, warnings)); if (result.length > ROW_LIMIT) stop('ROW_LIMIT', 'Combined workbook parameter rows exceed 5,000.');
  }
  if (!result.length) stop('NO_TYPED_ROWS', 'No worksheet with controlled parameter headers was found.'); return result;
}

/**
 * Parse a permission-cleared original. Security/schema errors return visible HOLD,
 * never partial rows. Caller must persist original bytes/hash and require human review.
 */
export async function parseDocumentBytes(input, mime, name) {
  const bytes = input instanceof Uint8Array ? input : input instanceof ArrayBuffer ? new Uint8Array(input) : null;
  const base = { rows: [], parserVersion: DOCUMENT_PARSER_VERSION, evidenceMode: 'exact-original-package-XML-spans/candidate-only', warnings: [], original: { name: String(name || ''), mime: String(mime || ''), byteLength: bytes?.byteLength || 0, sha256: null } };
  try {
    if (!bytes || !bytes.byteLength) stop('EMPTY_DOCUMENT', 'A non-empty original byte array is required.');
    if (bytes.byteLength > INPUT_LIMIT) stop('INPUT_LIMIT', 'Original document exceeds 5 MB.');
    base.original.sha256 = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(b => b.toString(16).padStart(2, '0')).join('');
    if (!base.original.name || base.original.name.length > 240 || /[\u0000-\u001F]/.test(base.original.name)) stop('INVALID_NAME', 'Document needs a bounded printable original filename.');
    const extension = base.original.name.split('.').at(-1).toLowerCase(); let rows;
    if (extension === 'xml' && ['application/xml', 'text/xml'].includes(mime)) rows = parseTypedXML(utf8(bytes), base.original.name, base.warnings);
    else {
      const kind = extension === 'docx' && mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ? 'docx' : extension === 'xlsx' && mime === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ? 'xlsx' : null;
      if (!kind) stop('UNSUPPORTED_DOCUMENT', 'This parser supports typed UTF-8 XML, DOCX parameter tables and XLSX parameter worksheets only. PDF/image/handwriting require the separate reviewed vision workflow.');
      const parts = await readZIP(bytes), { relationships } = inspectPackage(parts, kind); rows = kind === 'docx' ? parseWord(parts, base.warnings) : parseSpreadsheet(parts, relationships, base.warnings);
      base.original.parts = [...parts].map(([path, part]) => ({ path, byteLength: part.bytes.byteLength }));
    }
    return { ...base, status: 'PARSED', rows, warnings: [...new Set(base.warnings)], humanReviewRequired: true };
  } catch (e) {
    const known = e instanceof DocumentFailure; return { ...base, status: 'HOLD', rows: [], humanReviewRequired: true, failure: { code: known ? e.code : 'DOCUMENT_PARSE_FAILED', message: known ? e.message : 'Document parsing failed safely; original evidence requires manual review.' } };
  }
}
