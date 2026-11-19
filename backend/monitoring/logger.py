import logging
from logging.handlers import MemoryHandler

# Configure a logger for the backend
logger = logging.getLogger('backend')
logger.setLevel(logging.INFO)

# MemoryHandler that keeps the last 100 log records
memory_handler = MemoryHandler(capacity=100, flushLevel=logging.ERROR, target=None)
logger.addHandler(memory_handler)

def get_recent_errors():
    """Return recent error records as a list of plain dicts, stripping secrets."""
    records = []
    for record in memory_handler.buffer:
        # Convert LogRecord to a dict
        rec = {
            "level": record.levelname,
            "message": record.getMessage(),
            "time": record.created,
            "module": record.module,
            "func": record.funcName,
        }
        # Simple sanitisation – drop any field that looks like a secret
        if any(secret in rec["message"].lower() for secret in ["password", "secret", "token", "key"]):
            continue
        records.append(rec)
    # Return newest first
    return list(reversed(records))
