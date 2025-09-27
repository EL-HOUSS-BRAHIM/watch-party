# Nginx Configuration Guide

This project includes two nginx configuration templates optimized for different deployment scenarios.

## Configuration Files

### 1. nginx.conf (Default - Cloudflare Compatible)
**Use when**: Your domain is proxied through Cloudflare
- Cloudflare handles SSL termination
- Server only needs HTTP (port 80)
- Uses `CF-Connecting-IP` header for real client IPs
- Optimized for Cloudflare's proxy service

### 2. nginx-ssl.conf (SSL Version)  
**Use when**: Direct SSL termination on server (no Cloudflare proxy)
- Server handles SSL certificates directly
- Redirects HTTP to HTTPS
- Includes full SSL configuration
- Requires SSL certificates to be installed

## Automatic Selection

The deployment script (`scripts/production.sh`) automatically uses `nginx.conf` by default since the domain `be-watch-party.brahim-elhouss.me` is configured with Cloudflare.

## Manual Configuration

To use the SSL version instead:

1. Copy the SSL configuration:
```bash
sudo cp nginx-ssl.conf /etc/nginx/sites-available/watch-party
sudo systemctl reload nginx
```

2. Install SSL certificates:
```bash
# Example with Let's Encrypt
sudo certbot --nginx -d be-watch-party.brahim-elhouss.me
```

## Key Features

### Both Configurations Include:
- Static file serving (`/static/`, `/media/`)
- WebSocket proxy (`/ws/` → port 8002)
- API proxy (`/` → port 8001)
- Health check endpoint (`/health/`)
- Security headers
- Request size limits (100MB)
- Connection timeouts (300s)

### Cloudflare-Specific Features (nginx.conf):
- `real_ip_header CF-Connecting-IP`
- Cloudflare IP range trust
- No SSL configuration (Cloudflare handles it)

### SSL-Specific Features (nginx-ssl.conf):
- HTTP to HTTPS redirects
- SSL certificate configuration
- HSTS security headers
- Modern TLS protocols (1.2, 1.3)

## Port Configuration

- **Gunicorn (Django)**: Port 8001
- **Daphne (WebSockets)**: Port 8002
- **Nginx**: Port 80 (HTTP) / 443 (HTTPS)

## Testing Configurations

### Test Cloudflare Setup:
```bash
curl -H "Host: be-watch-party.brahim-elhouss.me" http://localhost/health/
```

### Test SSL Setup:
```bash  
curl -k https://be-watch-party.brahim-elhouss.me/health/
```

## Switching Between Configurations

The deployment script automatically detects and uses the correct configuration. To manually switch:

```bash
# Use Cloudflare version
sudo cp nginx.conf /etc/nginx/sites-available/watch-party

# Use SSL version  
sudo cp nginx-ssl.conf /etc/nginx/sites-available/watch-party

# Apply changes
sudo nginx -t && sudo systemctl reload nginx
```
