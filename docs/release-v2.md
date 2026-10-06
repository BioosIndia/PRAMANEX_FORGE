# PRAMANEX FORGE v2 engineering release record

Prepared 4 October 2026. This is the implementation and executed engineering evidence record for the current release candidate. Native deployment success is recorded separately by the Sites publishing workflow. This document does not assert that every source requirement is delivered or that a 6–12 month enterprise qualification program is complete.

## Connected implementation

Original uploads persist in R2 with a recorded hash and workspace-owned source record. Controlled XML and supported DOCX/XLSX parameter tables are parsed from those bytes. Candidate facts retain raw scientific lexemes and exact XML/package/cell spans. Unsupported, unsafe or ambiguous input stays on HOLD; it creates no partial accepted evidence. PDF/image vision uses the separately configured provider path and retains the human inspection gate.

Approved exact fact revisions support deterministic CMC drafts, technical QC, independent draft review and frozen controlled export records. Source-backed lifecycle records add product/site/batch identities, genealogy, requirements and bounded policy rules, controlled content reuse, dossier mapping, descriptive stability and comparability, market change candidates, authority-query outcomes and evidence-based closure. Every scientific approval binds a current revision and independent identity; source changes invalidate dependents.

Authenticated object grants permit explicit source/fact/draft/query/action sharing, notes and review requests with expiry and revocation. They do not inherit complete workspace access or scientific approval authority. An original source download additionally requires the explicit original-file permission. Native site audience remains a separate access boundary.

The durable parent runtime persists DAG workflows, leased tasks and events in D1. Successful authorized enqueue/control responses trigger bounded background draining (up to four cycles of three tasks) using the workspace returned by the server. Each task rechecks current source/workspace hashes and creator membership, commits through a guarded batch, and waits at actual recorded human gates. Pause, cancellation, replan, stale evidence, revoked access and exhausted retries prevent stale commits. Initial invocation plus three eligible automatic retries exhausts into an owned DLQ path. A scheduled handler exists; no periodic cron registration is established by this code.

The authenticated export endpoint renders real PDF, DOCX, HTML and technical handoff ZIP from the stored frozen export record. It exposes technical preflight, manifest and artifact hashes, correct MIME types and private no-store downloads. Client-supplied manifests cannot replace the server record. The ZIP contains real document formats, exact frozen JSON, evidence/reference CSVs and a FORGE technical XML index. It is not an eCTD submission package. All artifacts retain `release=false`; unsigned and signature-bound records are visibly distinct.

## Nine functional parts

| Source-defined part | Current implementation | Operational boundary |
| --- | --- | --- |
| Goal Interpretation & Planning Engine | Bounded goal-to-DAG planning and explicit replan generations | Supported goals are typed; unrestricted autonomous planning is not claimed. |
| Tool Integration Layer | Preserved original-file storage, parsers, controlled domain actions and optional provider adapters | LIMS/MES/QMS/RIM/publishing live credentials are unconfigured. |
| Memory Store & Access Layer | Persisted revisions, source-backed approved memory retrieval and history | No automatic authority transfer or learning from unapproved data. |
| Orchestration & Runtime Environment | D1 workflows/tasks/events, leases, CAS, background execution, retries, waits and DLQ | Event-triggered execution is implemented; periodic scheduler configuration remains separate. |
| Multi-Agent Collaboration Framework | Typed specialist tasks, bounded deterministic role execution and optional configured AI candidate authoring | The release does not claim eighteen independently running live LLM agents. |
| Human-in-the-Loop Interface | Exact-revision review, approve/reject, controls and independent human gates | AI and worker identities cannot approve evidence or grant release authority. |
| Safety & Policy Enforcement Layer | Same-origin writes, authenticated workspace/object access, source integrity, strict parsers and provider consent | Organizational security qualification and professional acceptance require separate proof. |
| Observability & Evaluation Stack | Persisted runtime events, jobs, audit, actual latency/usage when supplied and executed engineering proof | Missing provider usage/cost stays unmeasured; engineering results are not regulatory accuracy. |
| Governance & Compliance Module | Hash-linked audit, frozen provenance, independent decisions, versioned local rules and revocation | A privileged database administrator remains in the threat model; no compliance certification is claimed. |

## Executed proof

The latest results are machine-readable in `docs/proof/`. Counts below are separate engineering suites; they must not be advertised as professional accuracy or production validation.

| Suite | Executed result | Evidence covered |
| --- | --- | --- |
| Core domain | 88/88 | Source/fact/draft invariants, human authority, staleness, controlled export, retry budget and unsafe numeric/CSV input controls |
| D1/R2/API integration | 38/38 | Both immutable migrations; authenticated persistence; concurrent/revoked commit protection; XML extraction and HOLD; original replacement byte histories and selective staleness; revision idempotency; JSON/XML BOM hash/span preservation; lifecycle independent review; stored signed artifacts and corruption rejection |
| Controlled sharing | 38/38 | Explicit object scopes, expiry/revocation, redaction, shared notes, preserved binary sources and original permission |
| Durable runtime | 21/21 | Actual local D1/R2/API DAG execution, HITL, leases, retries, replan, concurrent worker, revoked replay, concurrent control, viewer tick and current response-review controls |
| Document ingestion | 35/35 | XML/OOXML exact spans, archive/active-content controls, ambiguity HOLD and actual workerd parsing |
| Expanded lifecycle | 58/58 | Source-backed entities/rules/reuse/dossier/stability/change/HAQ/closure and invalidation |
| File formats | 16/16 | True PDF/DOCX/HTML/ZIP, checksums, escaping, signature payload binding, unsupported glyphs and independent Python parsers |

The format check opened a seven-page PDF through an independent parser, verified Greek/scientific text and its exact frozen JSON attachment, parsed OOXML and the technical package XML, and checked ZIP CRCs and artifact checksums. API integration exercised actual stored signed downloads; identity in that local harness is an explicitly substituted authenticated fixture. Hosted sign-in behavior is not inferred from those mocks.

## Remaining release gates

- Live OpenAI credentials and explicitly pinned authoring/vision models; real provider evaluation rather than protocol fixtures.
- Periodic native scheduling, if required, and secure independent worker credentials.
- Actual external-system connector credentials, agreed source contracts and controlled handoff procedures.
- Hosted user-journey and rendered desktop/mobile browser verification; browser preview was unavailable in this managed Sites session.
- Professional CMC pilot acceptance, organization-specific security/identity qualification, production load, recovery and operational procedures.
- Source requirement coverage that remains specified or configuration-dependent; the source registry and coverage matrix are authoritative for individual maturity labels.

No engineering test in this release proves regulatory acceptance, clinical evidence, legal clearance, batch release, global operating scale or a complete regulated production system.

Final source additionally verifies that readiness inspection cannot silently mutate saved scientific state. The seven executed engineering suites total 294 passing cases; these remain separate bounded evidence, not production acceptance.
