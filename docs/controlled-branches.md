# Controlled draft and rule branches

Source controls: D08 Draft / Rule Version Branching and D09 Controlled Review / Merge Gate. This continuation implements the bounded proposal workflow; it does not claim unrestricted version control, automated scientific release or enterprise acceptance.

An author creates an isolated branch from an existing current draft or typed lifecycle rule. The base content, revision, digest, governing policy, exact fact revisions and source hashes are preserved. Draft edits change only statement text; they cannot rewire citations or replace numeric evidence. Rule edits pass the existing bounded declarative schema, current dependencies and verbatim source checks. Candidate revisions and their reasons remain inspectable.

Submission requires a real change and passing deterministic technical checks. A different authorized reviewer approves, requests evidence or rejects the exact candidate revision and digest. Owners do not bypass contributor separation. Any later candidate edit invalidates the proposal approval. A changed base, source or policy blocks review and merge; the system does not silently rebase.

The merge API checks the independent reviewer's active workspace authority and guards that membership/role in the final D1 compare-and-swap batch. Revocation between preparation and commit prevents the merge. Existing reviewer history is retained; a fresh active independent review may replace the operative proposal decision.

Draft merge creates a new CANDIDATE revision and stales earlier draft decisions. Contributors and the merger cannot self-approve that content. Rule merge appends a new source-cited CANDIDATE lifecycle version with a preserved predecessor. Proposal approval is never copied into scientific approval or a release signature. Previously frozen evidence exports remain historical snapshots.

`lib/branches.mjs`, the authenticated FORGE API and `app/BranchesPanel.tsx` implement these operations. `tests/branches.mjs` records synthetic adverse cases; API integration separately exercises actual D1 persistence and the reviewer-revocation commit race. Hosted browser interaction and organizational acceptance remain separate.
