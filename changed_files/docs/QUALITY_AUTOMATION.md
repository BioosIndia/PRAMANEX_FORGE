# Quality automation — 12 October 2026

Existing application/data/access retained. Narrow service checks only operate on fixed synthetic originals and isolated quality receipts; no private evidence, user impersonation, regulatory approval, batch release or automatic professional acceptance.

- Engineering checks: hourly. Live two-model known-answer canary: at most one saved daily attempt from the linked hourly task, no more than two generation calls per canary. An actual retry/failure remains visible.
- `/api/quality/background`: exact Site service access plus a separate digest-verified `x-quality-monitor-service` header, held in memory/hidden stdin. GET reads; POST executes only `engineering` or `live-ai`.
- `/api/quality/status`: sanitized engineering history, hashes/freshness and explicit qualification limitations; no private workspace data.
- `/quality`: readable saved receipts; app control screen links here.
- `npm run quality:check`: run after building the compiled Worker. Provider fixtures are not real inference.
- `/api/quality/protocol`: unapproved planning template. Actual intended use, independent professional correctness, workload, SOPs, privacy, identity/recovery and production restore/load evidence require qualified acceptance. Passing engineering controls does not certify Part 11, Annex 11/15, GAMP, CSA or EU AI Act compliance.

Receipt integrity, immutable terminal rows, original readback, visible missing/conflicting values, source-change review and no autonomous release remain required. Original public proof stays separate from a fresh empty private workspace.
