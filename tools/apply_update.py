"""Safely apply an incremental export to its exact base; never force-reset a repo."""
from pathlib import Path
import argparse,json,subprocess,hashlib
p=argparse.ArgumentParser();p.add_argument('--repo',required=True);p.add_argument('--verify-content',action='store_true');args=p.parse_args()
root=Path(__file__).resolve().parent.parent
m=json.loads((root/'SOURCE_BASELINE.json').read_text())
repo=Path(args.repo).resolve()
def git(*a): return subprocess.check_output(['git',*a],cwd=repo).decode().strip()
if args.verify_content:
    entries=json.loads((root/'BASE_SOURCE_HASHES.json').read_text())['files']
    for row in entries:
        target=repo/row['path']
        if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest()!=row['sha256']:
            raise SystemExit('STOP: base source differs or is missing: '+row['path']+'. Preserve your edits; do not force-overwrite.')
    for added in m['added_paths']:
        if (repo/added).exists():raise SystemExit('STOP: a newly added update path already exists: '+added)
    print('All exported baseline source hashes match. Unchanged hidden platform settings and generated caches are not used for this comparison.')
else:
    if git('status','--porcelain'): raise SystemExit('STOP: save your existing changes before applying this export.')
    if git('rev-parse','HEAD')!=m['base_commit']: raise SystemExit('STOP: exact base SHA differs. For an extracted ZIP or an equivalent GitHub commit, use --verify-content; never force-reset newer work.')
patch=root/'changes.patch'
subprocess.run(['git','apply','--check',str(patch)],cwd=repo,check=True)
subprocess.run(['git','apply',str(patch)],cwd=repo,check=True)
print('Applied source delta. Review git diff and run the documented checks; nothing was committed or pushed.')
