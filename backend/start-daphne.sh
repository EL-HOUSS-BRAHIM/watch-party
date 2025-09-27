cd /opt/watch-party-backend
source venv/bin/activate
set -a && source .env && set +a
exec daphne -b 127.0.0.1 -p 8002 --access-log /var/log/watchparty/daphne_access.log config.asgi:application
