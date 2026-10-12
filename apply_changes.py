"""Dry run by default; refuses unrelated changes and never deletes hidden files."""
import argparse,json,hashlib,os
from pathlib import Path
a=argparse.ArgumentParser();a.add_argument('--repo',required=True);a.add_argument('--apply',action='store_true');args=a.parse_args()
root=Path(__file__).resolve().parent;dest=Path(args.repo).resolve();m=json.loads((root/'CHANGE_MANIFEST.json').read_text());bad=[]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest() if p.is_file() else None
for r in m['files']:
 rel=Path(r['path']);p=(dest/rel).resolve()
 if p!=dest and dest not in p.parents:raise SystemExit('Unsafe destination')
 actual=sha(p)
 if actual not in [r['before_sha256'],r['after_sha256']]:bad.append(r['path'])
if bad:raise SystemExit('Baseline mismatch. Preserve your current work and compare these files first: '+', '.join(bad))
if not args.apply:print('Compatible changed files:',len(m['files']),'Dry run only. Add --apply to copy them.');raise SystemExit(0)
for r in m['files']:
 p=(dest/r['path']).resolve();source=root/'changed_files'/r['path'];p.parent.mkdir(parents=True,exist_ok=True)
 if r['status']=='D':
  if p.exists():p.unlink()
 else:
  temp=p.with_name(p.name+'.pramanex-tmp');temp.write_bytes(source.read_bytes());os.replace(temp,p)
print('Applied changed files. Inspect git diff, run the documented tests, then commit. Credentials and deployment configuration were not changed.')
