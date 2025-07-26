#!/bin/bash
# Script to run Django backend with WebSocket support using Daphne

# Activate virtual environment
source venv/bin/activate

# Run with Daphne ASGI server (supports WebSockets)
echo "Starting Django backend with WebSocket support..."
daphne -p 8000 watchparty.asgi:application
