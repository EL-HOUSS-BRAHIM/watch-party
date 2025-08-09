# WebSocket Configuration Documentation

## Overview

The Watch Party application includes comprehensive WebSocket Secure (WSS) support for real-time features like chat, video synchronization, and live notifications. This document details the WebSocket configuration and testing procedures.

## WebSocket Endpoints

### Backend WebSocket (Django Channels)
- **URL**: `wss://be-watch-party.brahim-elhouss.me/ws/`
- **Purpose**: Real-time chat, video sync, notifications
- **Protocol**: WebSocket Secure (WSS) over HTTPS/SSL
- **Authentication**: Token-based or session-based

### Frontend WebSocket (Next.js HMR)
- **URL**: `wss://watch-party.brahim-elhouss.me`
- **Purpose**: Hot Module Replacement in development, potential real-time features
- **Protocol**: WebSocket Secure (WSS) over HTTPS/SSL
- **Note**: Primarily for development HMR, may support client-side WebSocket features

## Nginx Configuration

### Backend WebSocket Proxy
```nginx
location /ws/ {
    proxy_pass http://backend_server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    
    # WebSocket specific timeouts
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
    proxy_connect_timeout 60s;
}
```

### Frontend WebSocket Support
```nginx
location / {
    proxy_pass http://frontend_server;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_redirect off;
    
    proxy_read_timeout 120s;
    proxy_send_timeout 120s;
    proxy_connect_timeout 60s;
}
```

## Environment Configuration

### Frontend Environment
```bash
# WebSocket URL for backend connections
NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me
```

### Backend Environment
```bash
# WebSocket settings in Django
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6380)],
            "password": "watchparty_redis_2025",
        },
    },
}
```

## SSL/TLS Configuration

All WebSocket connections use WSS (WebSocket Secure) with Let's Encrypt certificates:

- **Frontend SSL**: `/etc/letsencrypt/live/watch-party.brahim-elhouss.me/`
- **Backend SSL**: `/etc/letsencrypt/live/be-watch-party.brahim-elhouss.me/`
- **Protocol**: TLS 1.2 and 1.3 support
- **Auto-renewal**: Handled by deploy script

## Testing WebSocket Connections

### Using Health Check Script
```bash
# Test all WebSocket connections
./health-check.sh websocket

# Full health check including WebSocket tests
./health-check.sh check
```

### Using WebSocket Test Client
```bash
# Test all WebSocket endpoints
node test-websocket.js

# Test backend WebSocket only
node test-websocket.js backend

# Test frontend WebSocket support only
node test-websocket.js frontend
```

### Manual Testing with wscat
```bash
# Install wscat globally
npm install -g wscat

# Test backend WebSocket
wscat -c wss://be-watch-party.brahim-elhouss.me/ws/

# Test frontend WebSocket upgrade support
wscat -c wss://watch-party.brahim-elhouss.me
```

### Using cURL for HTTP Upgrade Test
```bash
# Test WebSocket upgrade headers
curl -I -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==" \
     https://be-watch-party.brahim-elhouss.me/ws/
```

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if Django Channels/Daphne is running: `pm2 status`
   - Verify Nginx is running: `systemctl status nginx`
   - Check port conflicts: `./port-manager.sh status`

2. **SSL Certificate Issues**
   - Verify certificates: `certbot certificates`
   - Renew if needed: `certbot renew`
   - Check Nginx SSL config: `nginx -t`

3. **WebSocket Upgrade Failures**
   - Check Nginx error logs: `tail -f /var/log/nginx/be-watch-party.error.log`
   - Verify proxy headers in Nginx config
   - Test with simple HTTP upgrade request

4. **Timeout Issues**
   - Increase proxy timeouts in Nginx configuration
   - Check Redis connection for Django Channels
   - Monitor WebSocket connection duration

### Log Files

- **Nginx Access**: `/var/log/nginx/be-watch-party.access.log`
- **Nginx Error**: `/var/log/nginx/be-watch-party.error.log`
- **Django**: `/home/ubuntu/watch-party/back-end/logs/django.log`
- **PM2 Logs**: `pm2 logs watch-party-backend`

## Development vs Production

### Development
- WebSocket connections may use `ws://` (non-secure)
- Next.js HMR uses WebSocket for live reloading
- Django development server handles WebSocket connections

### Production
- All WebSocket connections use `wss://` (secure)
- Nginx terminates SSL and proxies to backend services
- PM2 manages WebSocket server processes
- Redis handles WebSocket channel layers

## Security Considerations

1. **Authentication**: WebSocket connections should validate authentication tokens
2. **CORS**: Ensure WebSocket origins are properly configured
3. **Rate Limiting**: Nginx rate limiting applies to WebSocket upgrade requests
4. **SSL/TLS**: All production WebSocket traffic is encrypted
5. **Firewall**: Only necessary ports (80, 443) are exposed externally

## Monitoring

The health check script monitors WebSocket connectivity:
- Tests WebSocket upgrade capability
- Verifies SSL certificate validity
- Checks backend WebSocket endpoint responsiveness
- Monitors proxy configuration

For continuous monitoring, the health check can be run via cron:
```bash
# Add to crontab for monitoring every 5 minutes
*/5 * * * * /home/ubuntu/watch-party/health-check.sh websocket >> /var/log/websocket-health.log 2>&1
```
