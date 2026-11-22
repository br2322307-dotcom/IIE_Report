import os
from flask import Blueprint, render_template, render_template_string, request, session, redirect, url_for, flash, jsonify, current_app
from werkzeug.security import check_password_hash
from bson.objectid import ObjectId
from datetime import datetime

# Blueprint definition
monitor_bp = Blueprint(
    "monitor",
    __name__,
    url_prefix="/admin/monitor",
    template_folder=os.path.join(os.path.dirname(__file__), "..", "templates", "monitor"),
    static_folder=os.path.join(os.path.dirname(__file__), "..", "static", "monitor"),
)

# Helper function to get users collection safely
def get_users_collection():
    try:
        from database.db import users_collection
        return users_collection
    except ImportError:
        try:
            from backend.database.db import users_collection
            return users_collection
        except ImportError:
            return None

# Simple admin-required decorator
def admin_required(view_func):
    def wrapper(*args, **kwargs):
        if session.get("admin_authenticated") and session.get("role") == "admin":
            return view_func(*args, **kwargs)
        flash("Admin login required", "warning")
        return redirect(url_for("monitor.login"))
    wrapper.__name__ = view_func.__name__
    return wrapper

# Default fallback templates if files are missing
DEFAULT_LOGIN_HTML = """<!DOCTYPE html>
<html>
<head><title>System Monitor Login</title>
<style>
body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: #f8fafc; }
.card { background: #1e293b; padding: 2rem; border-radius: 8px; width: 320px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); }
input { width: 100%; padding: 8px; margin: 8px 0; border-radius: 4px; border: 1px solid #334155; background: #0f172a; color: #fff; box-sizing: border-box; }
button { width: 100%; padding: 10px; background: #3b82f6; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 10px; }
.msg { color: #ef4444; font-size: 0.9rem; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="card">
  <h2>Monitor Login</h2>
  {% for msg in get_flashed_messages() %}<div class="msg">{{ msg }}</div>{% endfor %}
  <form method="POST">
    <input type="hidden" name="csrf_token" value="{{ csrf_token }}">
    <label>Admin ID:</label>
    <input type="text" name="username" required>
    <label>Password:</label>
    <input type="password" name="password" required>
    <button type="submit">Sign In</button>
  </form>
</div>
</body>
</html>"""

DEFAULT_DASHBOARD_HTML = """<!DOCTYPE html>
<html>
<head><title>System Health Dashboard</title>
<style>
body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
.card { background: #1e293b; padding: 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; }
pre { background: #0f172a; padding: 1rem; border-radius: 4px; overflow-x: auto; color: #38bdf8; }
a { color: #38bdf8; text-decoration: none; }
</style>
</head>
<body>
<h1>System Health & Monitoring Dashboard</h1>
<p><a href="{{ url_for('monitor.logout') }}">Logout</a></p>
<div class="card">
  <h3>Live API Endpoints</h3>
  <ul>
    <li><a href="{{ url_for('monitor.api_overview') }}" target="_blank">/admin/monitor/api/overview</a></li>
    <li><a href="{{ url_for('monitor.api_performance') }}" target="_blank">/admin/monitor/api/performance</a></li>
    <li><a href="{{ url_for('monitor.api_database') }}" target="_blank">/admin/monitor/api/database</a></li>
    <li><a href="{{ url_for('monitor.api_api_stats') }}" target="_blank">/admin/monitor/api/api_stats</a></li>
    <li><a href="{{ url_for('monitor.api_errors') }}" target="_blank">/admin/monitor/api/errors</a></li>
  </ul>
</div>
</body>
</html>"""

# ---------------------- Admin Login ----------------------
@monitor_bp.route("/login", methods=["GET", "POST"])
def login():
    users_coll = get_users_collection()
    
    if request.method == "GET":
        token = os.urandom(16).hex()
        session["login_csrf_token"] = token
        try:
            return render_template("login.html", csrf_token=token)
        except Exception:
            return render_template_string(DEFAULT_LOGIN_HTML, csrf_token=token)

    # POST - authenticate admin
    data = request.form if request.form else request.get_json(silent=True) or {}
    username = data.get("username") or data.get("user_id")
    password = data.get("password")
    csrf_token = data.get("csrf_token")

    # Verify CSRF token if session token exists
    if session.get("login_csrf_token") and csrf_token != session.get("login_csrf_token"):
        flash("Invalid CSRF token", "danger")
        return redirect(url_for("monitor.login"))
    session.pop("login_csrf_token", None)

    if not users_coll:
        flash("Database connection unavailable", "danger")
        return redirect(url_for("monitor.login"))

    admin_user = users_coll.find_one({"$or": [{"user_id": username}, {"student_id": username}], "role": "admin"})
    if admin_user and check_password_hash(admin_user.get("password_hash", ""), password):
        session.clear()
        session["user_id"] = admin_user.get("student_id") or admin_user.get("user_id")
        session["role"] = "admin"
        session["admin_authenticated"] = True
        flash("Logged in as admin", "success")
        return redirect(url_for("monitor.dashboard"))

    flash("Invalid admin credentials", "danger")
    return redirect(url_for("monitor.login"))

@monitor_bp.route("/logout")
def logout():
    session.clear()
    flash("Logged out", "info")
    return redirect(url_for("monitor.login"))

# ---------------------- Dashboard ----------------------
@monitor_bp.route("/dashboard")
@admin_required
def dashboard():
    try:
        return render_template("dashboard.html")
    except Exception:
        return render_template_string(DEFAULT_DASHBOARD_HTML)

# ---------------------- Monitoring API ----------------------
from . import health

@monitor_bp.route("/api/overview")
@admin_required
def api_overview():
    return jsonify(health.system_overview())

@monitor_bp.route("/api/performance")
@admin_required
def api_performance():
    return jsonify(health.system_performance())

@monitor_bp.route("/api/database")
@admin_required
def api_database():
    return jsonify(health.database_status())

@monitor_bp.route("/api/api_stats")
@admin_required
def api_api_stats():
    return jsonify(health.api_statistics())

@monitor_bp.route("/api/errors")
@admin_required
def api_errors():
    return jsonify(health.recent_errors())
