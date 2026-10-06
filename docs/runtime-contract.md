# FORGE durable parent runtime contract

Version: `forge-durable-runtime/2`. This implements bounded candidate workflows and human waits. It grants no scientific, regulatory, batch-release or organizational authority.

## Persistent objects

`runtime_workflows` owns goal, creator, generation, state, expected workspace revision/hash and bounded configuration. `runtime_jobs` owns typed DAG node, dependencies, exact source references, attempts, due time, lease and result/failure. `runtime_events` appends enqueue, claim, completion, wait and control evidence. Scientific artifacts also enter the workspace revision and audit hash chain.

Canonical SQL is exported as `RUNTIME_SCHEMA_SQL` in `lib/runtime.mjs`. Deployment migrations must create all three tables before the API is exposed.

## User/API contract

- `GET /api/runtime?workspace=<id>` requires hosted identity and active workspace membership; returns `{workflows,jobs,events,runtime}`.
- `POST /api/runtime`, `action: enqueue`, requires same origin, active permission to plan, `Idempotency-Key`, workspace ID and exact `expectedVersion`. Bounded goals are `PREPARE_CMC_DRAFT`, `ASSESS_SOURCE_CHANGE`, `RESPOND_HAQ`, `CONTROLLED_EXPORT`.
- Enqueue options: `sourceId`, `draftId`, `title`, `section: 3.2.P|3.2.S`, actual authority `question`, `mode: DETERMINISTIC|AI_ASSISTED`, and explicit `providerPermission: true` for the AI mode.
- `action: control` requires workflow ID, exact `expectedWorkflowVersion`, `control: pause|resume|cancel|escalate|replan|manualFallback`, and a meaningful recorded reason. Control grants no human approval.
- `action: tick` requires the current user's same-origin authenticated request and workspace control permission. Maximum three tasks per request.
- `action: workerTick` requires an opaque server-only `FORGE_WORKER_TOKEN` as a bearer credential. Maximum eight tasks per cycle. A token cannot grant source access to a revoked workflow creator.
- `workerCycle({workspaceId,userId,limit})` is exported for a trusted worker `ctx.waitUntil` hook after an authorized enqueue/control response. A scheduled worker can call `workerCycle({limit:8})`. The scheduler must be configured explicitly; a deployed hook does not by itself prove periodic scheduling exists.

No public GET triggers work. Worker authentication is distinct from human identity and cannot review or approve facts, drafts, outcomes or closure. No secret is returned in runtime overview.

## Execution and recovery

Each node waits for its actual completed dependencies. Source checks, deterministic extraction/normalization/consistency, impact, governed memory retrieval, bounded authoring, independent deterministic QC, readiness and unsigned controlled packaging execute through the same domain invariants as interactive actions.

A worker claims one node with a 90-second lease and compare-and-swap version. It binds the exact current workspace revision/hash and current original source IDs, versions and hashes. A task finishing after pause, cancel, replan, source edit, lease expiry or membership revocation cannot commit its output. Workspace, artifact audit, exact snapshot, workflow cursor and task completion commit in one guarded D1 batch. A worker crash before the batch leaves an expiring lease; another worker reclaims the task. A crash after the batch leaves the completed node visible and cannot create another scientific artifact.

Transient provider failures use **initial invocation plus at most three automatic retries**, respecting the source PDF's wording. Delays are 2, 4 and 8 seconds; retry count is `attempts - 1`. Retries are only eligible for transient HTTP/provider or timeout failures. Exhaustion becomes DLQ with recorded failure and a manual owner path. No error becomes a successful candidate.

Missing provider configuration or consent becomes HOLD. No alternate model is selected automatically. `manualFallback` explicitly changes the parent to deterministic mode, invalidates active leases, records the reason and creates a fresh bounded attempt budget for unfinished tasks. It creates candidates and retains all human gates; it never substitutes model output or approval. PDF/image work still requires actual configured vision or a verified manual structured transcript.

An external workspace edit puts the parent on HOLD. `resume` explicitly adopts the current workspace revision and re-evaluates the outstanding human gate. `replan` creates a new DAG generation; previous task results remain visible. Run IDs and exact hashes make this distinct from silently pretending the old inputs were current.

## Human waits and source authority

`HUMAN_FACT_REVIEW` requires current recorded approved facts, no required-data gaps, unresolved conflict, uncertain fields or unreviewed candidates. `HUMAN_DRAFT_REVIEW` requires actual current exact-revision named human approval plus passing technical QC. `HUMAN_RESPONSE_REVIEW` requires independently reviewed current response evidence as bounded below. These nodes inspect recorded decisions; they never invoke the review/approve command.

The legacy `HUMAN_RESPONSE_REVIEW` node inspects only the prepared response: a different named reviewer, the exact reviewed response revision and current approved source hash/version are required. Its output explicitly states `outcomeRecorded=false`; it cannot transform a review comment into an authority outcome or precedent. Actual authority queries and outcomes require the separate source-backed lifecycle records and controls.

The change-review gate requires a reasoned source change operation. A source revision should trigger replan so extraction and descendants rerun from the current evidence rather than reuse an old snapshot.

Structured JSON/CSV/text uses deterministic raw-span extraction. Typed XML, DOCX parameter tables and XLSX controlled parameter worksheets are parsed from original R2 bytes, verified against the source hash, with exact original XML package parts and cell spans. Unsupported schemas remain held. PDF/image vision retains original bytes/hash, page, bounding box, raw quote, model identity and uncertain candidate state; it does not claim lossless extraction.

Each queued task executes using the creator's current authorized workspace role. Every commit rechecks that role. An administrator role without scientific authoring/export permission cannot confer those permissions by enqueuing a job. A viewer cannot plan or advance workflows.

## External effects and measurements

Scientific commits are idempotent under the exact task lease and workspace revision. External provider invocation is at least once across a crash; it uses a stable task operation ID as provider idempotency metadata. This is not a guarantee that an external provider bills or executes exactly once. Do not add notifications or regulated submissions without a separate outbox and controlled external effect adapter.

Elapsed task latency is measured only during an actual invocation. Returned provider usage is reported only when present in the actual provider response. Token/cost figures absent from a real response remain `NOT_MEASURED`; no estimated accuracy, cost saving or productivity outcome is presented as observed.

## Evidence and remaining configuration

`tests/runtime.mjs` runs actual local Miniflare D1/R2 and API-handler tests, including persisted extraction/HITL wait, stale input, cancellation, lease recovery, concurrent workers, replan history, idempotency, revoked replay, mutation between control preparation and commit, viewer tick authorization, independent current response review and worker authentication. The HTTP-503 retry test injects explicit protocol failure mocks. It is not a live-model quality test, hosted load test, professional CMC pilot or periodic scheduler proof.

Periodic native scheduling, real provider credentials/pinned models, live connector credentials and organizational qualification remain separate configuration/validation requirements. The working durable runtime does not certify production-scale or GxP compliance.
