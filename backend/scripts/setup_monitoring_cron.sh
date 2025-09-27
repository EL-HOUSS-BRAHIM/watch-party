#!/bin/bash

# Set up cron job for regular monitoring
# This will run the monitoring script every 30 minutes

# Create crontab entry
(crontab -l 2>/dev/null; echo "*/30 * * * * /var/www/watchparty/scripts/monitor_resources.sh >> /var/log/watchparty/monitoring_output.log 2>&1") | crontab -

echo "Cron job set up to run every 30 minutes"
echo "To add email alerts, modify the cron job to: /var/www/watchparty/scripts/monitor_resources.sh --email your@email.com"
