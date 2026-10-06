# Recruiter work-sample layer - 05 October 2026

Additive changes only. Existing workflows, routes, state, roles and review gates are retained.

## Navigation
Landing -> /recruiter -> confirmed document/workflow navigation. Native dialog supports close, cancel and Escape.

## Case boundaries
FORGE: existing SYN-COA-A / SYN-BATCH-A / SYN-COA-B fixtures; same-batch assay 98.6% vs 99.1%; HOLD and review remain required. Product wrapper is hypothetical and establishes no real tablet composition.
BEACON: existing official FDA Q9(R1) draft-to-final status case; company applicability UNKNOWN. No invented commercial impact or reviewer approval.

## Google sign-in deployment dependency
Google OAuth protocol code exists. Required production values are GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (secret), GOOGLE_REDIRECT_URI. Callback is https://<site>/api/auth/google/callback. Register the exact callback with the owner's Google project. No keys are stored here. Email/password flows remain available.

## Checks
Compiled local account suites and OAuth protocol suites were run. OAuth tests use a synthetic local signer and do not establish a real Google provider login. Build checks do not establish browser visual QA or professional validation.
