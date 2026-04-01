#!/bin/bash

echo "🚀 Starting deployment..."

cd ~/PingNova || exit

echo "📥 Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building project..."
npm run build
npx tsc

echo "🔁 Restarting server..."
pm2 restart pingnova

echo "✅ Deployment complete!"
