set -e

# Watch Party Monorepo Development Setup Script
echo "Setting up Watch Party Monorepo for development..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../frontend
if command -v pnpm &> /dev/null; then
    pnpm install
else
    npm install
fi

# Setup backend environment
echo "Setting up backend environment..."
cd ../backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

echo "Activating virtual environment and installing dependencies..."
source venv/bin/activate
pip install -r requirements.txt

echo "Run 'npm run dev' from the root directory to start both services"
