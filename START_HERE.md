# Rahul Dewangan — PRAMANEX FORGE: complete source export
Prepared 6 October 2026. Published version **v13**, source `97a2c8ab8cb4322ccf18752faa7791fcaa43d73d`.
Canonical website: https://forge.r4dewangan.chatgpt.site/
Portfolio: https://portfolio.r4dewangan.chatgpt.site/

This is the actual full source snapshot plus complete available Git history, not a text-only implementation plan. No app rebuild or republish was performed for this export.

## Included
- `app`, `lib`, `components`, `hooks`, `build`: original application and Worker integration code.
- `db`, `drizzle`: schema and ordered migration files, including current metadata.
- `tests`, original fixtures/evaluation folders where present: actual executable engineering checks.
- `public`, `docs`: original assets, work-sample PDFs, diagrams/reference images and recorded test receipts.
- `history`: Git source bundle, dated commit history and changed-file log.
- `handoff`: current truth summary, route/code/media maps and publication boundaries.
- `media/diagrams`: accurate new source-based SVG/PNG diagrams and editable Mermaid.
- `Dockerfile.dev`, `compose.dev.yaml`: local-development scaffolding, **not built or Docker-qualified here**.
- `handoff/FILE_MANIFEST.json`: file hashes and inventory, excluding its own self-reference.

## Run locally
Use the exact package lock: Node >=22.13, pnpm 11.25.0. Run `corepack enable`, `corepack pnpm install --frozen-lockfile`, then `corepack pnpm dev`. Clean-clone installation was not repeated in this export. Original published build/test logs remain in docs.

This is a Cloudflare Worker/Vinext application with D1 `DB` and R2 `BUCKET`, not a conventional standalone production Node server. The portable local profile simulates platform identity. **Never expose local development on the public internet.** The optional Docker scaffold selects the non-mocked managed-linux profile and binds port 5173 to localhost. Apply D1 migrations using the authorized supported runtime before testing persistence. Docker does not provision production auth/storage/scheduling.

## GitHub
Unzip and use this folder as your repository root, or clone the history bundle into a separate folder and copy handoff additions. Review rights/visibility before publishing. No repository URL is invented. Credentials, sessions, private workspace records, live D1/R2 storage, node_modules, tool state and deployment tokens are excluded. `.env.example` has names only. Retained project IDs do not authorize a new owner's deployment.

## Read the current truth first
`handoff/CURRENT_STATUS.md` supersedes older milestone wording in inherited documents; old evidence remains dated, not silently rewritten. A passed engineering fixture is not regulatory/scientific validation, a qualified reviewer judgement, customer adoption or a measured time-saving benefit.
