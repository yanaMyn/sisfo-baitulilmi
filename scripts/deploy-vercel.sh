#!/bin/bash

# Quick Vercel Deployment Script for SISFO-BAITULILMI
# This script helps you deploy to Vercel quickly

echo "🚀 SISFO-BAITULILMI - Vercel Deployment Helper"
echo "=============================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI not found. Installing..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is installed"
fi

echo ""
echo "🔍 Checking environment variables..."

if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "   Please create .env.local with your Firebase credentials"
    exit 1
else
    echo "✅ .env.local found"
fi

echo ""
echo "📋 Pre-deployment checklist:"
echo ""
echo "Before deploying, make sure you've:"
echo "  [ ] Migrated data from old Firebase project (if needed)"
echo "  [ ] Created admin user in Firebase Authentication"
echo "  [ ] Deployed Firestore security rules"
echo "  [ ] Tested the app locally (http://localhost:54112)"
echo ""

read -p "Have you completed the checklist above? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled. Please complete the checklist first."
    exit 1
fi

echo ""
echo "🏗️  Building your application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix the errors and try again."
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
echo "IMPORTANT NOTES:"
echo "1. You'll need to manually add environment variables in Vercel dashboard"
echo "2. Go to: Project Settings → Environment Variables"
echo "3. Add all variables from your .env.local file"
echo "4. After deployment, add your Vercel domain to Firebase authorized domains"
echo ""

read -p "Ready to deploy? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Starting deployment..."
    vercel --prod

    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "📝 NEXT STEPS:"
    echo "1. Copy your deployment URL (shown above)"
    echo "2. Go to Firebase Console → Authentication → Settings"
    echo "3. Add your Vercel domain to 'Authorized domains'"
    echo "4. Test your deployed app!"
else
    echo "❌ Deployment cancelled"
fi
