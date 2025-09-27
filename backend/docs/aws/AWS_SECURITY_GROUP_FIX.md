# AWS Security Group Configuration Guide

## Current Status ✅ 
- **HTTP (Port 80)**: Working correctly
- **Application Services**: All running properly  
- **Django ALLOWED_HOSTS**: Fixed to include server IP
- **HTTPS (Port 443)**: ❌ **BLOCKED - AWS Security Group Issue**

## Issue Identified 🔍
The HTTPS connection is failing because **port 443 is not open** in your AWS EC2 security group.

**Test Result:**
```bash
# This works (HTTP)
curl http://be-watch-party.brahim-elhouss.me/health/
# Returns: 301 redirect to HTTPS

# This fails (HTTPS) 
curl https://be-watch-party.brahim-elhouss.me/health/
# Error: Connection refused
```

## Fix Required: AWS Security Group 🛠️

### Step 1: Open AWS Console
1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Navigate to **Security Groups**
3. Find your watch-party security group

### Step 2: Add HTTPS Inbound Rule
Add this rule to your security group:

| Type  | Protocol | Port Range | Source    | Description |
|-------|----------|------------|-----------|-------------|
| HTTPS | TCP      | 443        | 0.0.0.0/0 | HTTPS web traffic |

### Step 3: Verify Current Rules
Your security group should have:
- ✅ **HTTP (80)** from 0.0.0.0/0  
- ✅ **HTTPS (443)** from 0.0.0.0/0 ← **ADD THIS**
- ✅ **SSH (22)** from your IP
- ✅ **PostgreSQL (5432)** (if external DB)
- ✅ **Redis (6379)** (if external Redis)

## Additional Check: Cloudflare Settings 🌐

### Verify Cloudflare Configuration
1. Go to your Cloudflare dashboard
2. Select domain: `brahim-elhouss.me`
3. Check these settings:

#### SSL/TLS Settings:
- **SSL Mode**: Should be "Flexible" (Cloudflare ↔ HTTP ↔ Your Server)
- **Edge Certificates**: Should be active

#### DNS Settings:  
- **be-watch-party.brahim-elhouss.me**: Should be **Proxied** (orange cloud ☁️)
- **A Record**: Should point to `35.181.208.71`

## Testing Commands 🧪

After fixing the security group, test these:

```bash
# Should work (HTTP → HTTPS redirect)
curl -I http://be-watch-party.brahim-elhouss.me/health/

# Should work (HTTPS through Cloudflare)  
curl -I https://be-watch-party.brahim-elhouss.me/health/

# Should show connection accepted
telnet be-watch-party.brahim-elhouss.me 443
```

## Network Flow (How It Should Work) 🌊

```
User's Browser (HTTPS)
         ↓
    Cloudflare (SSL Termination)
         ↓  
Your Server Port 443 (AWS Security Group)
         ↓
    Nginx Port 80 (HTTP)
         ↓
  Django App Port 8001
```

## Quick Fix Summary 🚀

**The only thing you need to do:**
1. **Add port 443 to AWS Security Group inbound rules**
2. **Set source to 0.0.0.0/0**  
3. **Test HTTPS access**

That's it! Your application is working perfectly - it just needs port 443 open for HTTPS traffic.

## Verification Steps ✅

After making the AWS change:

1. **Test HTTP** (should work):
   ```bash
   curl http://be-watch-party.brahim-elhouss.me/health/
   ```

2. **Test HTTPS** (should work after fix):
   ```bash  
   curl https://be-watch-party.brahim-elhouss.me/health/
   ```

3. **Check API endpoints**:
   ```bash
   curl https://be-watch-party.brahim-elhouss.me/api/
   ```

---

**Current Status**: HTTP ✅ | HTTPS ❌ (AWS Security Group)  
**Fix Required**: Add port 443 inbound rule to AWS Security Group  
**Expected Result**: Full HTTPS access through Cloudflare 🎉
