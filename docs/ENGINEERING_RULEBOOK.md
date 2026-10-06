# FORGE executable engineering rulebook

The supplied master checklist remains unchanged in acceptance-source.md. This supplement adds implementation gates; it does not replace or weaken the original contract.

1. Preserve source-defined IDs, names, meaning, workflow stages and human boundaries. Changes require a dated decision and exact source reference.
2. Treat documents and model output as untrusted data. They cannot select tools, grant permissions, mark success or approve themselves.
3. One deterministic parent owns writes, authorization, revision guards, human waits and terminal states. Typed specialists produce candidates only.
4. Every write requires platform identity, active membership, permitted role, same-origin request, bounded payload, current revision and idempotency key.
5. Persist originals, hashes, source metadata and extraction lineage before accepting candidate work. Keep exact numeric lexemes and raw values.
6. Missing stays missing. Unknown units, method/basis ambiguity, extraction failure, conflicting sources and missing evidence remain explicit states.
7. Separate authoring, technical QC and named human approval. Human edits/corrections require an independent reviewer; closure cannot self-approve.
8. Approval binds exact scientific content, source hashes, fact revisions, policy/workflow/model versions and reviewer. Source changes selectively invalidate dependent work.
9. Snapshot exports deep-clone evidence and decision state. Never regenerate a historical filing with current prompts or overwrite historical signatures.
10. Signatures require enrolled TOTP, a controlled reason and matching scientific-revision payload hash. Reused codes, hash mismatch and stale revisions fail closed. This is a technical control, not compliance certification.
11. Network tools use reviewed HTTPS allowlists, redirect denial, bounded responses and timeouts. No arbitrary source-suggested external action is allowed.
12. External model/provider failures stay HOLD, RETRY_WAIT or DLQ with ownership. Missing credentials cannot become fabricated success. Retry eligibility and attempts must be visible.
13. Report actual engineering denominators, test dates and artifacts. Provider-protocol fixtures are not live inference; synthetic cases are not independent regulatory accuracy.
14. Run focused domain and D1/R2/API tests, type checks and the deployable build before publication. Update the coverage register from actual results.
15. Real browser, hosted auth/deep-link, professional-user pilot, load/recovery and organization qualification gates remain open until their own proof exists.
16. Preserve rollback state, runbooks, claims register and configuration limits. Never label all 178 items complete because their names appear in a register.

## Nine-part allocation

| Part | Implementation | Authority boundary |
|---|---|---|
| Goal interpretation/planning | lib/agentic.mjs: makePlan/replan | Bounded goal types; evidence/human blockers remain waits |
| Tool integration | lib/tool-adapters.mjs; API/D1/R2 adapters | Reviewed contracts; live vendor configuration required |
| Memory | retrieveMemory; workspace_revisions | Current approved knowledge and hash-checked history |
| Orchestration/runtime | parent command; jobs; API commit guards | One controlled write path; visible failure states |
| Multi-agent collaboration | executeRole A1–A18; mergeSpecialistOutputs | Typed candidates, same revision, no human authority |
| HITL | four review actions; plan controls; signature gateway | Named and exact-revision decisions |
| Safety/policy | role checks, boundedBody, source/hash guards | Tenant isolation; untrusted input cannot authorize |
| Observability/evaluation | trace IDs, measured run latency, proof logs | Unmeasured cost/quality stays NOT_MEASURED |
| Governance | provenance, policy, memberships, history/audit | Organization SOP/retention/qualification still required |


## Executed v2 safeguards

- Preserve original UTF-8 BOM and original numeric lexemes; unsafe precision/overflow/underflow and ragged/duplicate CSV schemas do not create facts.
- Original-file replacement binds predecessor, reason, bytes and idempotency in one authorized commit. Preserve originals when commit outcome cannot be verified.
- Runtime replay repeats current membership/role checks; workflow controls bind both workflow and workspace revisions.
- Internal review notes cannot become evidenced health-authority outcomes. Governed outcome memory requires actual source citations and independent exact-revision approval.
- Broaden a feature claim only with its own artifact and executed evidence. Keep each source registry ID/name and the rulebook MD unchanged.

Continuation gates (4 October 2026): controlled branches retain an unchanged base and candidate history. No silent rebase or source/citation rewrite is allowed. Changed base, policy or evidence blocks review/merge. Merge requires a current independent reviewer, with membership/role rechecked in the final database transaction. Proposal approval cannot transfer to scientific approval or release. Readiness probes actual dependencies; configured bindings and scheduler booleans never establish runtime health.


## Account identity extension — 4 October 2026

The owner's explicit request adds FORGE-owned accounts alongside the retained trusted platform identity. The source acceptance checklist is preserved. For rule 4, an authenticated actor can now be a server-verified FORGE account session or the existing trusted hosting identity; every existing membership, role, revision, consent and human segregation gate remains required. An email string alone cannot grant access. New manual accounts own private workspaces and cannot receive shared membership/object grants until identity verification. A link to an existing actor requires both current sessions, explicit consent and a new account without workspace/sharing/signing records. Linking maps identity rather than migrating or rewriting evidence/signatures; database guards reject late writes under a retired account ID.

Email/password account checks are separate engineering evidence. Google protocol support remains configuration-gated, and email verification/recovery delivery is not implemented. The existing Site access audience is unchanged; the hosting access gate is distinct from application sign-in.
