#!/bin/bash

# =============================================================================
# Virtual Environment Check and Activation Script
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're already in a virtual environment
if [[ "$VIRTUAL_ENV" != "" ]]; then
    print_success "Already in virtual environment: $VIRTUAL_ENV"
    exit 0
fi

# Check if venv directory exists
if [ ! -d "venv" ]; then
    print_error "Virtual environment not found. Creating one..."
    python3 -m venv venv
    print_success "Virtual environment created"
fi

# Check if venv/bin/activate exists
if [ -f "venv/bin/activate" ]; then
    print_warning "Activating virtual environment..."
    source venv/bin/activate
    print_success "Virtual environment activated"
    
    # Show instructions for keeping it active
    echo "To keep this environment active in your current shell:"
    echo "source venv/bin/activate"
else
    print_error "Virtual environment activation script not found"
    exit 1
fi
