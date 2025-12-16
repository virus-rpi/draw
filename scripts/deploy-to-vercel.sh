#!/bin/bash

# Deploy Draw to Vercel with integrated sync server
# This script deploys the sync server to Railway and the frontend to Vercel

echo "🚀 Deploying Draw with integrated sync server..."
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "1️⃣  Deploying sync server to Railway..."
railway login
railway init
railway up

echo ""
echo "2️⃣  Getting sync server URL..."
SYNC_URL=$(railway domain)

if [ -z "$SYNC_URL" ]; then
    echo "❌ Failed to get Railway URL. Please deploy manually."
    exit 1
fi

echo "✅ Sync server deployed to: $SYNC_URL"
echo ""

echo "3️⃣  Deploying frontend to Vercel..."
vercel --prod -e NEXT_PUBLIC_SYNC_SERVER_URL="https://$SYNC_URL"

echo ""
echo "✅ Deployment complete!"
echo "🌐 Your app is now live with integrated sync server"
