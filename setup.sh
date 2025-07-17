#!/bin/bash

# Kunal Singh Voice Bot Backend - Quick Deploy Script

echo "🤖 Setting up Kunal Singh Voice Bot Backend..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the voice-bot-backend directory."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Error: Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from template..."
    cp .env.example .env
    echo "📝 Please edit .env and add your OPENAI_API_KEY before starting the server"
    echo "   Example: OPENAI_API_KEY=sk-your-api-key-here"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: Build failed"
    exit 1
fi

echo "✅ Build completed successfully"

# Check if OpenAI API key is set
if grep -q "test_key_for_development" .env || grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  Warning: Please update your OPENAI_API_KEY in .env before running the server"
    echo "   Current .env file contains placeholder values"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🚀 To start the development server:"
echo "   npm run dev"
echo ""
echo "🌐 To start the production server:"
echo "   npm start"
echo ""
echo "📖 API will be available at: http://localhost:3000"
echo "🧪 Test with: curl http://localhost:3000/health"
echo ""
echo "📚 Documentation:"
echo "   - README.md - Main documentation"
echo "   - API_TESTING.md - API testing examples"
echo "   - DEPLOYMENT.md - Deployment guide"
echo "   - demo.html - Frontend demo"
echo ""
echo "🔑 Don't forget to set your OPENAI_API_KEY in .env!"
