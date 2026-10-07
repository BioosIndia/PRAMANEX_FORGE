# FORGE — updates after the last full source ZIP

This is an update-only package, not a second full repository.

Base: `853766307038fdc32f01c4f69ddf9b04f44abde2` from `FORGE_Full_Final_Source_and_Proof.zip`.
Target published source: `ec5495005940a7927c4069690543aa340b26a3d5`.

Use your previous ZIP's `source` directory as the working directory. Make a backup and keep any separate local edits. Check and apply:

```bash
git apply --check /absolute/path/to/changes.patch
git apply /absolute/path/to/changes.patch
```

The patch has been applied to the actual previous ZIP source and the complete result compared with the current published commit. `changed-files` also supplies an overlay of current changed/new files. When overlaying manually, also apply `DELETED_FILES.txt`. Do not apply to an arbitrary newer checkout or overwrite your own conflicting edits.

The shared review and fresh test receipts are under `review`. These are separate from source revisions and do not claim customer validation. The old full ZIP retains unchanged images, videos and other assets; they are intentionally not repeated in this update ZIP.
