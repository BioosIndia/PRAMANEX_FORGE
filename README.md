# PRAMANEX FORGE

CMC Digital Thread, Authoring & Lifecycle Integrity OS — an evidence-first, reviewer-controlled engineering release by Rahul Dewangan / PRAMANEX.

## Working flow

Controlled source → typed facts → completeness/conflict checks → contextual batch comparison → source-bound Module 3 draft → independent technical QC → named review → controlled evidence snapshot. A source revision invalidates affected work; historical snapshots remain unchanged.

## Product surfaces

Landing with a slow projected 3D evidence network, reduced-motion/pause support and responsive layouts. Authenticated professional workspace with Sources, Extraction, Gaps/Conflicts, Batch Comparison, persisted Evidence Graph, Drafts, Review, Change Impact, Markets/HAQ, Agentic Workflow, Exports, Audit, Assurance and Settings. `/demo` runs a clearly labelled session-local synthetic case. `/app` uses authenticated D1/R2 persistence.

## Source and truth

Original checklist retained in docs/acceptance-source.md. Original PDFs retained in docs/. `lib/source-registry.json` preserves 178 exact source items and six unresolved shared-hardening IDs. `docs/FEATURE_MATRIX.md` and `lib/coverage.json` show bounded implementation versus specification. Do not describe the whole expanded architecture as production complete.

Nine agentic parts are allocated in docs/ENGINEERING_RULEBOOK.md. Logical A1–A18 specialists produce deterministic typed candidates. Optional model/document gateways are server-side, pinned and permission-controlled; they require configuration and independent provider proof.

## Run and check

Use the Sites skill setup/install/build workflow for hosting. For local non-Sites development, the included Vinext starter scripts are available. Apply generated Drizzle migrations to the local D1 database as documented in the deployment runbook.

```sh
node tests/run.mjs
node tests/integration.mjs
node scripts/update-coverage.mjs
node node_modules/typescript/bin/tsc --noEmit
```

Executed results are in docs/proof. Tests use synthetic fixtures; protocol mocks are labelled. They do not measure independent regulatory accuracy, global load or organization qualification.

## Security and limits

Tenant membership and role checks are server-side; current-revision CAS prevents stale/concurrent writes; idempotency prevents duplicates; original reads are permission-controlled. Authenticator secrets are encrypted; signatures bind a scientific-revision payload. Source changes invalidate approvals; closure requires an independent reviewer. Audit uses an application hash chain with privileged administrators explicitly in the threat model.

Current bounded quotas: 4 MB workspace aggregate; 20 workspaces/owner; 500 parameters/source; 5 MB original; 60 writes/user/minute. See docs/SCOPE_AND_EXCLUSIONS.md before real professional deployment.

## References

Visual references: Bio Lab, Selectra, QGen recordings and the supplied ORVIX dashboard image. They inform composition and motion, not CMC logic or metrics.

Provider protocol: [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) and [structured outputs](https://platform.openai.com/docs/guides/structured-outputs). Keys must use approved secure setup; never commit them.

No autonomous dossier submission, batch release, clinical proof, regulatory accuracy guarantee or GxP/Part 11/eCTD compliance certification is claimed.
