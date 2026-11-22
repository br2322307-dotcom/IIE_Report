import psutil, time, os
from datetime import datetime, timezone
from flask import current_app
from .logger import get_recent_errors

# Global start time for uptime
START_TIME = datetime.now(timezone.utc)

def system_overview():
    try:
        proc = psutil.Process(os.getpid())
        uptime = (datetime.now(timezone.utc) - START_TIME).total_seconds()
        return {
            "started_at": START_TIME.isoformat(),
            "uptime_seconds": int(uptime),
            "port": current_app.config.get("SERVER_PORT", 5000),
            "environment": os.getenv("FLASK_ENV", "development"),
            "last_health_check": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        return {
            "started_at": START_TIME.isoformat(),
            "uptime_seconds": 0,
            "port": 5000,
            "environment": os.getenv("FLASK_ENV", "serverless"),
            "last_health_check": datetime.now(timezone.utc).isoformat(),
            "note": "Running in serverless/restricted environment"
        }

def system_performance():
    try:
        proc = psutil.Process(os.getpid())
        cpu = psutil.cpu_percent(interval=None)
        vm = psutil.virtual_memory()
        return {
            "cpu_percent": cpu,
            "ram_percent": vm.percent,
            "total_memory_mb": vm.total // (1024 * 1024),
            "available_memory_mb": vm.available // (1024 * 1024),
            "process_memory_mb": proc.memory_info().rss // (1024 * 1024),
        }
    except Exception as e:
        return {
            "cpu_percent": 0.0,
            "ram_percent": 0.0,
            "total_memory_mb": 1024,
            "available_memory_mb": 1024,
            "process_memory_mb": 50,
            "serverless": True
        }

def database_status():
    try:
        from database.db import client
    except ImportError:
        from backend.database.db import client

    if client is None:
        return {"status": "error", "error": "Database client not initialized (MONGODB_URI missing)"}

    start = time.perf_counter()
    try:
        client.admin.command('ping')
        latency = (time.perf_counter() - start) * 1000
        return {"status": "ok", "latency_ms": round(latency, 1)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# In-memory counters for request tracking
API_COUNTERS = {}
API_LATENCIES = {}

def api_statistics():
    return {
        "total_requests": API_COUNTERS.get("total", 0),
        "successful_requests": API_COUNTERS.get("success", 0),
        "failed_requests": API_COUNTERS.get("fail", 0),
        "endpoints": API_COUNTERS.get("endpoints", {}),
        "latency_ms": API_LATENCIES.get("avg", 0),
    }

def recent_errors():
    return {"errors": get_recent_errors()}
