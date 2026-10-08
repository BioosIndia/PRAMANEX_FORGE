from pathlib import Path
import argparse,json,hashlib
p=argparse.ArgumentParser();p.add_argument('--repo',required=True);p.add_argument('--write',action='store_true');a=p.parse_args()
root=Path(__file__).resolve().parent.parent;repo=Path(a.repo).resolve()
for row in json.loads((root/'upload-support/config-name-map.json').read_text()):
    source=root/'upload-support'/row['visible'];target=repo/row['original'];data=source.read_bytes()
    assert hashlib.sha256(data).hexdigest()==row['sha256']
    if target.exists():
        if target.read_bytes()!=data: raise SystemExit('STOP: existing configuration differs: '+row['original'])
        print('Already present: '+row['original']);continue
    if a.write: target.parent.mkdir(parents=True,exist_ok=True);target.write_bytes(data);print('Restored: '+row['original'])
    else: print('Would restore: '+row['original']+' (use --write only after review)')
