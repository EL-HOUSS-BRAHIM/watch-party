# 🔐 SSH Private Key Setup Instructions

## You need to set the SSH_PRIVATE_KEY secret manually for security

### Method 1: Using GitHub CLI (Recommended)

1. **Get your SSH private key**:
   ```bash
   # Display your private key (usually ~/.ssh/id_rsa)
   cat ~/.ssh/id_rsa
   
   # OR if you have a specific key for your server:
   cat ~/.ssh/your_server_key
   ```

2. **Set the SSH_PRIVATE_KEY secret**:
   ```bash
   # Copy the ENTIRE private key output and run:
   gh secret set SSH_PRIVATE_KEY --body "$(cat ~/.ssh/id_rsa)"
   
   # OR paste it interactively:
   gh secret set SSH_PRIVATE_KEY
   # Then paste your private key when prompted
   ```

### Method 2: Using GitHub Web Interface

1. Go to your repository: https://github.com/EL-HOUSS-BRAHIM/watch-party-backend
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `SSH_PRIVATE_KEY`
5. Value: Paste your entire SSH private key (including BEGIN/END lines)

### Your SSH Private Key Should Look Like:
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAlwAAAAdzc2gtcn
[... many lines of characters ...]
AAAADnVidW50dUB1YnVudHUAAAABAgMEBQ==
-----END OPENSSH PRIVATE KEY-----
```

### Important Notes:
- Include the entire key including the BEGIN/END lines
- Make sure there are no extra spaces or line breaks
- This should be the private key that matches the public key on your server
- Test SSH access to your server before setting the secret

### Test SSH Access:
```bash
ssh -i ~/.ssh/your_key ubuntu@be-watch-party.brahim-elhouss.me "echo 'SSH connection successful!'"
```

## After Setting SSH_PRIVATE_KEY

Once you've set the SSH private key, your deployment will be fully configured with all secrets!
