# PRAMANEX FORGE — Individual Master Build and Proof Checklist

**Source of truth:** `PRAMANEX_FORGE_Enterprise_SaaS_Master_Blueprint(1).pdf` and the supplied joint master checklist. This is a planning/acceptance contract, not proof of a working app. Each box stays open until linked to a commit, fixture, expected/actual run and review record.

**Evidence record for every item:** `ID | current maturity | exact artifact | commit/version | test case & actual result | reviewer | date | limitation`. Allowed maturity sequence: SPECIFIED → BUILT → TESTED → LIVE DEMO → PILOT → VALIDATED USE. A PDF, UI mock or unchecked box cannot promote a status.

## 1. Lock the product identities before writing code

| Product | Single job | Human authority | First reviewable outcome |
| --- | --- | --- | --- |
| **FORGE** — CMC Digital Thread, Authoring & Lifecycle Integrity OS | Controlled CoA/batch/process/document source → atomic CMC fact → source-linked Module 3 draft → independent QC → revision-bound review → change impact | Qualified CMC/RA/QA reviewer decides facts, comparability, reporting and release | A permitted source-to-fact-to-draft-to-review-to-change-dependency case with exact evidence |
| **LEDGER-Q** — Quality, Compliance & AI Assurance OS | Controlled quality requirement/event → gap/risk → investigation/CAPA/change/training → human QA decision → effectiveness and audit, linked to AI use/release assurance | Authorized QA reviewer decides root cause, disposition, CAPA effectiveness and AI release | One controlled quality event and one AI version-change case that reopen each other's dependent controls |

- [ ] **Canonical names:** FORGE and LEDGER-Q. Older project aliases are historical references only; no parallel app, feature numbering or invented third platform.
- [ ] **Intended use and exclusions:** define exact target user, document types, jurisdictions, company context, permitted data, input/output contract, human decision and explicit unsupported states. No customer confidential record without permission and controls.
- [ ] **One source of specs:** FORGE's *Final Product Architecture & Moat Blueprint* governs F01–F14, F-P01–F-P05, X01–X68, P01–P04, A1–A18, D01–D22 and L01–L12. LEDGER-Q's *Integrated Master Specification* governs F01–F20 and L01–L12. Put a traceable spec matrix in each repository; changes require a dated decision record.
- [ ] **Maturity words:** `SPECIFIED` means written contract, `BUILT` means runnable code, `TESTED` means executed expected/actual cases, `LIVE DEMO` means hosted flow verified, `PILOT` means permitted real users, `VALIDATED USE` means organization-specific qualification. Never promote status by changing website copy.

## 2. BEACON lessons turned into preventive gates

| Failure pattern to prevent | FORGE / LEDGER-Q preventive check | Required proof |
| --- | --- | --- |
| Listing a feature in a PDF or card as if it executes | Feature ledger with `SPECIFIED / BUILT / TESTED / LIVE / REVIEWED` and commit/link for each ID | A reviewer can click a working flow; planned features are visibly labelled |
| Catalog/category page mistaken for original source | Open exact CoA/SOP/batch/quality record and record original ID, version, page/table/cell or precise span where technically possible | Deep link and archived source; broken link produces `SOURCE_FAILED` or `EVIDENCE_GAP` |
| First snapshot or failed parser reported as a change/no change | Baseline, parse failure, corruption, inaccessible record, unchanged record and real content delta are different states | Adverse fixture and UI/API replay for each |
| Hash treated as interpretation or immutable ledger | Hash original bytes and preserve normalization/parser version; replay source and audit history; limit administrator rights | Raw file hash, predecessor, reconstructed historical record and stated tamper model |
| Document status or units inferred from a phrase | Preserve status/method/limit/condition and raw value; contradiction remains open | Deliberate draft/effective conflict and unit/assay-method mismatch case |
| Missing or invented citations in AI text | A material claim must resolve to stored source ID, version and exact location; unsupported output becomes `HOLD` | Citation checker rejects an invented, offset-mismatched or stale source |
| One agent creates and “independently” approves output | Separate author/QC/reviewer roles and execution records; no automatic regulated disposition | Negative role test; distinct reviewer identity for decision and closure |
| Approval survives changed evidence or concurrent clicks | Bind decision to exact source/data/rule/model/revision; invalidate only dependencies changed; atomic expected-revision guard | Stale review rejected, old history retained, affected work reopened |
| `DONE` confused with verified closure | Store intended action, before/after implementation evidence, independent effectiveness/closure check | Unproved DONE remains UNVERIFIED; failed effectiveness reopens |
| Claimed 117 tests, 0% hallucination, 100% accuracy or “Part 11 compliant” | Freeze version/fixtures; show actual denominators and limits; intended-use QA assessment separately | Reproducible test log and independent review report; no invented rate/certificate |
| Pretty landing page with dead or misleading CTA | Navigation to real task; PDF opens PDF, source opens exact source, authenticated links go to app, blog links render | Desktop/mobile browser walk-through with every critical link and form |
| Protected page redirecting to raw HTML or category page | Auth and session regression test for direct deep links; return accessible sign-in handoff and intended destination | Open dashboard, event, review and source URL in fresh session |
| Backend/API reported healthy while queue/DB is down | Readiness includes DB, broker, worker, migration and storage; visible retries and exhausted-job queue | Disconnect each dependency and inspect operator state |
| Synthetic simulations presented as RA/QA accuracy or user outcomes | Label synthetic fixtures; independent blinded domain answer key and consented user pilot measured separately | Case list, reference answer date, reviewer record, TP/FP/FN/TN or task-specific matrix |
| Graphs/infographics shown with fabricated metrics | Derive every count and edge from saved records; show time/window and empty/failure states | Click a visual node to underlying evidence; no invented “live” count |
| Too many repository ZIPs and unclear deploy target | One canonical GitHub repo per project, release tag, tested commands and exact host/root directory | Fresh clone/build/deploy test and release manifest; no secrets |

**Non-negotiable rule:** finding a defect is not failure of the project; hiding a defect, inventing a result or skipping its regression proof is a release failure. Fix → adverse test → rerun affected chain → update evidence before claiming completion.

## 3. Shared implementation order for both projects

### Gate G0 — define the narrow MVP

- [ ] Write `INTENDED_USE.md`, `SCOPE_AND_EXCLUSIONS.md`, `FEATURE_MATRIX.md`, `DATA_PERMISSION.md` and `CLAIM_REGISTER.md`. Make the first demo case and two negative cases explicit **before** choosing an agent framework.
- [ ] Freeze at least one source-supported golden case and the expected answer independently of the implementation. Use synthetic, public or permitted de-identified material; mark which. No “real company” story assembled from invented facts.
- [ ] Draw the evidence/decision state machine and specify `BASELINE`, `CANDIDATE`, `UNKNOWN`, `EVIDENCE_GAP`, `SOURCE_FAILED`, `AWAITING_REVIEW`, `APPROVED_FOR_ACTION`, `REJECTED`, `STALE`, `CLOSED_WITH_EVIDENCE` as applicable. Define transitions, ownership and retry bounds.

### Gate G1 — secure foundation

- [ ] Use shared **L01–L12** once per project: L01 tenant/workspace; L02 identity/roles; L03 authorized intake; L04 originals/versioning; L05 parsing/normalization; L06 scientific/quality/policy context; L07 evidence/dependency graph; L08 durable workflow; L09 bounded specialists; L10 safety/human decision; L11 evaluation/audit; L12 integration/operations.
- [ ] Non-superuser tenant-scoped DB role and enforced row/object/vector/export isolation. Test cross-tenant access, revoked membership after a pause, stale review, concurrent approval and forged source IDs.
- [ ] Protect ingestion: permitted file types and size, malware/active-content handling appropriate to deployment, allow-listed remote hosts, private-network/redirect defenses, safe decompression, timeouts and rate limits. A skipped page/table/OCR extraction must be visible.
- [ ] Raw bytes, source metadata, lineage, parser version, extraction coordinates, model/prompt configuration and revision hashes persist before analysis; secrets never appear in GitHub, logs or browser variables.

### Gate G2 — one vertical slice end to end

- [ ] Build **one thin but real flow** through intake → versioned evidence → typed candidate → independent checker → named four-action human review → action/closure state → audit export. Demonstrate an unsupported passage, a source failure and stale revision. No arbitrary “agent swarm” before this works.
- [ ] Add features in dependency order, reusing the same records and controls. Each specialist has typed input/output, max attempts, trace ID, exact source revision and failure state. The parent workflow owns persistence, retries, waits and writes.
- [ ] Seed a permitted case; then open it from a fresh browser session on desktop and phone, including auth redirect and direct original-source/PDF navigation. Empty and failed states must be understandable without the presenter.

### Gate G3 — release evidence

- [ ] CI runs schema migration, static checks, unit, integration, API contract and meaningful adverse cases. Record command, commit, date, actual pass count and failures; no fabricated coverage statistic. Validate UI with real browser interaction, not only compile success.
- [ ] Exercise interrupted worker, retry/DLQ, restored backup, tenant negatives, citation mismatch, reviewer revocation and rollback. Audit export must reconstruct the same candidate, source and decision after restore.
- [ ] Publish one GitHub release with README, architecture and data flow, setup, env template, migrations, tests, fixtures/license, API contracts, threat model, limitations and deployment runbook. No committed credentials, proprietary documents or fake API response.
- [ ] Publish a public demo and case study only after its exact routes and original evidence links open; attach screenshots captured from the release and show the version/limits. Posts and blog can describe that proof, not replace it.

## 4. FORGE: precise sequence from source to CMC change

The final architecture contains **14 canonical features (F01–F14), five F-P controls, 68 proposed X capabilities, 18 bounded agent roles and D01–D22 assurance controls**. These are a target map, not a mandate to create 68 UI tabs or run 18 models in the MVP.

**P0 rule from the FORGE blueprint:** before claiming the expanded architecture, F01–F14 and F-P01–F-P05 must be runnable and traceable. If starting with no FORGE implementation, build the phases below incrementally; do not label P0 complete until the full canonical baseline passes its own tests.

| Phase | Build and feature IDs | Exit proof to save | Avoid |
| --- | --- | --- | --- |
| **F0. Contract and sample** | Intended CMC use; permitted CoA/batch record and Module 3 target section; F01 registry | Signed-off sample permission, source version/hash, expected facts and reviewer rubric | Using a fabricated “real” CoA, a copyrighted company batch record or an unsupported eCTD claim |
| **F1. Evidence + atomic fact** | F01–F07, F-P02; X01/X04/X06/X07/X14/X15: source intake, field extraction, raw and normalized values, exact trace, completeness, anomalies, conflict and dependency | Open original file at correct page/table/cell where available; missing field, OCR failure, conflicting assay, altered value and unit-method mismatch tests | Normalizing without method/temperature/basis or manufacturing an absent value |
| **F2. Batch and process state** | F08; X11–X13 plus X16–X22 as needed: versioned digital twin, genealogy, comparability | Trace material → batch → process → specification → fact, with historical replay and limitations | Calling a statistical trend a failed batch or making autonomous disposition |
| **F3. Draft and independent QC** | F09/F10/F13/F14; F-P03/F-P04; X23–X34: structured Module 3 content, evidence-bound authoring, separate numeric/citation/completeness QC and controlled export | One 3.2.S or 3.2.P section from approved facts; QC catches a deliberately wrong number and missing citation; named reviewer correction/export | “eCTD-ready” without publishing-system preflight; author agent grading its own output |
| **F4. Change blast radius** | F11/F12; F-P01/F-P05; X36–X48: revision-bound review, market matrix, inclusion/exclusion reason, dependent staleness and regression | Change one source fact; only affected section, batch, market and approval reopen; unaffected object has evidence-backed exclusion | Reopening everything blindly or leaving old approval active |
| **F5. Filed versus current** | X49–X52: time machine, submission snapshot, comparator | Restore the exact prior filing package and show changed current-state facts side by side | Regenerating history with today's parser, prompt or requirement |
| **F6. HA question loop** | X53–X58: versioned HAQ, precedent retrieval, source-linked response candidate and approved memory | A real/public-safe or synthetic-labelled question → cited draft → review → versioned outcome | Invented precedent, prediction labelled as authority expectation |
| **F7. Closure and integration** | X59–X68: debt register, drift, approved correction, RIM/QMS handoff, independent closure and command center | Mock connector contract or permitted live integration; before/after proof; independent closure; reopened case after new contrary evidence | Promising Veeva/LORENZ/LIMS integration when only an interface mock exists |
| **F8. Hardening** | P01–P04 planes, L01–L12, D01–D22; parent workflow with A1–A18 **only where the bounded task needs them** | Tenant and source negatives, D01–D15 executed cases, D16–D22 denominated operational measures, backup restore and document replay | Claiming “18 active agents” because 18 names exist in a diagram |
| **F9. Public demo and pilot** | Responsive UI, original-source links, safe data, exact review and failure states | Three-minute uncut interaction plus case study and limitations; qualified CMC reviewer answer key and permitted user pilot separately | Landing animation presented as working CMC operation |

### FORGE control checklist

- [ ] F01–F14 each have a route/API, stored record, positive and adverse fixture, test log and status. F-P01–F-P05 are enforceable behaviors, not badges.
- [ ] P01 evidence integrity, P02 state/history integrity, P03 change/lifecycle integrity and P04 submission/decision integrity map to named tests.
- [ ] X01–X68 are recorded in a **four-column coverage ledger**: ID, target phase, implemented artifact, current proof. Later-phase X items remain `SPECIFIED` until exercised. Do not erase or silently rename an ID.
- [ ] A1–A18 roles are logical specialists under **one deterministic parent**; begin with the minimum actual tasks. Enforce A10 author ≠ A11 QC ≠ human approver. A17 cannot close its own action.
- [ ] D01–D22: source/connector contracts, extraction/unit tests, cross-document/dossier regression, requirement coverage, simulation/branch/review, shadow model, versioning, frozen fixtures, corruption/connector failures, restore, traceability/freshness/accuracy/conflict/latency metrics and correlation-ID observability. A metric remains `NOT_MEASURED` without denominator and period.
- [ ] The 35-stage end-to-end workflow can be replayed in **two linked demos**: (1) source → fact → draft → QC → human → filing snapshot; (2) change → impact → regression → stale decision → new human action → closure → replay. Do not require all 35 screens for a recruiter MVP.

### FORGE full target-ID coverage register

This register prevents a later phase from being forgotten. `SPECIFIED` is the default until its own artifact and executed proof exist.

| IDs | Target capability group | Phase / non-negotiable demonstration |
| --- | --- | --- |
| X01–X05 | Connector mesh, adapter SDK, contract drift, multimodal and paper-record ingestion | F1/F8; broken contract, corrupt file and scan uncertainty visible |
| X06–X10 | Atomic fact compiler, unit/method context, ontology, regulatory knowledge and requirement-to-data mapping | F1; raw and normalized values plus source and rule versions |
| X11–X22 | Digital twin, batch/process genealogy, evidence/dependency graph, consistency, specification, stability, comparability, trend and scale-up | F2; one traceable batch/process graph and explicit interpretation limits |
| X23–X35 | Structured content, Module 3 authoring, bounded AI, independent QC, formatting/preflight/readiness, CDMO collaboration | F3; statement-level provenance, QC error catch and scoped partner access before claiming collaboration |
| X36–X48 | Market matrix, variation candidate, simulation, blast radius, non-impact proof, selective staleness, regression, policy-as-code and approval invalidation | F4; change one fact and inspect included and excluded dependencies |
| X49–X52 | Decision replay, state time machine, submission snapshot and as-submitted comparator | F5; reproduce the old evidence and show current divergence |
| X53–X58 | HA question, precedent, evidence-bound response, dependency, outcome memory and query prediction | F6; approved precedent only; prediction never phrased as fact |
| X59–X68 | Decision debt, drift, correction propagation, RIM/QMS handoffs, closure verification/monitoring, knowledge and command/radar | F7; independent closure and explicit mock-versus-live connector status |

| Bounded roles | Practical rollout |
| --- | --- |
| A1–A5: connector, multimodal parser, fact extractor, unit/method normalizer, consistency critic | Bring into F1 only as needed; each writes a typed candidate or exception, never unreviewed truth. |
| A6–A9: genealogy, regulatory requirement, comparability, blast-radius | Add for F2/F4 when the corresponding source and dependency data exist. |
| A10–A13: author, independent QC, readiness, variation candidate | Separate the QC principal and human reviewer from authorship; variation is a suggestion. |
| A14–A18: query predictor, HA response, decision integrity, closure verifier, audit/replay | Add for F5–F7; predictor cannot invent precedent, closure verifier cannot self-close, audit agent cannot rewrite history. |

| Assurance IDs | Executed proof cluster |
| --- | --- |
| D01–D06 | Source contract, field extraction, conversion, cross-document/dossier regression and Module 3 coverage fixtures |
| D07–D12 | Change simulation, draft/rule branch, human merge, shadow model, runtime versioning and frozen scientific cases |
| D13–D15 | Corruption/failure chaos, connector retry and restore-plus-filing reconstruction |
| D16–D22 | Traceability/freshness SLOs, extraction/conflict metrics, readiness/change latency and full correlation-ID tracing; publish actual denominators |

## 6. Evidence, UX, GitHub and deployment package for each project

| Deliverable | Acceptance rule |
| --- | --- |
| Repository | One canonical, fresh-cloneable GitHub repo with README, architecture/feature matrix, schema/migrations, source/fixtures, tests, CI, env example, deployment runbook and release tag. Public repo only after secret/document-rights scan. |
| Data and rights | Synthetic versus public versus permitted company data labeled. Consent and retention documented. Never package patient, batch, employee or proprietary records into a portfolio ZIP. |
| Working UI | Task-first dashboard: source/intake, exact evidence, conflict/gap, graph with clickable edges, human queue, action/closure, history/export. Meaningful empty/error states; mobile, keyboard and screen-reader labels checked. |
| Visuals | Graphs are projections of persisted records with denominator, timestamp and drill-down. Use source→fact→document for FORGE and requirement→event→CAPA/training↔AI assurance for LEDGER-Q; no fake live meter. |
| Demo | One real 2–3 minute screen recording of actual current UI with truthful narration/captions, original source where allowed, deliberate failure and named human gate. Edited explainer labeled as guided tour. |
| Case studies | At least two per product on separate pages: normal source-supported flow and a meaningful adverse/change/recovery case. Include input, expected result, actual result, reviewer boundary, exact artifact and limit. |
| Content | Landing feature claims link to functioning route; blog and LinkedIn drafts cite actual tests and a captured artifact. Recruiter one-pager matches GitHub, demo and proof table exactly. |
| Deployment | Authenticated frontend, API, durable worker/queue and DB have monitored readiness and backup/restore runbook. Test exact deep link and document link after deploy; preview first, promote only after smoke test. |
| Human validation | Qualified domain reviewer freezes answer key before seeing output. Report confusion/error matrix and citations with denominators; real-user pilot separately captures task time, corrections and usability. |
| Claims | Status table says what is designed, built, tested, live, pilot-reviewed or organization-validated. No job, salary, “world-first,” regulator approval or 100% accuracy guarantee. |

## 7. Fast operating cadence without repeating BEACON's rework

1. **Day 0:** Freeze scope, source permissions, expected case and negative fixtures; choose one canonical repo. Reuse BEACON's **patterns** for tenant, state, evidence and review, but never copy its source rules or test counts as FORGE/LEDGER-Q proof.
2. **First slice:** deliver a functioning source → evidence → candidate → human → audit path before an expansive homepage, agent roster or competitor feature list.
3. **For each new feature:** implement one contract → one adverse case → run focused tests → inspect UI/API → update feature ledger → merge. Batch related work, but do not wait until the last day to test.
4. **Every deployment:** preview → auth/source/deep-link/browser checks → worker/DB readiness → publish → record URL, commit and real test output. Roll back visibly if a release gate fails.
5. **Every public post:** attach the exact artifact from the same version. If the artifact is missing, publish the design as a proposal, not a completed feature.
6. **At the final pilot gate:** obtain the independent CMC/QA reviewer and consented users; report mistakes and corrections. This is the only path to a credible real-world outcome claim.

### Definition of “done”

- **FORGE demo done:** the F01–F14/F-P01–F-P05 canonical baseline is runnable; one permitted CMC source yields traceable typed facts, source-bound Module 3 content, independent QC, named human revision, selective change impact and replay on a live checked UI. Expanded X01–X68 may remain explicitly planned.
- **LEDGER-Q demo done:** one source-linked quality case and one AI assurance case show exact provenance, human QA gate, bidirectional invalidation, correction firewall, governed release state, effectiveness/closure and historical replay on a live checked UI.
- **Production/validated done:** a real organization defines intended use, approves security and quality controls, conducts independent domain testing and real-user operation, and signs the release. A checklist, synthetic test or self-assigned RA/QA persona cannot substitute.

**Next execution step:** start FORGE Gate G0/F0 and F1; use this checklist as the acceptance contract. In parallel, LEDGER-Q can freeze Q0/Q1 cases, but implementation should reuse the proven evidence/review foundation rather than launch two disconnected full builds at once.

## Immediate handoff and acceptance register

- [ ] Freeze the intended user, one permitted synthetic/public-safe case, source rights and excluded uses.
- [ ] Create one canonical implementation repository and copy this checklist into `/docs/acceptance.md`; retain the source blueprint and decision log.
- [ ] Assign owners for domain review, data rights, security and engineering; no self-approval of regulated decisions.
- [ ] Build the G2 thin slice, attach adverse fixtures and execute a browser/API replay.
- [ ] Publish a status table that matches the actual repository, live route and evaluation logs.

