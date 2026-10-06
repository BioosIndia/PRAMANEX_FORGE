# Nine-part source allocation

Current export uses bounded implementation, not unrestricted swarm.


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


