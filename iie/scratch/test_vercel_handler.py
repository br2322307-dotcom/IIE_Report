import sys, os

# Add project root (one level up from this file) to sys.path for imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
if project_root not in sys.path:
    sys.path.append(project_root)

# Now import the Vercel handler
from api.index import handler

# Simple mock Vercel request/response utilities
def mock_vercel_request(path, method='GET'):
    return {
        'path': path,
        'method': method,
        'query': '',
        'headers': {},
        'body': b''
    }

class MockResponse:
    def __init__(self):
        self.status_code = None
        self.headers = {}
        self.body = b''
    def write(self, data):
        if isinstance(data, str):
            data = data.encode()
        self.body += data

# Test the health endpoint
req = mock_vercel_request('/api/health')
resp = MockResponse()
handler(req, resp)
print('Status:', resp.status_code)
print('Headers:', resp.headers)
print('Body:', resp.body.decode())
