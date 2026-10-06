# FORGE controlled lifecycle contract

Version: `forge-lifecycle/2`. Source identifiers are preserved in `LIFECYCLE_IDS`; feature maturity is never promoted merely by a label or a projection. The executed proof is `docs/proof/lifecycle-results.json`.

## Integration and authority

`POST /api/forge` uses authenticated workspace membership, same-origin checks, an idempotency key and the current `expectedVersion`. The command payload is `{action:"lifecycle",workspaceId,expectedVersion,operation,...}`. `command()` clones state, checks workspace role, calls `lifecycleAction`, persists a new workspace revision and records its audit event. `lifecycleAction` is a domain function for an already authorized cloned workspace; callers must not bypass the parent command.

Authoring roles: owner, admin, author. Review roles: owner, reviewer, approver. A technical admin cannot give scientific approval. An author cannot review their own authored lifecycle record. Closure owner/author cannot verify their own action. Every decision binds exact record ID, revision, digest, source/fact revisions, dependency revisions, policy version, workflow version and named reviewer; release remains false.

References are never arbitrary typed measurements:

- `evidenceRefs`: `[{fieldId,revision}]`, selecting current independently approved parsed facts. Numeric values, scientific context, source ID/version/hash and preserved original span are copied by the engine.
- `citations`: `[{sourceId,version,start,end,hash?}]`. UTF-16 character offsets must delimit a non-empty exact preserved text excerpt, at most 6000 characters. Binary originals without preserved text cannot supply a text citation.
- `predecessorId` optionally creates a new immutable version in the same collection. Only the latest logical version may be superseded. Scientific records and prior human decisions are never rewritten.

Creating a record returns `{recordId,collection,revision,digest,status}`. Review returns its decision identifier and target status. Effective statuses are CANDIDATE, NEEDS_REVIEW, APPROVED, REJECTED and STALE. An independently approved dependency becoming rejected, stale or superseded invalidates downstream use.

## Exact operations

The following keys accompany `operation`; only declared keys are accepted. Optional keys are marked `?`. Common keys mean `label`, `evidenceRefs`, `citations?`, `predecessorId?`. Required facts/citations differ as noted.

| Operation | Inputs | Working result and boundary |
|---|---|---|
| `entity` | common; `kind` | Controlled product, substance, site, material, process, method, specification, batch or equipment. Identity must occur in exact fact metadata or quoted original. |
| `relation` | common; `fromId`, `toId`, `relationType`; required citations | Typed approved endpoint entities, acyclic recorded genealogy. Relation types: RAW_MATERIAL_TO_INTERMEDIATE, INTERMEDIATE_TO_BATCH, BATCH_TO_FINISHED_PRODUCT, PROCESS_STEP_TO_CPP, PROCESS_STEP_TO_CQA, USES_EQUIPMENT, AT_SITE, USES_MATERIAL, USES_METHOD, HAS_SPECIFICATION, PROCESS_STEP_TO_STEP. Quoted human-curated relations are not machine proof of manufacturing qualification. |
| `requirement` | common; `parameter`, `market`, `sections`, `minCount?`; facts optional, citations required | Exact quoted parameter/jurisdiction, supported CTD section mapping and distinct fact count. Legal applicability remains qualified human work. |
| `rule` | common; `kind`, `market`, `parameters`, `expression`, `category?`, `requirementIds?`; facts optional, citations required | REQUIREMENT / CLASSIFICATION / WORKFLOW. DSL operators: ALL_APPROVED, NO_OPEN_CONFLICTS, HAS_SOURCE_CONTEXT, REQUIRED_PARAMETER (`count`), SOURCE_REVISION_CURRENT. No arbitrary code. Classification category must occur in original quote. |
| `template` | common; `sections`, `style`; facts optional, citations required | `style`: headingCase SENTENCE/TITLE; density COMPACT/TECHNICAL; referenceStyle SOURCE_ID_AND_REVISION/EXACT_SPAN; factOrder PARAMETER/BATCH/SOURCE. Display profile only, not publishing conformance. |
| `contentBlock` | `label?`, `draftId`, `draftRevision`, `market`, `citations?`, `predecessorId?` | Exact approved current draft with passing independent QC copied into a new controlled content candidate. Evidence derived by server. |
| `reuseContent` | `blockId`, `blockRevision`, `market`, `section`, `templateId?`, `requirementIds?`, `predecessorId?`, `reason` | Exact text reused across target controlled section with explicit dependencies. Scientific text unchanged; approval never inherited. |
| `dossier` | common; `productId`, `market`, `section`, `blockIds?`, `requirementIds?`, `stateLabel?` | Approved product–market–section–evidence mapping. DRAFT or RECORDED_FILING; filing label requires citation. Approval needs a configured market-matching obligation profile and actual coverage. No regulator acceptance claim. |
| `stability` | common; `batchId`, `timeRef` | Approved time fact in a recorded time unit plus measured facts for the exact batch and condition. Observed points only. |
| `comparability` | common; `changeId?`, `batchIds?`, `processIds?`, `stabilityIds?` | Descriptive comparison of facts with matching product, method, unit, condition and basis. No equivalence or disposition. |
| `transfer` | common; `stage`, `fromSiteId`, `toSiteId`, `processIds`, `batchIds`, `comparabilityId?`; citations required | Distinct approved sites; typed process/batch evidence. DEVELOPMENT / SCALE_UP / COMMERCIAL token must occur in cited original. No qualification claim. |
| `marketChange` | common; `productId`, `oldSourceId`, `newSourceId`, `changedParameters` | Changed parameters backed by exact approved facts from the selected new source and product. |
| `classify` | `changeId`, `ruleIds`, `market`, `label?`, `predecessorId?` | Matches approved exact-market classification rules. One category → NEEDS_HUMAN_DECISION; contradictory categories → CONFLICT; none → HOLD. Legal authority and automatic filing remain false. |
| `simulation` | `label`, `sourceId`, `replacements?`, `ruleIds?`, `predecessorId?`, `reason` | Replacement `{fromFieldId,fromRevision,toFieldId,toRevision}` binds selected baseline source and same product/parameter. Branch freezes impact and scientific snapshot. Live facts never changed; no automatic merge. |
| `regression` | `label?`, `sourceId?`, `ruleIds?`, `dossierIds?`, `branchId?`, `predecessorId?` | Reviewer executes at least one actual rule or dossier check. Stores individual checks, denominator and source dependencies. Empty profiles cannot pass; historical runs become stale when their dependencies change. Engineering evidence only. |
| `approve` | `id`, `revision`, `digest?`, `choice`, `reason` | Independent reviewer chooses APPROVE / REVISE / REQUEST_EVIDENCE / REJECT on exact current record. Conflicting classifications, uncovered dossiers and stale dependencies cannot be approved. |
| `haq` | common; `title`, `market`, `dossierIds?`, `requirementIds?`; citations required | Actual question and jurisdiction must occur in quoted original. Response is built from selected exact approved facts. |
| `haqOutcome` | common; `haqId`, `outcome`; citations required | Approved actual question dependency; outcome token RESPONDED / ACKNOWLEDGED / MORE_INFORMATION / CLOSED_REPORTED / REJECTED must occur in original quote. Independently approved/current evidence enters governed memory. |
| `closure` | `label`, `owner?`, `expectedChecks`, `dependencyIds?`, `citations?`, `predecessorId?` | Check `{operator,expected:{fieldId,revision},actual:{fieldId,revision}}`; operators EQUAL, CONTEXT_MATCH, WITHIN_RECORDED_LIMITS, CURRENT_APPROVED. Evidence derived by server. |
| `verifyClosure` | `id`, `revision`, `reason` | Independent reviewer verifies all expected checks. Exact outcome may close action or keep OPEN. No self-verification. |
| `reopenCheck` | `id`, `reason` | Reviewer rechecks recorded evidence and appends reopening invalidation where required. On-demand and source-change triggered; periodic scheduler not configured. |
| `correction` | `fromBlockId`, `toBlockId`, `reuseIds`, `reason`, `label?`, `predecessorId?` | Newer approved content version in the same lineage creates new downstream reuse candidates. Original reuse and prior approvals remain immutable; no approval transfer. |

## Real projections and specialist integration

`capability()` dispatches all implemented lifecycle X identifiers directly to `lifecycleProjection()`. X11 returns actual entities, relationships, dossiers and source hashes. X36 returns product–market–dossier–source mapping; X37 actual rule-backed candidates; X44 executes bounded approved rules; X45 maps quoted obligations to executable controls and dossier coverage. X40/X41 traverse causal dependencies only, excluding semantic genealogy and predecessor history from automatic blast radius.

A6/A7/A8/A13/A14/A15/A16/A17 return the actual corresponding records and explicit evidence boundaries. A2 reports controlled JSON/CSV/text/XML/DOCX/XLSX parsers; original-byte OOXML extraction is server only. PDF/image availability must be checked against authenticated server configuration, never inferred from a client projection.

Governed memory admits exact source-current approved facts and actual lifecycle approved/current outcomes, templates and content. Legacy free-text response-review comments and unbound legacy templates are excluded. Source changes and rejected dependencies remove stale outcomes from current retrieval; historical evidence remains in the audit record.

## Functional UI integration

Import `app/LifecyclePanel.tsx` in Workspace. Component props:

```tsx
<LifecyclePanel
 state={state}
 act={(action,data)=>act({action,...data})}
 form={form}
 role={role}
 userId={userId}
/>
```

`refresh` and `initialTab` are optional. Default role is viewer. All primary operations above have typed forms with stored-object selectors and exact approved-fact checkboxes; original citation editing checks exact source offsets before submission. Review/closure use the parent authenticated consent form. Modal inspection has visible Close, Escape, focus trapping and focus restoration. The source-backed evidence inspector shows frozen fields, revisions, hashes, original spans, citations and full dependency record.

Styling hooks (root CSS owns styling): `.lifecycle-workbench`, `.lifecycle-summary-grid`, `.lifecycle-boundary`, `.lifecycle-tabs`, `.lifecycle-record-grid`, `.lifecycle-record`, `.lifecycle-record-context`, `.lifecycle-content-preview`, `.lifecycle-results`, `.lifecycle-empty`, `.lifecycle-twin-map`, `.lifecycle-twin-column`, `.lifecycle-node`, `.lifecycle-check-list`, `.lifecycle-check-row`, `.lifecycle-source-selector`, `.lifecycle-impact`, `.lifecycle-impact-node`, `.lifecycle-trend`, `.lifecycle-modal-backdrop`, `.lifecycle-dialog`, `.lifecycle-form-grid`, `.lifecycle-form-field`, `.lifecycle-evidence-selector`, `.lifecycle-selection-list`, `.lifecycle-choice`, `.lifecycle-detail-grid`, `.lifecycle-citation`. Existing shared `.panel`, `.button`, `.dialog`, `.modal-backdrop`, `.status`, `.row-actions` classes are reused. Wide modal/forms and table overflow need mobile styling.
