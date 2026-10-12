"""Only fixed owned Site quality paths. Credential input is hidden and never written."""
import getpass,json,urllib.request,urllib.error,hashlib
HOSTS={'beacon':'https://beacon.r4dewangan.chatgpt.site','forge':'https://forge.r4dewangan.chatgpt.site','ledger':'https://ledger-q.r4dewangan.chatgpt.site'}
def main():
    p=json.loads(getpass.getpass('Hidden quality request: '));site=p['site'];host=HOSTS[site];token=p['token'];action=p.get('action','read')
    if action=='digest':print(json.dumps({'digest':hashlib.sha256(token.encode()).hexdigest()}));return
    if action not in ['read','engineering','live-ai']:raise ValueError('Unsupported operation')
    body=None if action=='read' else json.dumps({'mode':action}).encode()
    req=urllib.request.Request(host+'/api/quality/background',data=body,method='GET' if body is None else 'POST',headers={'OAI-Sites-Authorization':'Bearer '+token,'x-quality-monitor-service':token,**({'Content-Type':'application/json'} if body else {})})
    try:
        with urllib.request.urlopen(req,timeout=85) as r:
            j=json.loads(r.read(750000));print(json.dumps({'httpStatus':r.status,'result':j}))
    except urllib.error.HTTPError as e:
        try:j=json.loads(e.read(10000))
        except Exception:j={'error':'Non-JSON HTTP response'}
        print(json.dumps({'httpStatus':e.code,'result':j}))
    except Exception as e:print(json.dumps({'transportError':type(e).__name__}))
if __name__=='__main__':main()
