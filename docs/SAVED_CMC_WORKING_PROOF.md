# Saved synthetic CMC working proof

Open `/working-proof` for the recruiter dashboard, or `/working-proof?view=working-proof` for the saved CMC Gap Assessment. The landing/recruiter section and workspace overview link to this case. Existing private workspaces and the session-only `/demo` sandbox are preserved.

The fixture is Drug X 100 mg immediate-release tablet, explicitly hypothetical. Existing FORGE commands preserve three synthetic originals, extract seven exact source-backed facts, record eight clearly labelled example review decisions, create one Module 3 draft candidate and run technical QC. The SYN-A assay conflict (98.6% versus 99.1%) stays unresolved. Dissolution is an explicit missing requirement in this exercise; no result is invented. Composition, procedures/validation and stability evidence remain gaps in the assessment.

The result is **HOLD**, not an accepted submission. The dashboard shows the same saved sources, facts, review decisions, draft, evidence graph and event history. Module 3 mappings are illustrative documentation locations, not a commercial applicability decision.

## Persistence and boundaries

`GET /api/working-proof` returns only the fixed synthetic fixture ID. On first access it creates the canonical record in D1 and immediately reads the stored row. Later visits return the same saved timestamp, source IDs, assessment revision and SHA-256. Concurrent initialization uses insert-on-conflict protection. Immutable SQL triggers prevent update or deletion. The server verifies the hash and synthetic/read-only/release=false boundaries on every read; storage failure shows unavailable instead of an unsaved fallback.

No private workspace, membership, account, professional approval or external provider call is created. There is no write endpoint for this public-safe sample. The recruiter view cannot change the canonical record. Example approvals of nonconflicting fixture values are marked synthetic; they are not qualified CMC/RA/QA sign-off. The application retains its existing Site sharing policy.

## Verification

- 7 synthetic domain checks: exact evidence spans/hashes, unresolved conflict, missing critical value, recorded evidence request, QC and blocked export.
- 8 compiled Worker/D1 checks: save/readback, stable concurrent reads, immutable record, isolation from customer workspaces, no write endpoint and dashboard route rendering.
- 88 existing core checks, 30 compiled account/security checks and 5 built public-surface privacy checks.
- Production build and TypeScript checks.

These checks demonstrate one synthetic workflow and its saved evidence. They do not establish professional accuracy, real customer benefit or regulatory validation.
