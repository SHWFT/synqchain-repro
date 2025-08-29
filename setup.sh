#!/bin/bash

# SynqChain MVP Setup Script
echo "🚀 Setting up SynqChain MVP..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 20+ from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

echo "✅ Docker found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

cd apps/api
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install API dependencies"
    exit 1
fi

cd ../web
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Web dependencies"
    exit 1
fi

cd ../..

# Create environment file
if [ ! -f ".env" ]; then
    echo "📝 Creating environment file..."
    cp .ENV-EXAMPLE .env
    echo "✅ Environment file created. Review .env for settings."
else
    echo "✅ Environment file already exists"
fi

# Start Docker database
echo "🐳 Starting PostgreSQL database..."
cd docker
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "❌ Failed to start database"
    exit 1
fi

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

cd ..

# Initialize database
echo "🗄️ Initializing database..."
cd apps/api

# Generate Prisma client
npx prisma generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

# Run migrations
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "❌ Failed to run database migrations"
    exit 1
fi

# Seed database
npx prisma db seed
if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

cd ../..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development servers"
echo "2. Open http://localhost:5173 in your browser"
echo "3. Login with: demo@demo.com / demo"
echo ""
echo "Servers will be available at:"
echo "• Web App: http://localhost:5173"
echo "• API: http://localhost:4000"
echo "• Health Check: http://localhost:4000/healthz"
