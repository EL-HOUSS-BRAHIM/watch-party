#!/bin/bash
# Simple memory monitoring script for Watch Party

LOG_FILE="/var/log/watchparty/memory-monitor.log"

# Create log file if it doesn't exist
mkdir -p /var/log/watchparty
touch $LOG_FILE

while true; do
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Get overall memory info
    MEMORY_INFO=$(free -m | grep "Mem:")
    SWAP_INFO=$(free -m | grep "Swap:")
    
    # Get Gunicorn memory usage
    GUNICORN_MEMORY=$(ps aux --sort=-%mem | grep gunicorn | grep -v grep | awk '{sum+=$6} END {printf "%.0f", sum/1024}')
    GUNICORN_PROCESSES=$(ps aux | grep gunicorn | grep -v grep | wc -l)
    
    # Log the information
    echo "[$TIMESTAMP] Memory: $MEMORY_INFO | Swap: $SWAP_INFO | Gunicorn: ${GUNICORN_MEMORY}MB (${GUNICORN_PROCESSES} processes)" >> $LOG_FILE
    
    # Check if memory usage is critical (>90%)
    MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    if [ $MEM_USAGE -gt 90 ]; then
        echo "[$TIMESTAMP] WARNING: High memory usage: ${MEM_USAGE}%" >> $LOG_FILE
        # Optionally restart services here
    fi
    
    # Sleep for 5 minutes
    sleep 300
done
