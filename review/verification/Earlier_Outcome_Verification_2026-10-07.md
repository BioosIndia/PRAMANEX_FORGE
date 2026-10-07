# BEACON, FORGE and LEDGER-Q — outcome verification
**Updated: 7 October 2026**

The outcome-control updates are published in all three applications. The changes make saved findings easier to understand, strengthen checks against unsupported statements, and preserve human review. Engineering checks passed within the scopes below. This is not a claim that real professional outcomes or enterprise readiness have been proven.

## Current websites

| Application | Published version | Website |
|---|---|---|
| BEACON | 45 | https://beacon.r4dewangan.chatgpt.site |
| FORGE | 16 | https://forge.r4dewangan.chatgpt.site |
| LEDGER-Q | 14 | https://ledger-q.r4dewangan.chatgpt.site |

Existing access settings remain in place: BEACON is public; FORGE and LEDGER-Q retain owner-private access. Successful publication confirms deployment, not professional validation.

## 1. BEACON

**What the user sees:** a readable decision brief explaining the finding, its applicability boundary, missing/conflicting evidence, and the next action. UNKNOWN remains visible when the available evidence cannot establish applicability.

**What changed:**

- Added a check for quantities and supported units in both claim headlines and claim text. They must be present in that claim's exact quoted citations. A citation attached to a statement does not automatically justify an invented number.
- Made stale findings and unresolved gaps visible in the outcome.
- Kept the downloaded brief clearly labelled as unapproved. The existing review, audit and export controls remain separate.
- Fixed the test harness's large fixture insertion so the complete pagination/integration checks execute.

**Checks executed:**

| Check | Result | Scope |
|---|---|---|
| Source/domain tests | 142/142 passed | Deterministic and adverse cases |
| Compiled Worker/API tests | 99/99 passed | Storage, roles, review, staleness, rendering |
| Background-monitor boundary tests | 14/14 passed | Compiled local boundary tests |
| Provider protocol and saved readback | 7/7 passed | Simulated provider responses |
| Type checking and managed build | Passed | Current source/build |

**Important limits:** these quantity checks are conservative text checks, not proof of meaning or regulatory applicability. A fresh live BEACON model run was not completed in this verification. Monitoring schedules were not resumed; paused or overdue monitoring remains an evidence gap. No claim of uninterrupted 24/7 monitoring is made.

## 2. FORGE

**What the user sees:** a readable draft brief with supported findings, current blockers, the exact revision, and the next action. It helps explain why a draft is on HOLD or still needs human review.

**What changed:**

- Required source-backed statements to retain the relevant parameter, batch and method.
- Checked that a quantity is paired with its correct unit. An extra incorrect quantity/unit is rejected even when a correct value also appears elsewhere.
- Recomputed conflicts before using approved facts. Newly detected conflicts cannot pass using an old approval label.
- Preserved the existing signed review and controlled export paths. The new review-brief download is explicitly unapproved.

**Checks executed:**

| Check | Result |
|---|---|
| Domain/governance tests | 88/88 passed |
| Saved API/storage integration | 47/47 passed |
| Collaboration tests | 24/24 passed |
| Adverse outcome tests | 12/12 passed |
| Compiled multi-model protocol | 7/7 passed |
| PDF/Word/ZIP export integrity | 16/16 passed |
| Simulated provider protocol/readback | 7/7 passed |
| Type checking and managed build | Passed |

**Actual live check:** on 7 October at 09:35 UTC, a fresh synthetic account and workspace successfully ran a bounded Groq team using `openai/gpt-oss-20b` and `openai/gpt-oss-120b`. Firecrawl retrieved a public FDA discovery listing, and the result was saved and read back successfully. Recorded call times were 1,086 ms for the model team and 1,900 ms for discovery.

That live check ran against the pre-update deployed source. The new statement controls were subsequently tested in the current compiled application and published in version 16. The single live receipt does not establish production latency, regulatory accuracy, time savings, or customer benefits. Firecrawl discovery is not regulatory validation.

## 3. LEDGER-Q

**What the user sees:** a readable saved-run outcome, evidence gaps, current source/revision status, and the next action. Provider failure remains a visible failed/HOLD state.

**What changed:**

- Added an unapproved run-brief download; existing audit/export remains the route for integrity-bound packets.
- Rejected malformed, duplicate, stale and gapped citations.
- Required the complete exact expected fact set in the frozen-answer evaluation. Extra facts, duplicates, wrong source revisions and missing expected facts fail; failed evaluations stay on HOLD.
- Blocked provider redirects and explicitly incomplete responses from being recorded as completed work.
- Added bounded independent-reviewer recovery for temporary provider failures. Only configured/discovered alternative models can be used, and the author model cannot act as its independent reviewer.
- Preserved failed attempts in the run history. Authentication denial cannot be bypassed through fallback.
- Kept empty live fact results on HOLD.

**Checks executed:**

| Check | Result |
|---|---|
| API/storage, roles, model protocol, recovery and adverse evaluation | 65/65 passed |
| Saved-outcome adverse tests | 15/15 passed |
| Server-rendered presentation tests | 9/9 passed |
| Type checking and managed build | Passed |

**Actual live failure checked:** on 7 October at 09:41 UTC, a fresh synthetic workspace started with zero records. Planner/specialist calls succeeded, but the independent reviewer returned HTTP 503 on four attempts. The failure was saved and read back; work stayed on HOLD. A successful connection test had therefore not meant a successful complete workflow.

Recovery was then implemented, tested with simulated failures, and published in version 14. The fresh post-update live check was blocked by this environment's network policy when contacting the deployed LEDGER-Q site. Its successful live recovery and persisted readback are therefore **not verified**. This remains an open verification item.

## 4. Human review, audit and export

The three applications retain human decision boundaries. No automatic regulatory approval, batch disposition, or release was added.

The new readable downloads are review aids, not approved outputs. Existing audit history and controlled export paths remain available. A changed source or relevant revision makes affected current findings/approvals stale; a historical packet remains a historical record rather than evidence of current approval.

Safety checks reduce specific failure modes. They cannot guarantee zero errors or replace qualified RA, CMC or QA judgement.

## 5. What is still unproven

| Item | Current position |
|---|---|
| Natural-language presentation | Implemented and checked at source/server-render level |
| Unsupported statements, source gaps and stale revisions | Tested against the documented adverse cases |
| Live FORGE model-team/discovery/saved readback | One bounded pre-update synthetic run passed |
| Live post-update LEDGER-Q reviewer recovery | Blocked by network policy; not verified |
| Fresh live BEACON inference | Not verified in this pass |
| Browser clicks, keyboard flow and visual interaction | Not tested here; required managed browser-control capability unavailable |
| Continuous BEACON monitoring | Not established; existing paused schedules preserved |
| Real-world accuracy and professional suitability | Qualified-reviewer evaluation still required |
| Time savings, fewer errors and customer benefits | Real-user baseline and supervised pilot still required |
| Enterprise production readiness | Not established by these engineering checks |

All test counts above are engineering checks. They must not be advertised as regulatory accuracy, clinical proof, or percentage improvements.

## Source/deployment record

| Application | Published source commit |
|---|---|
| BEACON | `104ab1f7a38e09bbc5ac9aac36e058f2a9582da2` |
| FORGE | `ec5495005940a7927c4069690543aa340b26a3d5` |
| LEDGER-Q | `4899a4878511557fb8871092c4cc24aacbe777a6` |

Native deployment status was **succeeded** for all three versions. No secrets, private company evidence, or reviewer approvals are included in this report.

