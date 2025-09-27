"""
Custom logging utilities and handlers for Watch Party Backend
"""

import os
import logging
import logging.handlers
from pathlib import Path
from django.conf import settings


class AutoCreateFileHandler(logging.FileHandler):
    """
    A file handler that automatically creates the directory structure
    and sets proper permissions for log files.
    """
    
    def __init__(self, filename, mode='a', encoding=None, delay=False, errors=None):
        # Ensure the directory exists
        log_path = Path(filename)
        log_dir = log_path.parent
        
        # Create directory with proper permissions if it doesn't exist
        if not log_dir.exists():
            log_dir.mkdir(parents=True, exist_ok=True)
            # Set directory permissions (755 - owner: rwx, group: rx, others: rx)
            os.chmod(log_dir, 0o755)
        
        # Call parent constructor
        super().__init__(filename, mode, encoding, delay, errors)
        
        # Set file permissions after creation (644 - owner: rw, group: r, others: r)
        if os.path.exists(filename):
            os.chmod(filename, 0o644)


class AutoCreateRotatingFileHandler(logging.handlers.RotatingFileHandler):
    """
    A rotating file handler that automatically creates the directory structure
    and sets proper permissions for log files.
    """
    
    def __init__(self, filename, mode='a', maxBytes=0, backupCount=0, encoding=None, delay=False, errors=None):
        # Ensure the directory exists
        log_path = Path(filename)
        log_dir = log_path.parent
        
        # Create directory with proper permissions if it doesn't exist
        if not log_dir.exists():
            log_dir.mkdir(parents=True, exist_ok=True)
            # Set directory permissions (755 - owner: rwx, group: rx, others: rx)
            os.chmod(log_dir, 0o755)
        
        # Call parent constructor
        super().__init__(filename, mode, maxBytes, backupCount, encoding, delay, errors)
        
        # Set file permissions after creation (644 - owner: rw, group: r, others: r)
        if os.path.exists(filename):
            os.chmod(filename, 0o644)


def ensure_log_directories():
    """
    Ensure all required log directories exist with proper permissions.
    This function can be called during Django startup.
    """
    if hasattr(settings, 'BASE_DIR'):
        log_directories = [
            Path(settings.BASE_DIR) / 'logs',
            Path('/var/log/watchparty') if os.path.exists('/var/log') else None,
        ]
        
        for log_dir in log_directories:
            if log_dir is not None:
                try:
                    log_dir.mkdir(parents=True, exist_ok=True)
                    os.chmod(log_dir, 0o755)
                    
                    # Create default log files with proper permissions
                    default_logs = [
                        'django.log',
                        'security.log', 
                        'performance.log',
                        'django_errors.log',
                        'access.log',
                        'error.log'
                    ]
                    
                    for log_file in default_logs:
                        log_path = log_dir / log_file
                        if not log_path.exists():
                            log_path.touch()
                            os.chmod(log_path, 0o644)
                            
                except (PermissionError, OSError) as e:
                    # If we can't create system logs, just continue with project logs
                    print(f"Warning: Could not create log directory {log_dir}: {e}")
                    continue
