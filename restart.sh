#!/bin/bash
echo "Stopping server..."
pkill -f "node src/index.js" || true
echo "Clearing browser cache..."
echo "Please manually clear your browser cache or open in incognito/private mode."
echo "Starting server again..."
cd /Users/sunguk/Documents/LightStock
node src/index.js
