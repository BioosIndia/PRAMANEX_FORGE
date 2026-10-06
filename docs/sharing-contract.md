# FORGE exact-object collaboration contract

Source mapping: **X35 CDMO Collaboration Workspace**, **L01 tenant isolation**, **L02 identity/authority**, **L10 human boundary**, **L11 audit/evaluation**, and **L12 integrations**. This implements real database-backed collaboration on specified CMC objects. It does not represent a qualified CDMO deployment or grant scientific decision authority.

## Access boundary

An active workspace **owner or admin** selects an existing source-backed source, field, draft, HA query, or closure action. A grant binds its exact content fingerprint and displayed version/revision to a **stable platform user ID**. A display name or email is not an identity. The granter confirms external sharing permission, records its basis and reason, selects access, and chooses an expiry no later than 90 days.

A partner need not be a workspace member. The partner portal receives explicitly granted projections, never the aggregate workspace state, hidden original keys, audit payloads, internal user IDs, unrelated sources, whole-workspace exports, or inherited scientific permissions. Grants automatically stop resolving when their object revision changes. Expired/revoked grants, a revoked granter membership, stale evidence, and cross-tenant object guesses are denied.

| Permission | Enabled action | Human boundary |
| --- | --- | --- |
| `view` | Read exact-object projection | No approve, scientific correction, closure, export, or grant authority |
| `comment` | Persist a plain-text note on the exact granted revision | Note is an observation, not a controlled scientific assertion |
| `requestReview` | Send a persisted review request to authorized internal reviewers | Request does not approve or release anything |
| `allowOriginal` | Explicit source-only original retrieval | Never inherited from a draft, field, query, or action grant |

Source access is independently granted. A field projection omits source IDs and spans when its source has not also been granted. Draft and query projections include only separately granted facts, with visible redacted counts. Their statement display is rebuilt from allowed facts; hidden source IDs embedded in draft prose cannot bypass the boundary. Action dependencies are independently filtered. These projections intentionally do not promise to reproduce a private document in full.

Before a new grant, source permission, preserved-original presence, source hashes, fact provenance spans, and current dependencies are verified. If an R2 original exists its actual bytes are hashed. Original access repeats verification. Unsupported or guessed objects are not shareable.

## Persistent API

All responses are private and `no-store`. Authentication comes from the existing server platform identity, never a client-supplied identity header.

- `GET /api/sharing`: current platform user ID and accessible shared-workspace IDs/counts.
- `GET /api/sharing?workspace=<id>`: exact granted objects and permitted notes. Owners/admins also receive grant management and a shareable-object picker. Internal reviewers/approvers receive review requests.
- `POST /api/sharing`: JSON with same-origin `Origin`, `Idempotency-Key`, `workspaceId`, and `expectedVersion`.

### Grant input

```json
{
  "action": "grant",
  "workspaceId": "server-workspace-id",
  "expectedVersion": 12,
  "objectType": "field",
  "objectId": "server-object-id",
  "objectRevision": "exact revision from the object picker",
  "granteeId": "verified-platform-user-id",
  "permissions": ["view", "comment", "requestReview"],
  "allowOriginal": false,
  "permissionConfirmed": true,
  "permissionBasis": "Recorded authorization to share this exact object",
  "reason": "Specific collaboration purpose",
  "expiresAt": "ISO timestamp within 90 days"
}
```

`revoke` requires `grantId`, `grantRevision`, and a reason. `note` / `requestReview` require `objectType`, `objectId`, `objectRevision`, and `body`. `resolveNote` requires an authorized internal owner/admin/reviewer/approver, `noteId`, current `objectRevision`, and a reason. A note resolution remains separate from scientific review.

Notes are bounded to 2,000 characters, plain text, and reject active markup, control characters, email addresses, long phone/contact-like numbers, and common explicitly labelled personal identifiers. This is a conservative input filter, not a claim of comprehensive PII detection. The authorized author must ensure the note contains permitted data. Only the latest 300 notes are projected; older notes remain in the database.

### File-route integration

The original-file route first honors existing active workspace membership. On a membership denial, it calls:

```ts
await authorizeSharedSource(workspaceId, sourceId, currentPlatformUser.userId);
```

The helper returns the exact grant identifier/revision or throws a sanitized `FORBIDDEN`. It never grants a guest workspace membership. A source viewer without `allowOriginal` cannot retrieve source bytes.

## Atomicity and audit

Sharing operations compare-and-swap the current workspace revision. In one D1 batch, the winning state update gates grant/note writes, the immutable workspace snapshot, the common hash-chain audit event, and idempotency result. Partner write guards recheck the active grant, permissions, exact object revision, real-time expiry, and active owner/admin granter at commit. A grant revoked while processing cannot save a prepared comment. A changed object or competing write yields a refresh-required conflict. Identical repeated operations return the prior result only after current authorization; changed input with the same operation key is rejected.

Grant and revocation events record object revision, actor, permission basis, reason, access and expiry. Note events record an exact object binding and content hash; source scientific facts and approval decisions remain unchanged. The application audit chain does not remove a privileged database administrator from the threat model.

## Tables

`object_grants` stores exact-object permissions and lifecycle. `shared_notes` stores comments and review requests bound to exact object revisions. Both are migrated D1 tables. Audit events, immutable workspace revisions, and idempotent operations use the common workspace tables.

## Evidence and remaining qualification

Run `node tests/sharing.mjs`. Proof is written to `docs/proof/sharing-results.json`. The suite executes actual local D1/R2 and API-handler checks using synthetic identities. It verifies isolation, scoped projections, original-byte permissions, content hashes, all five object kinds, role denial, bounded expiry, live revocation, revocation after a processing pause, granter revocation, plain-text notes, idempotency, concurrency, and the shared audit/history.

Hosted platform sign-in and an actual partner organization are separate deployment checks. No invitations, emails, live organization grants, patient information, or customer proprietary records were sent. Site-level private audience must independently allow an intended partner before that partner can reach the hosted app; an object grant does not alter Site audience settings. Organizational retention/deletion, DLP qualification, identity onboarding verification, and a professional CDMO pilot remain organization-specific gates.
