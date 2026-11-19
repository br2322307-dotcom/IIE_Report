import psutil, time, os
from datetime import datetime
from flask import current_app
from .logger import get_recent_errors

# Global start time for uptime
START_TIME = datetime.utcnow()

def system_overview():
    proc = psutil.Process(os.getpid())
    uptime = (datetime.utcnow() - START_TIME).total_seconds()
    return {
        "started_at": START_TIME.isoformat() + "Z",
        "uptime_seconds": int(uptime),
        "port": current_app.config.get("SERVER_PORT", 5000),
        "environment": os.getenv("FLASK_ENV", "development"),
        "last_health_check": datetime.utcnow().isoformat() + "Z",
    }

def system_performance():
    proc = psutil.Process(os.getpid())
    cpu = psutil.cpu_percent(interval=0.1)
    vm = psutil.virtual_memory()
    return {
        "cpu_percent": cpu,
        "ram_percent": vm.percent,
        "total_memory_mb": vm.total // (1024 * 1024),
        "available_memory_mb": vm.available // (1024 * 1024),
        "process_memory_mb": proc.memory_info().rss // (1024 * 1024),
    }

def database_status():
    from backend.database.db import client
    start = time.perf_counter()
    try:
        client.admin.command('ping')
        latency = (time.perf_counter() - start) * 1000
        return {"status": "ok", "latency_ms": round(latency, 1)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

# Simple in‑memory counters – will be incremented elsewhere (middleware)
API_COUNTERS = {}
API_LATENCIES = {}

def api_statistics():
    # Return a snapshot of counters – if counters are missing, default to 0
    return {
        "total_requests": API_COUNTERS.get("total", 0),
        "successful_requests": API_COUNTERS.get("success", 0),
        "failed_requests": API_COUNTERS.get("fail", 0),
        "endpoints": API_COUNTERS.get("endpoints", {}),
        "latency_ms": API_LATENCIES.get("avg", 0),
    }

def recent_errors():
    # Use the logger's memory handler to fetch recent error records
    return {"errors": get_recent_errors()}
