#!/bin/bash

echo "🚀 Kunal Singh Voice Bot - Vercel Deployment Helper"
echo "=================================================="

# Check if vercel is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "🔧 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix TypeScript errors."
    exit 1
fi

echo "✅ Build successful!"

echo "🔐 Environment Variables Needed:"
echo "  - OPENAI_API_KEY"
echo "  - NODE_ENV=production"  
echo "  - CORS_ORIGIN=https://your-frontend-domain.com"

echo ""
echo "🌐 Deploying to Vercel..."
echo "Make sure to set environment variables in Vercel dashboard!"

# Deploy to Vercel
vercel

echo ""
echo "🎉 Deployment initiated!"
echo "📋 Next steps:"
echo "  1. Set environment variables in Vercel dashboard"
echo "  2. Test your API endpoints"
echo "  3. Update frontend to use new API URL"
echo ""
echo "📚 For detailed instructions, see:"
echo "  - VERCEL_DEPLOYMENT.md"
echo "  - DEPLOYMENT_CHECKLIST.md"
