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

# Configure AWS to use IAM role (EC2 instance profile)
echo "Configuring AWS to use IAM role..."

# Create AWS config directory
mkdir -p ~/.aws

# Configure AWS to use the IAM role for the region
cat > ~/.aws/config << EOF
[default]
region = eu-west-3
output = json
EOF

# For the deploy user as well
sudo mkdir -p /home/deploy/.aws
sudo tee /home/deploy/.aws/config << EOF
[default]
region = eu-west-3
output = json
EOF

sudo chown -R deploy:deploy /home/deploy/.aws

echo "Testing AWS configuration..."
aws sts get-caller-identity

if [ $? -eq 0 ]; then
    echo "✅ AWS configuration successful!"
    
    echo "Testing S3 access..."
    aws s3 ls || echo "❌ S3 access failed - check IAM role permissions"
    
    echo "Testing Parameter Store access..."
    aws ssm get-parameters --names "/test" --region eu-west-3 2>/dev/null || echo "❌ Parameter Store access failed - check IAM role permissions"
    
else
    echo "❌ AWS configuration failed!"
    echo "Please check:"
    echo "1. IAM role is attached to the Lightsail instance"
    echo "2. IAM role has necessary permissions (S3, SSM, etc.)"
    echo "3. Instance metadata service is accessible"
fi

echo "=== AWS CONFIGURATION COMPLETE ==="