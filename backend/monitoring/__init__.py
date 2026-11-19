import os
from flask import Blueprint, render_template, request, session, redirect, url_for, flash, jsonify, current_app
from werkzeug.security import check_password_hash
from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime

# Blueprint definition – static and template folders are inside the package
monitor_bp = Blueprint(
    "monitor",
    __name__,
    url_prefix="/admin",
    template_folder=os.path.join(os.path.dirname(__file__), "..", "templates", "monitor"),
    static_folder=os.path.join(os.path.dirname(__file__), "..", "static", "monitor"),
)

# Simple admin‑required decorator
def admin_required(view_func):
    def wrapper(*args, **kwargs):
        if session.get("admin_authenticated") and session.get("role") == "admin":
            return view_func(*args, **kwargs)
        flash("Admin login required", "warning")
        return redirect(url_for("monitor.login"))
    wrapper.__name__ = view_func.__name__
    return wrapper

# ---------------------- Admin Login ----------------------
@monitor_bp.route("/login", methods=["GET", "POST"])
def login():
    from backend.database.db import users_collection
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address

    # Initialise limiter only once per app (lazy)
    if not hasattr(current_app, "_limiter"):
        current_app._limiter = Limiter(current_app, key_func=get_remote_address)
    limiter = current_app._limiter
    # Apply rate limit – 5 attempts per minute per IP
    @limiter.limit("5 per minute")
    def _limited_login():
        if request.method == "GET":
            # generate a CSRF token for the form
            token = os.urandom(16).hex()
            session["login_csrf_token"] = token
            return render_template("login.html", csrf_token=token)
        # POST – process credentials
        data = request.form if request.form else request.get_json(silent=True) or {}
        username = data.get("username") or data.get("user_id")
        password = data.get("password")
        csrf_token = data.get("csrf_token")
        # Verify CSRF token
        if not csrf_token or csrf_token != session.get("login_csrf_token"):
            flash("Invalid CSRF token", "danger")
            return redirect(url_for("monitor.login"))
        # Remove token after use
        session.pop("login_csrf_token", None)
        # Look up admin user
        admin_user = users_collection.find_one({"$or": [{"user_id": username}, {"student_id": username}], "role": "admin"})
        if admin_user and check_password_hash(admin_user["password_hash"], password):
            # Successful login – set admin flags in session
            session.clear()
            session["user_id"] = admin_user.get("student_id") or admin_user.get("user_id")
            session["role"] = "admin"
            session["admin_authenticated"] = True
            flash("Logged in as admin", "success")
            return redirect(url_for("monitor.dashboard"))
        flash("Invalid admin credentials", "danger")
        return redirect(url_for("monitor.login"))
    return _limited_login()

@monitor_bp.route("/logout")
def logout():
    session.clear()
    flash("Logged out", "info")
    return redirect(url_for("monitor.login"))

# ---------------------- Dashboard ----------------------
@monitor_bp.route("/dashboard")
@admin_required
def dashboard():
    return render_template("dashboard.html")

# ---------------------- Monitoring API ----------------------
# The actual JSON payload generation lives in monitoring.health module – we import lazily to avoid circular imports
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
