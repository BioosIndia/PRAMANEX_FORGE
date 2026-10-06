"""Read only the fixed synthetic endpoint twice. Optional Sites dispatch token enters hidden stdin only."""
import json
import sys
import termios
import urllib.request

if sys.stdin.isatty():
    prior = termios.tcgetattr(sys.stdin.fileno())
    hidden = termios.tcgetattr(sys.stdin.fileno())
    hidden[3] &= ~termios.ECHO
    termios.tcsetattr(sys.stdin.fileno(), termios.TCSANOW, hidden)
    print('Ready for hidden verification input.', flush=True)
    try:
        config = json.loads(sys.stdin.readline())
    finally:
        termios.tcsetattr(sys.stdin.fileno(), termios.TCSANOW, prior)
else:
    config = json.loads(sys.stdin.readline())

headers = {'Accept': 'application/json'}
if config.get('token'):
    headers['OAI-Sites-Authorization'] = 'Bearer ' + config['token']
url = 'https://forge.r4dewangan.chatgpt.site/api/working-proof'
class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, response_headers, new_url):
        return None
opener = urllib.request.build_opener(NoRedirect())
try:
    def read():
        request = urllib.request.Request(url, headers=headers, method='GET')
        with opener.open(request, timeout=30) as response:
            return json.loads(response.read())
    first, second = read(), read()
    assert first['id'] == 'synthetic-cmc-working-proof-v1'
    assert first['saved'] is True and first['synthetic'] is True and first['readOnly'] is True
    assert first['release'] is False and first['assessment']['status'] == 'HOLD'
    assert first == second
    print(json.dumps({'saved': True, 'freshReadbackVerified': True, 'savedAt': first['savedAt'], 'recordHash': first['recordHash'], 'assessmentRevision': first['assessment']['revision'], 'sources': len(first['state']['sources']), 'facts': len(first['state']['fields']), 'exampleDecisions': len(first['state']['decisions']), 'status': 'HOLD', 'release': False}), flush=True)
except Exception as error:
    print(json.dumps({'verified': False, 'errorType': type(error).__name__, 'httpStatus': getattr(error, 'code', None)}), flush=True)
    sys.exit(1)
