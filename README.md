# FORGE incremental GitHub update - Last_Delivered_to_v21

Sirf aapko last delivered ZIP ke source se aage ka update hai. Purana full repository dobara nahi diya gaya. Last delivered archive: FORGE_Updates_After_Last_Full_Zip.zip. Exact base: ec5495005940a7927c4069690543aa340b26a3d5. Head exported: 3e9de7fb24ede076092f877aa94a6fcc2e74ddc7. Us archive ke baad ke 5 source commits ka combined change included hai. Latest bilingual PDF and editable script are in walkthrough/.

## Safe local merge (recommended)

1. Extract this ZIP to a separate folder; keep your existing repository untouched.
2. Confirm your repository is on the exact base SHA and has no unsaved changes. Do not reset or overwrite a newer version.
3. Run: python tools/apply_update.py --repo /path/to/your/existing/repository
4. Review git diff, run the documented app checks and inspect saved outcomes. Commit/push yourself only after reviewing the result; this package does not commit or push.

If your old source is an extracted ZIP, or GitHub uses a different commit ID for the same code, use: python tools/apply_update.py --repo /path/to/source --verify-content
This verifies every exported base source hash before applying; it was tested without Git metadata and without the hidden .openai folder. It refuses mismatched/missing source or an already-existing new path. Git is required to apply the patch, but GitHub authentication is not. Unchanged hidden settings remain optional platform configuration copies.

## GitHub browser upload

Extract the ZIP first. Upload the CONTENTS of changed-files/ into the EXISTING repository root; do not upload the ZIP as application source, do not place the outer delivery folder inside app/, and do not create changed-files/app under your repo. The resulting root app/ holds application routes. An existing app/app route is legitimate in this source and is not renamed.

The changed source batch has 36 files. GitHub's documented browser limit is 100 files per upload and 25 MiB per file. Branch rules and secret scanning can independently reject an upload. These packages have no hidden-dot paths and no live credentials. An unknown GitHub "Something went wrong" error cannot be conclusively diagnosed without its actual message; use the local patch/GitHub Desktop path if web upload still fails.

## Visible configuration fix

Platform metadata .openai/hosting.json is stored visibly as upload-support/openai-hosting.json. Other tracked hidden settings are mirrored visibly too; config-name-map.json records original names and hashes. They are unchanged support copies, not part of the source delta. Existing correct settings need no upload.

If you really need to restore an absent setting locally, first preview: python tools/restore_optional_configs.py --repo /path/to/repo
Then after checking: python tools/restore_optional_configs.py --repo /path/to/repo --write
The script refuses to overwrite a differing existing configuration. Uploading a visible config file alone does not make it active under its original hidden path.

## What is retained in your previous full package

Unchanged original code, lockfile, Docker/container/build files, media and history remain in your base package/repository. This delta deliberately does not repeat them. Generated type-check cache omissions: tsconfig.tsbuildinfo. No design, diagram, test count or configured API key establishes enterprise qualification.

GitHub reference checked 8 October 2026: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
