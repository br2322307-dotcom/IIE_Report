from flask import Flask, jsonify
from pymongo import MongoClient

# Initialize the Flask application
app = Flask(__name__)

# MongoDB connection URI (Note: In production, this should be an environment variable)
mongo_uri = "mongodb+srv://hanterreal721_db_user:<db_password>@cluster0.0bagoij.mongodb.net/?appName=Cluster0"
client = MongoClient(mongo_uri)

# Route to test the MongoDB connection
@app.route("/ping-db")
def ping_db():
    try:
        # Ping the database to check if it's reachable
        client.admin.command("ping")
        return jsonify({"ok": True, "message": "MongoDB is reachable"})
    except Exception as e:
        # Return an error message if the connection fails
        return jsonify({"ok": False, "error": str(e)}), 500

# Default route to confirm the server is running
@app.route("/")
def index():
    return "Flask + MongoDB is running. Try GET /ping-db"

# Start the Flask development server
if __name__ == "__main__":
    app.run()