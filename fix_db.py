import os
import libsql_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def fix_database():
    url = os.environ.get("TURSO_DATABASE_URL")
    token = os.environ.get("TURSO_AUTH_TOKEN")
    
    print("Connecting to Turso Cloud...")
    client = libsql_client.create_client_sync(url=url, auth_token=token)
    
    try:
        # 1. Drop the old issues table
        client.execute("DROP TABLE IF EXISTS issues;")
        
        # 2. Recreate the table with the 'created_at' column included from the start
        client.execute("""
        CREATE TABLE issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (owner_id) REFERENCES users (id)
        );
        """)
        print("Success: 'issues' table has been perfectly recreated with the 'created_at' column!")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    fix_database()
