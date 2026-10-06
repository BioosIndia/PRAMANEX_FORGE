# FORGE evaluation and validation status

Updated 4 October 2026. This is an executed engineering release with explicitly open professional and production gates. Passing engineering fixtures does not make the entire enterprise blueprint validated.

| Area | Current evidence | Scope / next gate |
|---|---|---|
| Existing domain, lifecycle, API, sharing, runtime, parser, export and branch controls | 329/329 rerun checks | Synthetic fixtures plus real local D1/R2; not regulatory accuracy |
| Own accounts and isolation | 30/30 compiled Worker checks in prior release | Real Google, verified email/recovery and hosted-browser journey still pending |
| Saved-record dashboard projections | 16/16 rerun checks | Not rendered mobile, keyboard or WebGL verification |
| Google OAuth protocol | 12/12 synthetic signed fixtures | Actual client provisioning not completed |
| Adverse model gateway and independent QC | 19/19 executed checks | Bounded output, model drift, evidence IDs, failure handling and page coordinates; no live-model score |
| Public regulator-guidance intake | 25/25 executed checks on 3 official PDF snapshots | Exact original uploads, hashes, readback, tenant isolation, consent, held extraction, corruption, schema and queue-gap checks |
| On-page operational monitoring | Read-only dependency probes and optional visible-page 30-second refresh | Overdue executable jobs, held jobs and expired leases; not unattended scheduling or a 24/7 service commitment |
| Disclosure reduction | Full matrix removed from Assurance and automated compiled-asset inspection | User workflows remain inspectable; frontend code cannot be treated as a secret |

## Public data boundary

The corpus retains original snapshots of ICH M4Q(R1), EMA ICH Q1A(R2), and the EMA M4Q(R2) Step 2b draft. URLs, exact retrieval times, hashes and version labels are recorded in `tests/fixtures/official/manifest.json`. The consultation draft remains a draft. The tests demonstrate original-file handling and safe HOLD behaviour for unsupported automatic extraction. They do not assess regulatory applicability, product/batch facts, extraction recall, scientific accuracy or regulator acceptance. No proprietary company records were obtained or represented.

## Changes made for observed gaps

- Replaced the implementation/layer matrix with Quality & service status, readable workspace blockers and separately scoped aggregate test evidence.
- Kept the full requirements, expanded architecture, rulebook and detailed proof records in source documentation; excluded the full register from browser imports. Retained only labels needed by implemented lifecycle workflows.
- Added account-table migration checks to operational readiness.
- Added queue attention based on actual saved state. Jobs blocked by incomplete dependencies or an explicit human wait are not counted as overdue runnable work.
- Bounded provider bodies while streaming, rejected missing/different pinned model identities, rejected malformed/null candidates and vision boxes extending beyond page bounds.
- Added offline repeatable public-document and adversarial-model test suites. No provider transmission or scientific human approval occurred during public-document evaluation.

## Open acceptance checklist — do not mark as passed without evidence

- [ ] Configure a permitted server-side AI key and pinned authoring/vision models; run actual provider smoke, adverse and independently scored evaluations.
- [ ] Establish multi-model routing/specialist invocation if the chosen production architecture requires it. Current eighteen logical roles are predominantly deterministic; not eighteen live LLMs or a free-running swarm.
- [ ] Obtain a representative, permissioned CMC product/batch dataset and an independent qualified answer key. Score exact-value/unit/context/citation preservation, omissions, false claims and human corrections with denominators and confidence intervals.
- [ ] Run professional-user pilots against a defined manual baseline before reporting time savings, error reductions or regulatory accuracy.
- [ ] Configure and verify an unattended worker/scheduler with service identity, failure alerting and recovery. Watching a dashboard does not establish scheduled execution.
- [ ] Verify hosted desktop/mobile keyboard, account, review, original-file and export journeys in a production browser.
- [ ] Execute sustained concurrent-user/load testing against a written latency/error/freshness SLO and representative document sizes.
- [ ] Verify production backup/restore, recovery objectives, residency, retention, deletion and tenant offboarding.
- [ ] Complete real Google client setup and email verification/password recovery lifecycle.
- [ ] Execute vendor-specific LIMS/MES/QMS/RIM/publishing contracts and permission tests if required.
- [ ] Resolve S-P01–S-P06 from authoritative source definitions; do not invent missing titles.
- [ ] Obtain organization-specific security, GxP/Part 11/CSV/CSA qualification and publishing acceptance for intended use.

The application keeps human authority and current-revision/source gates. A deployment, animation, feature card, configured key or passing negative test is not completion of these acceptance gates.
