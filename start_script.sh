#!/bin/bash

# Start Flask API in background
echo "Starting Flask API..."
python media_api.py &

# Start AutoGen in background  
echo "Starting AutoGen..."
python autogen/main.py &

# Start React frontend
echo "Starting React frontend..."
cd frontend-ui
npm run dev

# Kill background processes when script ends
trap 'jobs -p | xargs kill' EXIT