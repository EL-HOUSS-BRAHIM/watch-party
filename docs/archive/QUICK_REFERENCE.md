# Quick Reference - AWS Development Setup 🚀

## 📋 Available Scripts

### 1. Configure AWS Credentials
```bash
./configure-aws.sh
```
**Use when:** First time setup or when credentials change

---

### 2. Setup Backend with AWS Services
```bash
./setup-backend-env-from-aws.sh
```
**What it does:**
- Fetches secrets from AWS Secrets Manager
- Creates `backend/.env` with production AWS endpoints
- Tests connections (will fail due to VPC security groups - this is normal)

**Use when:** You want to work with production AWS infrastructure

---

### 3. Setup Local Development Environment
```bash
./setup-local-dev.sh
```
**What it does:**
- Starts local PostgreSQL and Redis in Docker
- Updates `backend/.env` for local development
- Backs up AWS configuration to `backend/.env.aws.backup`

**Use when:** You want to develop locally without AWS dependencies

---

## 🔄 Switching Between Environments

### Switch to Local Development
```bash
./setup-local-dev.sh
```

### Switch Back to AWS
```bash
cp backend/.env.aws.backup backend/.env
```

Or re-run:
```bash
./setup-backend-env-from-aws.sh
```

---

## 🔐 Current AWS Setup

**Region:** `eu-west-3` (Paris)  
**Account:** `211125363745`  
**User:** `watch-party-secrets-access`

### Services Configured

| Service | Endpoint |
|---------|----------|
| **RDS PostgreSQL** | `watch-party-postgres.cj6w0queklir.eu-west-3.rds.amazonaws.com:5432` |
| **ElastiCache Valkey** | `master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com:6379` |
| **SES** | `email.eu-west-3.amazonaws.com` |

### Secrets Available

- ✅ `all-in-one-credentials` (DB username/password)
- ✅ `watch-party-valkey-001-auth-token` (Redis/Valkey password)

---

## 🚀 Running the Backend

### Basic Development Server
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Full Stack (All Services)
```bash
# Terminal 1: Django
cd backend
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Celery Worker
cd backend
celery -A config worker -l info

# Terminal 3: Celery Beat (Scheduled Tasks)
cd backend
celery -A config beat -l info

# Terminal 4: Daphne (WebSockets)
cd backend
daphne -b 0.0.0.0 -p 8001 config.asgi:application
```

---

## 🐳 Docker Services

### Start Local Services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Local Services
```bash
docker-compose -f docker-compose.dev.yml down
```

### View Logs
```bash
docker-compose -f docker-compose.dev.yml logs -f
```

### Check Status
```bash
docker-compose -f docker-compose.dev.yml ps
```

---

## 🔍 Troubleshooting

### Check AWS Credentials
```bash
aws sts get-caller-identity
```

### Test AWS Secrets Access
```bash
aws secretsmanager get-secret-value \
  --secret-id all-in-one-credentials \
  --region eu-west-3 \
  --query SecretString \
  --output text | jq .
```

### Check Backend Configuration
```bash
cd backend
python manage.py check
```

### View Current Environment Variables
```bash
cd backend
cat .env | grep -v "PASSWORD\|SECRET\|KEY" # Hide sensitive values
```

### Test Database Connection (Local)
```bash
cd backend
python manage.py dbshell
```

---

## 📁 Important Files

| File | Description |
|------|-------------|
| `configure-aws.sh` | Setup AWS CLI credentials |
| `setup-backend-env-from-aws.sh` | Configure backend for AWS |
| `setup-local-dev.sh` | Configure backend for local dev |
| `backend/.env` | **Current** environment configuration |
| `backend/.env.example` | Template with AWS endpoints |
| `backend/.env.aws.backup` | Backup of AWS configuration |

---

## ⚠️ Remember

1. **Never commit `.env` files** - They contain secrets!
2. **AWS services are in a VPC** - Can't connect directly from Codespace
3. **Use local development** - Recommended for this environment
4. **Backup important configs** - Before making changes

---

## 🎯 What's Next?

You mentioned wanting to **fix some problems**. Now that AWS is configured, what would you like to work on?

Common tasks:
- 🐛 Fix backend bugs
- ✨ Add new features
- 🧪 Write/fix tests
- 🎨 Update frontend
- 📝 Update documentation
- 🔐 Fix authentication issues

**Tell me what you'd like to tackle!** 🚀
