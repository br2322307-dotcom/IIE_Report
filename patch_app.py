import re

with open(r'c:\Users\hante\OneDrive\Desktop\IIE_report - 2..0\backend\app.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports
if 'from datetime import datetime' not in content:
    content = content.replace('from bson.objectid import ObjectId', 'from bson.objectid import ObjectId\nfrom datetime import datetime, timezone')

if 'import pymongo' not in content:
    content = content.replace('from database.db', 'import pymongo\nfrom database.db')

old_submit = ""\"@app.route('/api/issues', methods=['POST'])
def submit_issue():
    # Security check
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({'error': 'Unauthorized'}), 401
        
    # Read the data sent from the React form
    data = request.json
    
    # Create a new document (like a row in SQL) for MongoDB
    new_issue = {
        "owner_id": session['id'], # Get the owner_id from the session securely
        "title": data.get('title'),
        "category": data.get('category'),
        "priority": data.get('priority'),
        "description": data.get('description'),
        "location": "Not Provided",
        "status": "Pending"
    }

    # Insert the new issue into the MongoDB collection
    issues_collection.insert_one(new_issue)
    
    return jsonify({'success': True})""\"

new_submit = ""\"@app.route('/api/issues', methods=['POST'])
def submit_issue():
    if 'user_id' not in session or session.get('role') != 'student':
        return jsonify({'error': 'Unauthorized: Only students can submit issues.'}), 401
        
    try:
        data = request.json
        if not data:
            return jsonify({'error': 'Invalid request format'}), 400
            
        title = data.get('title')
        category = data.get('category')
        priority = data.get('priority')
        description = data.get('description')
        location = data.get('location')
        
        if not all([title, category, description, location]):
            return jsonify({'error': 'Missing required fields: title, category, description, and location are required.'}), 400
            
        location = location.strip() if location else "Campus"
        if not location:
            location = "Campus"
            
        new_issue = {
            "owner_id": session['id'],
            "reporter_name": session.get('name'),
            "title": title,
            "category": category,
            "priority": priority,
            "description": description,
            "location": location,
            "status": "Pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }

        issues_collection.insert_one(new_issue)
        new_issue['_id'] = str(new_issue['_id'])
        return jsonify({'success': True, 'issue': new_issue}), 201
        
    except pymongo.errors.PyMongoError:
        return jsonify({'error': 'Database write failed. Please try again later.'}), 500
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred.'}), 500""\"

if old_submit in content:
    content = content.replace(old_submit, new_submit)
else:
    print("Could not find the old submit_issue function to replace.")

with open(r'c:\Users\hante\OneDrive\Desktop\IIE_report - 2..0\backend\app.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied to app.py")
