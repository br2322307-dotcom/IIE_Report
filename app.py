from flask import Flask, render_template, request, redirect, session, url_for
from werkzeug.security import check_password_hash
import os
import libsql_client

app = Flask(__name__)

# Secret key is required for session management
app.secret_key = 'super_secret_key_for_your_app' 

# Home route
@app.route('/')
def about():
    return render_template('index.html') 

# --- TURSO CONNECTION FUNCTION ---
def get_db_connection():
    # Fetch URL and Token from environment variables
    db_url = os.environ.get("TURSO_DATABASE_URL")
    auth_token = os.environ.get("TURSO_AUTH_TOKEN")
    
    # Connect to Turso Cloud Database
    client = libsql_client.create_client_sync(url=db_url, auth_token=auth_token)
    return client

# Logout route
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('about'))

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_id_input = request.form.get('user_id') 
        password_input = request.form.get('password')

        client = get_db_connection()
        
        # Query the database using student_id
        result = client.execute("SELECT * FROM users WHERE student_id = ?", [user_id_input])
        
        # Check if user exists
        user = result.rows[0] if len(result.rows) > 0 else None
        client.close()

        # Verify user and password hash
        if user and check_password_hash(user['password_hash'], password_input):
            # Save required user details in session
            session['id'] = user['id'] # Integer Primary Key
            session['user_id'] = user['student_id'] # String ID for tracking (e.g., CSE101)
            session['name'] = user['name']
            session['role'] = user['role']
            
            # Role-based redirection
            if user['role'] == 'student':
                return redirect(url_for('student_dashboard'))
            elif user['role'] == 'admin':
                return redirect(url_for('admin_dashboard'))
        else:
            return "Invalid ID or Password! Please try again."

    return render_template('login.html')

# Route to delete an issue 
@app.route('/delete_issue/<int:issue_id>', methods=['POST'])
def delete_issue(issue_id):
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
        
    owner_id = session['id'] # Integer ID for secure deletion validation
    
    client = get_db_connection()
    client.execute('DELETE FROM issues WHERE id = ? AND owner_id = ?', [issue_id, owner_id])
    client.close()
    
    return redirect(url_for('student_dashboard'))

# Student dashboard route
@app.route('/student/dashboard')
def student_dashboard():
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
    
    client = get_db_connection()
    
    # 1. Fetch ALL issues sorted by newest first
    all_issues = client.execute('SELECT * FROM issues ORDER BY id DESC').rows
    
    # 2. Fetch ONLY the logged-in student's issues
    my_issues = client.execute('SELECT * FROM issues WHERE owner_id = ? ORDER BY id DESC', [session['id']]).rows
    
    client.close()
    
    return render_template('student/dashboard.html', all_issues=all_issues, my_issues=my_issues)

# Route to submit a new issue
@app.route('/submit_issue', methods=['POST'])
def submit_issue():
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
        
    title = request.form.get('title')
    category = request.form.get('category')
    priority = request.form.get('priority')
    description = request.form.get('description')
    
    owner_id = session['id'] # Links issue to the specific user securely
    
    client = get_db_connection()
    
    # Insert new issue with a default 'location' value
    client.execute('''
        INSERT INTO issues (owner_id, title, category, priority, description, location) 
        VALUES (?, ?, ?, ?, ?, 'Not Provided')
    ''', [owner_id, title, category, priority, description])
    
    client.close()
    
    return redirect(url_for('student_dashboard'))

# --- ADMIN ROUTES ---

# Admin Dashboard
@app.route('/admin/dashboard')
def admin_dashboard():
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect(url_for('login'))
    
    client = get_db_connection()
    
    # FIX APPLIED HERE: SQL JOIN
    # This combines the 'issues' table with the 'users' table based on the owner_id.
    # It allows the admin to pull the exact 'student_id' (User ID) to track who submitted what, 
    # without needing to display their actual name.
    issues = client.execute('''
        SELECT issues.*, users.student_id 
        FROM issues 
        JOIN users ON issues.owner_id = users.id 
        ORDER BY issues.id DESC
    ''').rows
    
    client.close()
    
    return render_template('admin/dashboard.html', issues=issues)

# Route for Admin to change the status of an issue
@app.route('/update_status/<int:issue_id>', methods=['POST'])
def update_status(issue_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect(url_for('login'))
        
    new_status = request.form.get('status')
    
    client = get_db_connection()
    client.execute('UPDATE issues SET status = ? WHERE id = ?', [new_status, issue_id])
    client.close()
    
    return redirect(url_for('admin_dashboard'))

# --- STUDENT VERIFICATION ROUTE ---

# Route for Student to Confirm or Reject
@app.route('/verify_resolution/<int:issue_id>', methods=['POST'])
def verify_resolution(issue_id):
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
        
    action = request.form.get('action') 
    owner_id = session['id'] 
    
    final_status = 'Resolved' if action == 'confirm' else 'In Progress'
    
    client = get_db_connection()
    client.execute('UPDATE issues SET status = ? WHERE id = ? AND owner_id = ?', [final_status, issue_id, owner_id])
    client.close()
    
    return redirect(url_for('student_dashboard'))

if __name__ == '__main__':
    app.run(debug=True)
