import os
import sqlite3
from werkzeug.security import generate_password_hash

def init_db():
    # 1. Dynamically set the correct directory paths
    current_dir = os.path.dirname(os.path.abspath(__file__))
    schema_path = os.path.join(current_dir, 'schema.sql')
    
    # Using '..' to create database.db in the root project folder
    db_path = os.path.join(current_dir, '..', 'database.db')

    # 2. Connect to the SQLite database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # 3. Read and execute the schema.sql file to create tables
    with open(schema_path, 'r') as f:
        cursor.executescript(f.read())

    # 4. Insert dummy student and admin data using unified columns (user_id and password_hash)
    try:
        cursor.execute("INSERT INTO users (name, user_id, password_hash, role) VALUES (?, ?, ?, ?)",
                       ('Biman Roy', 'bi', generate_password_hash('bi1'), 'student'))

        cursor.execute("INSERT INTO users (name, user_id, password_hash, role) VALUES (?, ?, ?, ?)",
                     ('jishnu', 'ji', generate_password_hash('ji1'), 'student'))
        
        cursor.execute("INSERT INTO users (name, user_id, password_hash, role) VALUES (?, ?, ?, ?)",
                       ('Admin User', 'ad', generate_password_hash('ad1'), 'admin'))
    except sqlite3.IntegrityError:
        print("Data already exists.")

    conn.commit()
    conn.close()
    print("Database and tables created successfully!")

if __name__ == '__main__':
    init_db()
