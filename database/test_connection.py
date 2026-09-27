import os
import libsql_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("TURSO_DATABASE_URL")
token = os.environ.get("TURSO_AUTH_TOKEN")

print(f"URL loaded: {url}")
print(f"Token loaded (first 10 chars): {token[:10]}...")

try:
    client = libsql_client.create_client_sync(url=url, auth_token=token)
    result = client.execute("SELECT 1")
    print("Connection Successful! Turso is working perfectly.")
    client.close()
except Exception as e:
    print(f"Connection Failed: {e}")
