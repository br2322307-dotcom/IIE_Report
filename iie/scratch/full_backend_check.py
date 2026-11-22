import requests
import json
import os

BASE_URL = os.getenv('BASE_URL', 'http://127.0.0.1:5000')

endpoints = [
    ('/api/health', 'GET'),
    ('/api/auth/me', 'GET'),
    ('/api/admin/dashboard', 'GET'),
    ('/api/student/dashboard', 'GET'),
    ('/api/issues', 'GET'),
    ('/api/workers', 'GET'),
    ('/api/announcements', 'GET'),
]

print('🔎 Starting full backend re‑check...')
for path, method in endpoints:
    url = f"{BASE_URL}{path}"
    try:
        resp = requests.request(method, url, timeout=5)
        print(f"{method} {path} → {resp.status_code}")
        # try to pretty‑print JSON if possible
        try:
            data = resp.json()
            print(json.dumps(data, indent=2)[:200] + ('...' if len(json.dumps(data)) > 200 else ''))
        except Exception:
            print('   (no JSON body)')
    except Exception as e:
        print(f"{method} {path} → ERROR: {e}")

print('✅ Re‑check completed.')
