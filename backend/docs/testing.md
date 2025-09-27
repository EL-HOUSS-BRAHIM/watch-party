When you use Cloudflare’s "Full (strict)" SSL mode, you’re telling Cloudflare to:

1. Accept only HTTPS from visitors to Cloudflare.


2. Connect to your origin server only over HTTPS.


3. Require that your origin server’s certificate is valid, trusted, and matches the hostname.



Here are the best practices for setting up your Nginx config to support Cloudflare Full (Strict) correctly:


---

1. Get a Valid Origin Certificate

You can either:

Use a certificate from a trusted CA (Let’s Encrypt, ZeroSSL, etc.)

Or use a Cloudflare Origin Certificate (valid for up to 15 years) — this is easier and avoids public CA rate limits.


Install it on your server and make sure Nginx is pointing to it.


Example:

ssl_certificate     /etc/ssl/certs/origin.crt;
ssl_certificate_key /etc/ssl/private/origin.key;


---

2. Restrict Access to Cloudflare IPs Only

Without this, attackers could bypass Cloudflare and hit your server directly.

# Cloudflare IPs - update periodically from https://www.cloudflare.com/ips/
set_real_ip_from 103.21.244.0/22;
set_real_ip_from 103.22.200.0/22;
set_real_ip_from 103.31.4.0/22;
set_real_ip_from 141.101.64.0/18;
set_real_ip_from 108.162.192.0/18;
# (add all IPs from Cloudflare’s list)
real_ip_header CF-Connecting-IP;

# Block non-Cloudflare requests
geo $allow_cf {
    default 0;
    103.21.244.0/22 1;
    103.22.200.0/22 1;
    103.31.4.0/22 1;
    141.101.64.0/18 1;
    108.162.192.0/18 1;
}
map $allow_cf $block_not_cf {
    0 1;
    1 0;
}
server {
    if ($block_not_cf) {
        return 403;
    }
    ...
}


---

3. Redirect All HTTP to HTTPS

Even though Cloudflare handles HTTPS externally, you want to enforce HTTPS internally.

server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}


---

4. Use Strong TLS Configuration

Only TLS 1.2 and TLS 1.3

Strong ciphers

HSTS enabled (optional but recommended)


ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers EECDH+AESGCM:EDH+AESGCM;
ssl_prefer_server_ciphers on;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 1h;

add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;


---

5. Enable OCSP Stapling (Performance & Security)

ssl_stapling on;
ssl_stapling_verify on;
resolver 1.1.1.1 1.0.0.1 valid=300s;
resolver_timeout 5s;


---

6. Verify Hostname Matches Certificate

Cloudflare will already enforce this in Full (Strict) mode, but you should double-check your Nginx server_name matches your certificate’s CN/SAN.


---

✅ Checklist for Full (Strict) to work

Valid cert (Cloudflare origin cert or public CA)

Nginx serves it correctly

Origin only allows Cloudflare IPs

Strong TLS settings

Redirects to HTTPS

OCSP stapling on



---

If you want, I can write you a full drop-in nginx.conf that’s production-ready for Cloudflare Full (Strict), including auto-blocking non-Cloudflare IPs and best-practice TLS.

Do you want me to prepare that complete config?

