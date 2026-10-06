# Controlled artifact and publishing handoff contract

FORGE renders real DOCX, PDF and HTML documents from a frozen controlled evidence manifest. It also generates evidence/reference CSV tables and a ZIP technical handoff. Every artifact states `release=false`. Formatting cannot approve a fact, restore a stale live draft, finalize an unsigned export, establish eCTD conformity or authorize a regulated submission.

## Server interface

```js
import {
  formatEvidence, preflightPackage, packageEvidence, evidenceTables
} from './lib/format-export.mjs';

// Fetch the export record through authenticated workspace/object access checks.
// Pass its stored manifest and signature metadata, never client-provided versions.
const artifact = await formatEvidence(exportRecord.manifest, {
  format: 'pdf', // 'docx' | 'pdf' | 'html'
  exportRecord: {
    id: exportRecord.id,
    hash: exportRecord.hash,
    finalized: exportRecord.finalized,
    signature: exportRecord.signature
  }
});
// artifact: {bytes: Uint8Array, mime, filename, sha256, checks, release:false}

const checks = await preflightPackage(exportRecord.manifest, {
  exportRecord,
  profile: 'FORGE_TECHNICAL_HANDOFF/1'
});
// checks: {ok, checks, files, indexXml, signatureState, manifestChecksum,
//          profile, release:false, boundary}

const bundle = await packageEvidence(exportRecord.manifest, {exportRecord});
// application/zip: DOCX, PDF, HTML, evidence-table.csv,
// reference-register.csv, manifest.json, index.xml, technical-checks.json.
```

The formatter contains no network transport, filesystem access, credential handling or publishing action. The caller owns session authentication, tenant/object authorization, consent, server-owned export lookup and download response headers. The caller must not treat checksum-binding alone as authentication of a client-provided signature record. No source original is disclosed automatically by these artifact functions.

The renderer clones the supplied manifest. It never looks up or substitutes live workspace state. A historical snapshot therefore retains the source versions, original value lexemes, normalized values, methods, scientific basis, specification limits, citations, source hashes, frozen statuses and recorded review decision that existed when it was exported. Historical export display does not grant current-use approval to superseded evidence.

## Artifact formats

| Artifact | Actual technical structure | Evidence boundary |
| --- | --- | --- |
| DOCX | OOXML ZIP, local/central ZIP records and CRC-32, content types, relationship parts, document/styles XML, scientific tables, frozen manifest JSON | Document presentation is generated; it is not digitally signed OOXML or a regulator-qualified template. |
| PDF | Valid multipage PDF with an embedded licensed Unicode font subset and a `frozen-manifest.json` attachment | No PDF/A, agency validator, qualified accessibility tagging or cryptographic PDF signature claim. |
| HTML | UTF-8 document, escaped data, local styles and restrictive content security policy; no script, live action or external reference fetch | Readable static evidence view; source citations are identifiers, not guessed external links. |
| Evidence table CSV | Explicit raw and normalized values/units, method, basis, raw and normalized limits, status and source citation | Spreadsheet formulas are not accepted; dangerous formula-like text visibly rejects CSV generation rather than silently changing values. |
| Reference CSV | Exact source ID, filename, frozen version, hash, type, source permission, purpose and data label | Retains the recorded source reference; original source bytes are not included. |
| Technical ZIP | Flat named artifacts with checksums, frozen manifest JSON and a FORGE XML index | FORGE technical publishing handoff, not an eCTD submission package. |

PDF uses a licensed DejaVu Sans subset renamed **FORGE Evidence Sans**; see `docs/font-license.txt`. It preserves supported Latin, Greek, common scientific symbols, superscripts and subscripts. Unsupported characters, including unsupported scripts, trigger `UNSUPPORTED_PDF_CHARACTER`. DOCX and HTML retain those Unicode strings without altering their meaning. The renderer does not substitute scientific symbols with look-alike ASCII.

PDF visual text wraps and uses presentational spacing. The attached JSON contains the exact original source span characters. DOCX contains the exact frozen JSON in `forge/manifest.json`; the technical ZIP contains `manifest.json`. Original raw numerical lexemes remain separately visible from any normalized value, including approved unit-conversion rules.

Unsigned documents visibly state **UNSIGNED**. The exact stored manifest checksum must match the caller's server-owned export record. A finalized record additionally needs a recorded signer, controlled reason, timestamp and signature revision hash that matches the frozen scientific signing payload. That payload must agree with the rendered draft, approved evidence set, approval decision, policy and workflow version. Display of this metadata is a signature-bound technical record, not independent signature authentication, qualified identity procedures or legal/regulatory signature validation.

## Technical preflight

Preflight checks:

- Accepted manifest version, bounded arrays, safe text and valid frozen time.
- Explicit `release=false`.
- A 3.2.P or 3.2.S section label, title, supported narrative, evidence table and reference register.
- Approved frozen draft, passing recorded technical QC and exact-revision human approval with reason and time.
- Unique fact/source IDs and agreement of the draft field set.
- Source ID/version/hash/span integrity for each approved fact.
- Agreement of each statement with its cited value, unit and source revision.
- Raw value and raw unit preservation separately from normalized values.
- Recorded source permission/purpose.
- Optional stored-manifest checksum and signature payload binding.
- Safe unique artifact filenames, byte counts and generated SHA-256 checksums.

The XML index is rooted in `<forge-package profile="FORGE_TECHNICAL_HANDOFF/1" release="false">`. It describes the controlled section, exact manifest checksum and handoff artifacts. It is deliberately identified as FORGE technical XML. A requested unknown regional/eCTD profile returns a failed `TECHNICAL_PROFILE` check. No agency conformance result is fabricated.

Complete original source bytes are absent from the frozen metadata manifest; this formatter does not reverify their hashes against original files. That limitation is a visible warning. Other visible exclusions are regional Module 1, agency-specific controlled vocabularies, sequence metadata, lifecycle operations, agency eCTD validation and PDF/A qualification. Approval of a section-level technical handoff is not approval of a complete dossier.

## Resource limits and failures

A manifest is limited to 1 MB UTF-8 JSON, 500 facts, 500 sources, 500 statements and nesting depth 30. PDF generation stops at 120 pages. Preflight accepts at most 12 handoff artifacts, each at most 12 MB. Filenames are plain ASCII and cannot contain paths, traversal, hidden prefixes or controls. File extensions must match the generated format. XML-invalid controls and lone Unicode surrogates reject generation.

API callers should surface the structured error `code` and user-readable message. They should not invent fallback success, silently rename HTML to PDF/DOCX, or convert unsupported scientific text to ASCII. Original evidence and server export records remain unchanged on formatting failure.

## Executed engineering proof

Run:

```sh
node tests/format-export.mjs
```

The suite reads the generated DOCX ZIP records and CRCs, asserts exact XML and frozen JSON, opens the PDF through an independent Python PDF parser, checks extracted Greek/scientific text and frozen JSON attachment, parses every OOXML part and the technical package XML, checks all recorded artifact checksums, verifies snapshot independence, and exercises citation gaps, value mismatches, stale/released state, signature/checksum mismatches, unsupported glyphs and unsafe names. Results are written to `docs/proof/export-results.json`.

These are synthetic file-format and engineering controls tests. They do not measure regulatory accuracy, agency acceptance, production load or organization-specific validation.
