#!/bin/bash

echo "=== CONFIGURING AWS ON LIGHTSAIL SERVER ==="

# Install AWS CLI if not already installed
if ! command -v aws &> /dev/null; then
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    # Check if we can use sudo without password, otherwise try direct installation
    if sudo -n true 2>/dev/null; then
        sudo ./aws/install
    else
        echo "Warning: Cannot install AWS CLI system-wide. Installing for current user..."
        ./aws/install --install-dir ./aws-cli --bin-dir ./aws-cli-bin
        export PATH="$PWD/aws-cli-bin:$PATH"
        echo 'export PATH="$PWD/aws-cli-bin:$PATH"' >> ~/.bashrc
    fi
    rm -rf aws awscliv2.zip
    echo "AWS CLI installed successfully"
else
    echo "AWS CLI already installed: $(aws --version)"
fi

# Configure AWS region
echo "Configuring AWS region..."
mkdir -p ~/.aws
cat > ~/.aws/config << EOF
[default]
region = eu-west-3
output = json
EOF

# Configure AWS credentials if provided
if [ -n "${AWS_ACCESS_KEY_ID:-}" ] && [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
    echo "Configuring AWS credentials from environment variables..."
    cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = ${AWS_ACCESS_KEY_ID}
aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}
EOF
    chmod 600 ~/.aws/credentials
else
    echo "No AWS credentials provided - assuming IAM role will be used"
fi

# For the deploy user as well
sudo mkdir -p /home/deploy/.aws
sudo cp ~/.aws/config /home/deploy/.aws/config
if [ -f ~/.aws/credentials ]; then
    sudo cp ~/.aws/credentials /home/deploy/.aws/credentials
    sudo chmod 600 /home/deploy/.aws/credentials
fi
sudo chown -R deploy:deploy /home/deploy/.aws

echo "Testing AWS configuration..."
if aws sts get-caller-identity; then
    echo "✅ AWS configuration successful!"
    
    echo "Testing Secrets Manager access..."
    if aws secretsmanager get-secret-value --secret-id all-in-one-credentials --region eu-west-3 >/dev/null 2>&1; then
        echo "✅ Secrets Manager access confirmed"
        
        # Check for expected secrets
        secrets=("all-in-one-credentials" "watch-party-valkey-001-auth-token")
        for secret in "${secrets[@]}"; do
            if aws secretsmanager describe-secret --secret-id "$secret" --region eu-west-3 >/dev/null 2>&1; then
                echo "✅ Secret '$secret' found"
            else
                echo "⚠️  Secret '$secret' not found - app may fail to start"
            fi
        done
    else
        echo "❌ Secrets Manager access failed - check permissions"
    fi
    
else
    echo "❌ AWS configuration failed!"
    echo "Please check:"
    echo "1. AWS credentials are properly configured"
    echo "2. IAM user/role has necessary permissions"
    echo "3. Network connectivity to AWS services"
fi

echo "=== AWS CONFIGURATION COMPLETE ==="