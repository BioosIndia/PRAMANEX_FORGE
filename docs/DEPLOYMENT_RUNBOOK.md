# Deployment and recovery runbook

Runtime: Sites Vinext worker; FORGE-owned accounts with existing trusted platform identity retained; D1 binding DB; R2 binding BUCKET. The existing Site audience is preserved; check native access configuration before sharing. The Site owner controls visitor access separately from workspace membership.

Server variables:
- FORGE_SIGNING_KEY: secret encryption key, minimum 32 characters (configured through Sites, never committed).
- OPENAI_API_KEY: optional AI-provider secret, configured only through the approved secure key setup.
- FORGE_MODEL: explicit approved/pinned drafting model identifier.
- FORGE_VISION_MODEL: explicit approved/pinned document/vision model identifier.

FORGE_WORKER_TOKEN is optional server-only independent worker authentication. Event-triggered authorized worker draining operates without it. The scheduled handler needs explicitly configured periodic infrastructure; a boolean or token alone does not establish scheduling.

No raw key is accepted in client forms or source manifests. Without optional provider configuration, tasks record visible HOLD and deterministic work remains available.

Checks: `node tests/run.mjs`; `node tests/lifecycle.mjs`; `node tests/branches.mjs`; `node tests/runtime.mjs`; `node tests/sharing.mjs`; `node tests/document-parser.mjs`; `node tests/format-export.mjs`; `node tests/integration.mjs`; `node scripts/update-coverage.mjs`; `node node_modules/typescript/bin/tsc --noEmit`; Sites build helper. Generated Drizzle SQL and journal are tracked; append future migrations, never rewrite applied history.

The integration harness uses actual local D1/R2 bindings and compiled API handlers with a test-only identity adapter. It is not hosted-auth or real-browser evidence. Managed preview is skipped when the required control-browser skill is unavailable. Do not promote to LIVE DEMO from compile success alone.

Operational acceptance before real organization use: hosted identity/deep links/original files; independent source/extraction answer key; intended-use-specific policy; reviewer segregation; signature identity/SOPs; configured vendor contracts; off-site backup and R2 restore; representative load and latency; alert ownership; region/residency review; professional-user pilot; documented release authority.

Recovery: stop writes; preserve current incident evidence; restore matching D1 records/revisions/events and R2 originals from an approved backup; verify object hashes and audit chain; reconstruct prior filing; verify memberships/signing factors and rollback configuration; run adverse smoke cases; obtain release authority. Local snapshot restoration test is recorded separately and does not prove production disaster recovery.

Read-only operational endpoint: authenticated GET `/api/readiness?workspace=<id>&profile=DETERMINISTIC`. AUTHORING/VISION profiles explicitly remain HOLD until separately consented live-provider evaluation; configuration alone does not prove provider readiness. The probe reads D1, migration table presence, scoped queue, R2 listing and at most three current original hashes. A failed dependency returns HTTP 503. It does not write test objects, establish a worker heartbeat or certify production SLOs.

Controlled branch access: workspace → Controlled branches. Create from a current technically checked draft or source-cited lifecycle rule; edit an isolated proposal; submit; review through an independent active reviewer; merge as a new candidate. Fresh scientific approval is mandatory. A reviewer whose membership or authority has changed cannot authorize a later merge.


Account release: append migration 0002_forge_accounts.sql before accepting signup requests. Passwords use bcrypt with cost 12, a 15-character minimum and a 72 UTF-8 byte maximum; account requests are bounded to 4 KB. Opaque sessions are hashed in D1, Secure/HttpOnly/SameSite=Lax and expire after eight hours. Same-origin writes and persistent account/IP attempt windows are required. The optional Google protocol requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI (`https://forge.r4dewangan.chatgpt.site/api/auth/google/callback`) provisioned server-side by the owner. No real Google setup or recovery mail delivery is claimed in this release. Never copy BEACON credentials or accounts into FORGE.

The compiled account tests use the built Worker with synthetic accounts and local D1. The synthetic Google protocol suite uses a locally signed RSA token; it is not real Google/provider availability evidence. Existing platform actor records remain unchanged. Linking is one-to-one and requires an empty new identity with explicit dual proof. For unlink/migration/recovery use an explicit governed incident procedure; do not delete link rows or rewrite authors/signatures.

## v6 evaluation/privacy regression

Run `node tests/model-evaluation.mjs`, `node tests/public-documents.mjs`, existing relevant suites and `node scripts/update-coverage.mjs`. Generate the public-safe aggregate using `node scripts/update-release-status.mjs`. Build using the Sites helper, run `node tests/public-surface.mjs` against actual client artifacts, regenerate the summary and rebuild/package the exact source. Never promote public-guidance intake checks to company scientific validation. See EVALUATION_VALIDATION_STATUS.md for unpassed acceptance gates.

## Bounded model team (v7)
Configure `OPENAI_API_KEY`, `FORGE_MODEL`, distinct `FORGE_REVIEWER_MODEL`, and optional `FORGE_VISION_MODEL` using the supported secure setup flow and Sites environment tools. Deploy a saved version after configuration changes. Missing or identical reviewer models block AI-assisted authoring. Obtain actual provider-transmission consent, run permitted evidence through the workflow, inspect saved role/model receipts and independently score the result before making a live quality claim. The current deployment is intentionally deterministic-capable and AI-HOLD until provider setup is completed.
