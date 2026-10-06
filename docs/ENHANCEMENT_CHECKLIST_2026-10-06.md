# FORGE enhancement check — 6 October 2026

The existing application, data model, navigation and controlled workflow were preserved. This records engineering evidence, not scientific validation or commercial CMC experience.

| Requested area | Result | What was checked or changed |
| --- | --- | --- |
| Email account, sign-in, workspace and sign-out | PASS locally | 30 compiled account/security checks. Clear account errors, UTF-8 password checks, preserved return paths and protected pending forms. Workspace loading ignores stale responses so an earlier request cannot overwrite a later selection. |
| Google sign-in | PARTIAL | 12 signed synthetic OAuth checks pass. Real Google setup is still absent and labelled honestly. |
| Source → fact, numbers, units and exact evidence | PASS locally | 88 core and 47 repository/API checks; original evidence and controlled versions remain linked. |
| Gaps, conflicts, batch comparison and Module 3 | PASS locally | Existing synthetic CMC case, missing values and deliberate assay conflict remain visible. 25 official-document checks preserve original bytes and HOLD unsupported extraction. |
| AI roles, saved runs and recovery | PASS within tested scope | 24 collaboration, 19 model-evaluation, 21 durable runtime and 7 compiled model-team checks. Separate live synthetic Groq/Firecrawl smoke passed on 5 October with saved readback; it is not independently scored scientific accuracy. |
| Revision-bound review and controlled export | PASS locally | Core/repository suites block stale approval and unsupported output. Exact evidence/revision and human authority remain required; release=false. |
| Dashboard, evidence graph and detail dialogs | IMPLEMENTED; browser verification pending | Popup focus no longer resets during input/save. Close/Escape, focus trapping, prior scroll restoration and field-specific lengths are preserved. Mobile navigation gets separate scrolling, close/backdrop/Escape and keyboard focus control. |
| Synthetic recruiter case, gap PDF and HOLD | PASS locally | Existing labelled Drug X work sample and CMC Gap Assessment are preserved. Public original-document tests exercise intake, exact readback and safe failure. |
| Provider configuration, consent and receipt | PASS within tested scope | 7 compiled provider checks verify consent, authorization, exact saved readback and duplicate prevention. Bounded request timeouts and refresh-only receipt controls added. Late responses from an old workspace cannot populate a new one. |
| Security, privacy and recovery | PASS within local scope | Account isolation, repository permission/revision guards and local snapshot recovery checked. 5 built public-surface privacy assertions pass. Production disaster restoration and sustained load remain separate. |

## Verification evidence

- 88 core checks; 47 repository/API checks; 21 durable-runtime checks.
- 30 compiled account/security checks; 12 synthetic OAuth protocol checks.
- 24 model-collaboration and 19 model-evaluation checks; 7 compiled model-team checks.
- 7 synthetic provider checks; 25 public-document checks; 5 built public-surface checks.
- 6 new browser-request error/timeout checks.
- Production build and TypeScript checks pass.

Detailed logs are in `docs/proof/enhancement-*-2026-10-06.txt`. The public-document harness was repaired to include its provider-config dependency; all 25 checks then ran and passed. No pass was substituted for the earlier harness failure.

## Limits that remain visible

The configured Groq author/planner and independent reviewer have a separate successful live synthetic receipt. Optional vision still needs an accessible model and explicit document processing permission. A provider key and one successful run do not prove scientific quality or sustained reliability.

Real Google setup, email verification/recovery, rendered browser/mobile journeys, production backup restoration and sustained-load tests remain separate. Qualified CMC/RA/QA expected answers, representative permitted customer inputs and a supervised professional pilot are needed for actual quality or time-saving claims. No automatic regulatory release is provided.
