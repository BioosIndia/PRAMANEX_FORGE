# Bounded AI collaboration delivery — 4 October 2026

FORGE now routes AI-assisted authoring through an implemented bounded model team, in both the direct authoring API and the persisted runtime. The model planner allocates each approved fact exactly once to one or two scoped authors. Authors run concurrently; their unique statements merge before a distinct explicitly pinned model independently checks every statement. Deterministic technical QC and exact-revision human review retain authority. There is no unrestricted autonomous release or submission.

## Implemented and tested

- Model-selected fact allocation; one to two author roles; no arbitrary tools, URLs, role creation or approval powers.
- Source ID/version/hash pins carried into the team evidence fingerprint.
- Explicit provider-transmission consent; 1–100 unique approved facts.
- At most four model calls per invocation and four durable invocations; 90-second task leases, guarded scientific commits, cancellation and stale-state protection.
- Distinct author/planner and reviewer model configuration; response model identity and typed output are checked.
- Edge-compatible manual redirect handling: provider credentials never follow a redirect; non-success response statuses fail safely.
- Complete independent statement reviews; omissions, duplicates, model drift, unsupported reviewer results and incomplete outputs fail closed.
- Separate role/model receipts and available usage, prompt hashes and provider response identifiers; failed parallel work waits for all outcomes and retains governed failure traces.
- Candidate status only. The model team never supplies a human fact/draft approval or regulatory release.

Evidence: `docs/proof/collaboration-results.json` records 24/24 synthetic protocol/domain checks. The durable-runtime suite records 21/21 local D1/R2 checks; model-gateway safeguards record 19/19. The compiled model-team API suite adds 7/7 checks on saved D1/R2 state, consent, routing, idempotency and rejection. These are separate scopes, not scientific accuracy or live provider evidence.

## Not established

Production Sites configuration now contains server-only Groq and Firecrawl keys. The provider adapter uses pinned author/planner and independent reviewer routes. The saved synthetic live check on 5 October 2026 passed four Groq role calls and one public FDA Firecrawl scrape; persisted readback was verified. See `docs/live-provider-smoke.json`. This proves one bounded integration execution, not scientific correctness or customer benefits. No private company inputs were sent.

Optional image/vision routing still requires an accessible vision model and explicit document transmission permission. Keys remain server-side, never in source or the browser bundle.

Sustained live execution, permissioned representative CMC cases, independent scientific answer keys, professional pilots, qualified organization use, target-load/latency performance, unattended worker scheduling and production restore/security qualification remain separate acceptance work. No percentage business-improvement claim is made. Original source requirements and unresolved source definitions remain intact.
