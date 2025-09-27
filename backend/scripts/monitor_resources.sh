#!/bin/bash

# Simple monitoring script for WatchParty server
# Usage: ./monitor_resources.sh [--email admin@example.com] [--threshold 90]

# Default settings
THRESHOLD=90
EMAIL=""
LOG_FILE="/var/log/watchparty/resource_usage.log"
ALERT_HISTORY="/var/log/watchparty/resource_alerts.log"

# Process command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --email)
      EMAIL="$2"
      shift 2
      ;;
    --threshold)
      THRESHOLD="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Ensure log directory exists
mkdir -p $(dirname "$LOG_FILE")
mkdir -p $(dirname "$ALERT_HISTORY")

# Get timestamp
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

# Get resource usage
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{print $3/$2 * 100.0}')
SWAP_USAGE=$(free | grep Swap | awk '{if ($2 > 0) print $3/$2 * 100.0; else print 0}')
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

# Round to integers
CPU_USAGE=$(printf "%.0f" "$CPU_USAGE")
MEMORY_USAGE=$(printf "%.0f" "$MEMORY_USAGE")
SWAP_USAGE=$(printf "%.0f" "$SWAP_USAGE")

# Get load average
LOAD_AVG=$(uptime | awk -F'load average:' '{ print $2 }' | sed 's/,.*//')

# Log resource usage
echo "$TIMESTAMP,CPU:$CPU_USAGE%,MEM:$MEMORY_USAGE%,SWAP:$SWAP_USAGE%,DISK:$DISK_USAGE%,LOAD:$LOAD_AVG" >> "$LOG_FILE"

# Check for alerts
ALERTS=""
if [ "$CPU_USAGE" -gt "$THRESHOLD" ]; then
  ALERTS="$ALERTS CPU usage is high: $CPU_USAGE%\n"
fi

if [ "$MEMORY_USAGE" -gt "$THRESHOLD" ]; then
  ALERTS="$ALERTS Memory usage is high: $MEMORY_USAGE%\n"
fi

if [ "$SWAP_USAGE" -gt "75" ]; then
  ALERTS="$ALERTS Swap usage is high: $SWAP_USAGE%\n"
fi

if [ "$DISK_USAGE" -gt "$THRESHOLD" ]; then
  ALERTS="$ALERTS Disk usage is high: $DISK_USAGE%\n"
fi

# Calculate processes by user
PROCESS_COUNT=$(ps -eo user | sort | uniq -c | sort -nr | head -5 | tr '\n' ' ')

# Get top memory processes
TOP_MEM_PROCESSES=$(ps -eo pid,pmem,rss,command --sort=-%mem | head -6 | tail -5 | sed 's/^/  /')

# Get top CPU processes
TOP_CPU_PROCESSES=$(ps -eo pid,pcpu,command --sort=-%cpu | head -6 | tail -5 | sed 's/^/  /')

# Print summary
echo "===== WatchParty Resource Monitor ====="
echo "Time: $TIMESTAMP"
echo "CPU Usage: $CPU_USAGE%"
echo "Memory Usage: $MEMORY_USAGE%"
echo "Swap Usage: $SWAP_USAGE%"
echo "Disk Usage: $DISK_USAGE%"
echo "Load Average: $LOAD_AVG"
echo
echo "Top Memory Processes:"
echo "$TOP_MEM_PROCESSES"
echo
echo "Top CPU Processes:"
echo "$TOP_CPU_PROCESSES"
echo

# Display decision guidance
if [ "$CPU_USAGE" -gt 85 ] && [ "$MEMORY_USAGE" -gt 85 ]; then
  echo "RECOMMENDATION: Consider SCALING the server (both CPU and memory are high)"
  echo "$TIMESTAMP - SCALING recommended (CPU: $CPU_USAGE%, MEM: $MEMORY_USAGE%)" >> "$ALERT_HISTORY"
elif [ "$CPU_USAGE" -gt 85 ] && [ "$MEMORY_USAGE" -le 70 ]; then
  echo "RECOMMENDATION: Consider CPU OPTIMIZATION or scaling to higher CPU instance"
  echo "$TIMESTAMP - CPU OPTIMIZATION recommended (CPU: $CPU_USAGE%)" >> "$ALERT_HISTORY"
elif [ "$MEMORY_USAGE" -gt 85 ] && [ "$CPU_USAGE" -le 70 ]; then
  echo "RECOMMENDATION: Consider MEMORY OPTIMIZATION or scaling to higher memory instance"
  echo "$TIMESTAMP - MEMORY OPTIMIZATION recommended (MEM: $MEMORY_USAGE%)" >> "$ALERT_HISTORY"
elif [ "$CPU_USAGE" -gt 70 ] || [ "$MEMORY_USAGE" -gt 70 ]; then
  echo "RECOMMENDATION: Monitor closely, optimize if consistent pattern observed"
else
  echo "RECOMMENDATION: Resource usage acceptable, no action needed"
fi

# Send email alert if configured and threshold exceeded
if [ -n "$ALERTS" ] && [ -n "$EMAIL" ]; then
  echo -e "WatchParty Server Alert\n\n$ALERTS\nTime: $TIMESTAMP\n\nTop Memory Processes:\n$TOP_MEM_PROCESSES\n\nTop CPU Processes:\n$TOP_CPU_PROCESSES" | mail -s "WatchParty Server Alert" "$EMAIL"
  echo "Alerts sent to $EMAIL"
elif [ -n "$ALERTS" ]; then
  echo -e "ALERTS:\n$ALERTS"
fi

# Done
exit 0
