import os
from dotenv import load_dotenv
import libsql_client

# Load environment variables from .env file
load_dotenv()

# Get Turso database credentials from environment variables
db_url = os.environ.get("TURSO_DATABASE_URL")
auth_token = os.environ.get("TURSO_AUTH_TOKEN")

# Create a synchronous client to connect to the Turso database
client = libsql_client.create_client_sync(url=db_url, auth_token=auth_token)

try:
    # Execute a query to retrieve the schema of the 'issues' table
    result = client.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='issues';")
    print("Schema:\n", result.rows[0][0])
except Exception as e:
    # Print any errors that occur during the query
    print("Error:", e)
finally:
    # Ensure the client is closed after the operation
    client.close()
