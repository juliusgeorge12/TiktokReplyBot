#!/bin/bash

set -e

echo "🔄 Cleaning previous dist folder..."
rm -rf dist
mkdir -p dist

echo "📁 Copying backend folder..."
cp -R backend dist/backend

echo "📁 Copying css folder..."
cp -R css dist/css

echo "📁 Copying root PHP files..."
find . -maxdepth 1 -name "*.php" -exec cp {} dist/ \;

echo "🛠️ Building the executable with pkg..."
npx pkg bot/app.js --targets node18-macos-arm64 --output dist/tiktokReplyBot --public
npx pkg gui.js --targets node18-macos-arm64 --output dist/Gui

echo "📦 Packaging dist folder into archive..."

# Create build folder if not exists
mkdir -p build

# Create archive
zip -r build/TiktokReplyBot.zip dist

echo "✅ Build and packaging completed!"
echo "📂 Archive created at: build/TiktokReplyBot.zip"
