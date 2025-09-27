# Nginx Configuration Files

This directory contains nginx configurations and setup tools for the Watch Party backend.

## 📁 Files Overview

### 🔧 Configuration Files

#### `nginx-cloudflare-full-strict.conf` ⭐ **Production Recommended**
- **Purpose**: Complete configuration for Cloudflare Full (strict) SSL mode
- **Features**: 
  - HTTP to HTTPS redirects
  - Strong SSL/TLS configuration with origin certificates
  - HSTS headers and OCSP stapling
  - Complete Cloudflare integration with IP restriction
  - Advanced security features
- **Use When**: Production deployment with Cloudflare Full (strict) mode
- **Requires**: Cloudflare Origin Certificate

#### `nginx-ssl.conf` 
- **Purpose**: Direct SSL configuration without Cloudflare
- **Features**:
  - Standard SSL/TLS termination
  - Security headers
  - Direct HTTPS handling
- **Use When**: No Cloudflare proxy or different CDN
- **Requires**: Valid SSL certificate from trusted CA

### 🚀 Setup Scripts

#### `setup-cloudflare-ssl.sh` ⚡ **Interactive Setup**
```bash
sudo ./setup-cloudflare-ssl.sh
```
- Interactive script for Cloudflare Origin Certificate setup
- Guides you through certificate installation
- Sets proper file permissions
- Provides configuration deployment steps

#### `verify-cloudflare-setup.sh` 🔍 **Health Check**
```bash
./verify-cloudflare-setup.sh
```
- Comprehensive setup verification
- Checks nginx configuration, SSL certificates, and services
- Validates Cloudflare integration
- Provides troubleshooting information

### 📖 Documentation

#### `CLOUDFLARE_SSL_GUIDE.md` 📚 **Complete Guide**
- Step-by-step Cloudflare Full (strict) SSL setup
- Security best practices
- Troubleshooting guide
- Performance optimization tips

#### `NGINX_CONFIG_GUIDE.md` 📖 **Configuration Reference**  
- Detailed nginx configuration explanation
- Options and alternatives
- Security considerations

## 🚀 Quick Start

### For Production (Cloudflare Full Strict) - Recommended

1. **Get Cloudflare Origin Certificate**:
   - Go to Cloudflare Dashboard → SSL/TLS → Origin Server
   - Create certificate for `*.your-domain.com`
   - Download certificate and private key

2. **Run Setup Script**:
   ```bash
   sudo ./setup-cloudflare-ssl.sh
   ```

3. **Deploy Configuration**:
   ```bash
   sudo cp nginx-cloudflare-full-strict.conf /etc/nginx/sites-available/watchparty
   sudo ln -sf /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

4. **Verify Setup**:
   ```bash
   ./verify-cloudflare-setup.sh
   ```

### For Development or Non-Cloudflare Setup

1. **Use Direct SSL Configuration**:
   ```bash
   sudo cp nginx-ssl.conf /etc/nginx/sites-available/watchparty
   sudo ln -sf /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/
   ```

2. **Install SSL Certificate** (Let's Encrypt example):
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

3. **Test and Reload**:
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

## 🛡️ Security Features

All configurations include:
- **IP Restriction**: Only Cloudflare IPs allowed (in Cloudflare configs)
- **Security Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Attack Protection**: Blocks common attack patterns
- **File Protection**: Prevents access to sensitive files
- **Performance**: Gzip compression and optimized caching

## 🔧 Current Active Configuration

The main nginx configuration is located at `../nginx.conf` (project root). This is the currently active configuration with enhanced security features suitable for most deployments.

## 📊 Configuration Comparison

| Feature | nginx.conf (Active) | Full Strict | SSL Direct |
|---------|-------------------|-------------|------------|
| Cloudflare IP Restriction | ✅ | ✅ | ❌ |
| HTTPS Redirect | ❌ | ✅ | ✅ |
| SSL Termination | ❌ (Cloudflare) | ✅ | ✅ |
| HSTS Headers | ❌ | ✅ | ✅ |
| Origin Certificate | ❌ | Required | ❌ |
| Public Certificate | ❌ | ❌ | Required |

## 🆘 Troubleshooting

1. **403 Forbidden**: Check Cloudflare IP ranges and restrictions
2. **SSL Errors**: Verify certificate paths and validity  
3. **Config Errors**: Run `sudo nginx -t` for syntax checking
4. **Service Issues**: Use `./verify-cloudflare-setup.sh` for diagnosis

## 📞 Getting Help

- Read the complete [CLOUDFLARE_SSL_GUIDE.md](CLOUDFLARE_SSL_GUIDE.md)
- Run verification script for automated troubleshooting
- Check nginx error logs: `/var/log/nginx/error.log`
- Review project documentation in [`../docs/`](../README.md)

---

💡 **Tip**: Always run `./verify-cloudflare-setup.sh` after making configuration changes to ensure everything is working correctly.
