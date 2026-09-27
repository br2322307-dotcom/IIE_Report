import os
import libsql_client
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash

# Load environment variables from .env file
load_dotenv()

def init_db():
    url = os.environ.get("TURSO_DATABASE_URL")
    token = os.environ.get("TURSO_AUTH_TOKEN")

    # Connect to Turso Cloud
    print("Connecting to Turso Cloud Database...")
    client = libsql_client.create_client_sync(url=url, auth_token=token)

    try:
        # 1. Create Users Table
        client.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            student_id TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL
        );
        """)
        print("Users table checked/created.")
        
        # 2. Create Issues Table
        client.execute("""
        CREATE TABLE IF NOT EXISTS issues (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            owner_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            priority TEXT NOT NULL,
            status TEXT DEFAULT 'Pending',
            FOREIGN KEY (owner_id) REFERENCES users (id)
        );
        """)
        print("Issues table checked/created.")

        # 3. Insert Dummy Data for Testing
        try:
            # Dummy Student
            client.execute(
                "INSERT INTO users (name, student_id, password_hash, role) VALUES (?, ?, ?, ?)",
                ['Biman Roy', 'CSE73', generate_password_hash('biman123'), 'student']
            )
            
            client.execute(
                 "INSERT INTO users (name, student_id, password_hash, role) VALUES (?, ?, ?, ?)",
                 ['jishnu', 'CSE74', generate_password_hash('jishnu123'), 'student']
             )
            
            # Dummy Admin
            client.execute(
                "INSERT INTO users (name, student_id, password_hash, role) VALUES (?, ?, ?, ?)",
                ['Admin User', 'IIE', generate_password_hash('iie7778'), 'admin']
            )
            print("Dummy users added successfully.")
        except Exception as e:
            # If data already exists, it will throw an error which we catch here
            if "UNIQUE constraint failed" in str(e):
                print("Dummy users already exist in the database.")
            else:
                print("Note on dummy data:", e)

        print("\nDatabase and tables setup completed successfully!")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        client.close()

if __name__ == '__main__':
    init_db()
