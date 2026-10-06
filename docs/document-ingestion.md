# Controlled document ingestion

The worker parser `lib/document-parser.mjs` implements **candidate-only**, schema-specific XML, Word table and spreadsheet extraction. It uses Web Crypto and Web `DecompressionStream`; native zlib appears only in test fixture construction. No additional dependency is required.

```js
const result = await parseDocumentBytes(originalUint8Array, sourceMime, originalFilename);
// { status: 'PARSED' | 'HOLD', rows, parserVersion, evidenceMode, warnings,
//   original: { name, mime, byteLength, sha256, parts? },
//   humanReviewRequired: true, failure?: { code, message } }
```

Each parsed row matches the core extraction interface: `parameter`, `rawValue`, `rawUnit`, `method`, `batch`, `basis`, `low`, `high`, `condition`, optional `product`/`facility`, plus `rawLowLexeme`/`rawHighLexeme` and an exact evidence `span`. No row grants approval. The calling intake workflow must already enforce source rights, purpose, tenant membership, original-byte storage and revision binding. The caller must not convert a `HOLD` result into success or retain partial extracted rows after a structural failure.

## Accepted schema

All supported tables have the exact, case-insensitive named headers **parameter, value, unit, method, batch, basis, low, high, condition**. Optional headers are **product** and **facility**. Header order may vary. Duplicate, absent or unknown header fields cause `HOLD`. Explicit empty cells remain empty candidates and require human review; no unit, batch, method, value or range is invented.

Plain XML requires UTF-8 and this named schema:

```xml
<parameters schema="pramanex-parameters/1">
  <row>
    <parameter>assay</parameter><value>09.8700</value><unit>%</unit>
    <method>HPLC 001</method><batch>B001</batch><basis>mass</basis>
    <low>09.5000</low><high>10.5000</high><condition>25 C</condition>
  </row>
</parameters>
```

Each row has each required named child once. Arbitrary XML schemas, custom field nesting and instruction elements are rejected rather than guessed. DTDs, custom/external entities, processing instructions, CDATA, undeclared namespaces and malformed structure are rejected. The predefined XML entities and valid numeric character references are decoded as data; exact original tokens remain in the evidence record.

DOCX accepts a standard transitional Word document whose table first row contains these headers. Unrelated tables are left uninterpreted with a visible warning. Table column drift, nested/merged cells, Word calculated fields and unresolved tracked changes cause `HOLD`. Text split across ordinary Word runs is joined for the candidate value while all original run tokens remain individually addressable.

XLSX accepts standard transitional workbooks, linked worksheets and inline/shared-string or original numeric cells. The header may follow introductory rows. Every parameter row retains an explicit source cell for every controlled field, including an empty value; omitted cells cause `HOLD` to avoid inventing coordinates. Formula caches, merged cells, date/error/Boolean types, extra parameter columns, duplicate coordinates and unresolvable shared-string references are rejected. No Excel formula is evaluated. Shared-string values link the actual worksheet cell/index and the original `xl/sharedStrings.xml` item. Non-parameter sheets are left uninterpreted with a warning.

## Exact evidence and original integrity

Original `09.8700` remains `rawValue: '09.8700'`; numeric low/high values are accompanied by their original lexical strings and original cell tokens. The original SHA-256 and byte length are recorded. OOXML extraction identifies the real package part, XML path and table/cell address, for example `word/document.xml`, `T1:R2:C2`, or `xl/worksheets/sheet1.xml`, `Assay!B2`.

Numeric candidates/limits outside finite safe integer range, with over 15 significant decimal digits, or with exponent underflow are held for manual decimal review instead of silently rounding into the core JavaScript-number comparison model. The original bytes remain the evidence authority.

`span.raw`, `span.fields.<field>.raw`, and their start/end offsets are exact substrings of the original XML part. Offsets are UTF-16 character offsets within that original UTF-8-decoded part. XML text token offsets preserve each original run/entity lexeme. Shared strings provide a second linked original content span. `span.line` describes the XML part's actual source line; **page is always null** because XML/OOXML coordinates are not PDF pagination. Rendering text into a new PDF does not become source evidence.

## Archive protections

Before extraction: maximum **5 MiB original**, **200 ZIP entries**, **10 MiB declared decompressed total**. The ZIP central directory, local headers, entry names, compression method, actual decompressed size, CRC and non-overlapping ranges must agree. Decompression is streamed and stopped when actual output exceeds declared bounds. ZIP64, split archives, unsupported compression, encryption/AES, symbolic links, duplicate names, absolute/traversal paths and malformed descriptors are held.

Macros, embedded active/binary objects and external relationships are forbidden. Internal relationship targets must remain inside the package and resolve to an original part. All package XML parts are scanned for hostile declarations, even unused parts. MIME, filename extension, main content type and package office-document relationship must agree. This protects controlled parsing; it is not a general malware-scanner certification.

## Limits and verification

This is a bounded implementation of controlled document parameter intake within **X04**. It does not implement arbitrary free-text document understanding, clinical interpretation, handwriting, arbitrary enterprise schemas or lossless PDF OCR. PDF/image extraction stays in the separate permission-gated vision candidate workflow, with human review and original page/region evidence.

Run `node tests/document-parser.mjs`. The proof at `docs/proof/document-results.json` records actual local fixtures and adverse-input checks. These results are engineering parser checks, not regulatory accuracy, professional validation or live model tests.
