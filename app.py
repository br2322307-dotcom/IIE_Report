from flask import Flask, render_template, request, redirect, session, url_for
import sqlite3
from werkzeug.security import check_password_hash
import os

app = Flask(__name__)

# Secret key is required for session management
app.secret_key = 'super_secret_key_for_your_app' 

# Home route
@app.route('/')
def about():
    return render_template('index.html') 

# Function to get database connection
def get_db_connection():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row 
    return conn

# Logout route
@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('about'))

# Login route
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Get data from the form
        user_id_input = request.form.get('user_id') 
        password_input = request.form.get('password')

        # Fetch user from database
        conn = get_db_connection()
        user = conn.execute("SELECT * FROM users WHERE user_id = ?", (user_id_input,)).fetchone()
        conn.close()

        # Check if user exists and password is correct
        if user and check_password_hash(user['password_hash'], password_input):
            # Save user details in session 
            session['id'] = user['id']
            session['user_id'] = user['user_id']
            session['name'] = user['name']
            session['role'] = user['role']
            
            # Redirect based on user role
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
    # Check if user is logged in and is a student
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
        
    student_id = session['user_id']
    
    conn = get_db_connection()
    # The 'AND student_id = ?' condition ensures students can only delete their own issues
    conn.execute('DELETE FROM issues WHERE id = ? AND student_id = ?', (issue_id, student_id))
    conn.commit()
    conn.close()
    
    return redirect(url_for('student_dashboard'))

# Student dashboard route (Updated for transparent public board and personal pop-up)
@app.route('/student/dashboard')
def student_dashboard():
    # Check if user is logged in and is a student
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    
    # 1. Fetch ALL issues for the transparent public dashboard
    all_issues = conn.execute('''
        SELECT * FROM issues 
        ORDER BY created_at DESC
    ''').fetchall()
    
    # 2. Fetch ONLY the logged-in student's issues for their personal pop-up
    my_issues = conn.execute('''
        SELECT * FROM issues 
        WHERE student_id = ? 
        ORDER BY created_at DESC
    ''', (session['user_id'],)).fetchall()
    
    conn.close()
    
    # Send both data lists to the HTML template
    return render_template('student/dashboard.html', all_issues=all_issues, my_issues=my_issues)

# Route to submit a new issue from the student dashboard
@app.route('/submit_issue', methods=['POST'])
def submit_issue():
    # Ensure only logged-in students can submit issues
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
        
    # Get issue details from the modal form, including priority
    title = request.form.get('title')
    category = request.form.get('category')
    priority = request.form.get('priority') # New Priority field
    description = request.form.get('description')
    student_id = session['user_id'] 
    
    conn = get_db_connection()
    # Insert the new issue with priority into the database
    conn.execute('''
        INSERT INTO issues (student_id, title, category, priority, description) 
        VALUES (?, ?, ?, ?, ?)
    ''', (student_id, title, category, priority, description))
    conn.commit()
    conn.close()
    
    return redirect(url_for('student_dashboard'))


# --- ADMIN ROUTES ---

# Admin Dashboard (Updated to fetch all issues)
@app.route('/admin/dashboard')
def admin_dashboard():
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect(url_for('login'))
    
    conn = get_db_connection()
    issues = conn.execute('SELECT * FROM issues ORDER BY created_at DESC').fetchall()
    conn.close()
    
    return render_template('admin/dashboard.html', issues=issues)

# Route for Admin to change the status of an issue
@app.route('/update_status/<int:issue_id>', methods=['POST'])
def update_status(issue_id):
    if 'user_id' not in session or session.get('role') != 'admin':
        return redirect(url_for('login'))
        
    new_status = request.form.get('status')
    
    conn = get_db_connection()
    conn.execute('UPDATE issues SET status = ? WHERE id = ?', (new_status, issue_id))
    conn.commit()
    conn.close()
    
    return redirect(url_for('admin_dashboard'))


# --- STUDENT VERIFICATION ROUTE ---

# Route for Student to Confirm (Right) or Reject (Cross) the Admin's update
@app.route('/verify_resolution/<int:issue_id>', methods=['POST'])
def verify_resolution(issue_id):
    if 'user_id' not in session or session.get('role') != 'student':
        return redirect(url_for('login'))
        
    action = request.form.get('action') 
    student_id = session['user_id']
    
    # लॉजिक: 
    # Yes (confirm) दबाने पर -> 'Resolved'
    # No (reject) दबाने पर -> 'In Progress'
    final_status = 'Resolved' if action == 'confirm' else 'In Progress'
    
    conn = get_db_connection()
    conn.execute('UPDATE issues SET status = ? WHERE id = ? AND student_id = ?', (final_status, issue_id, student_id))
    conn.commit()
    conn.close()
    
    return redirect(url_for('student_dashboard'))


if __name__ == '__main__':
    app.run(debug=True)
