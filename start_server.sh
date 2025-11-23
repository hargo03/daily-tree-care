#!/bin/bash
# Simple script to start a local web server for the game
echo "Starting Daily Tree Care game server..."
echo "Open your browser to: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
python3 -m http.server 8000
