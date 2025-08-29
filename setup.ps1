# SynqChain MVP Setup Script for Windows PowerShell
Write-Host "🚀 Setting up SynqChain MVP..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 20+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if Docker is installed and running
try {
    docker --version | Out-Null
    Write-Host "✅ Docker found" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop from https://www.docker.com/products/docker-desktop" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

cd apps/api
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install API dependencies" -ForegroundColor Red
    exit 1
}

cd ../web
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install Web dependencies" -ForegroundColor Red
    exit 1
}

cd ../..

# Create environment file
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating environment file..." -ForegroundColor Yellow
    Copy-Item ".ENV-EXAMPLE" ".env"
    Write-Host "✅ Environment file created. Review .env for settings." -ForegroundColor Green
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}

# Start Docker database
Write-Host "🐳 Starting PostgreSQL database..." -ForegroundColor Yellow
cd docker
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database" -ForegroundColor Red
    exit 1
}

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

cd ..

# Initialize database
Write-Host "🗄️ Initializing database..." -ForegroundColor Yellow
cd apps/api

# Generate Prisma client
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}

# Run migrations
npx prisma migrate dev --name init
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to run database migrations" -ForegroundColor Red
    exit 1
}

# Seed database
npx prisma db seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}

cd ../..

Write-Host ""
Write-Host "🎉 Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Run 'npm run dev' to start the development servers" -ForegroundColor White
Write-Host "2. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "3. Login with: demo@demo.com / demo" -ForegroundColor White
Write-Host ""
Write-Host "Servers will be available at:" -ForegroundColor Cyan
Write-Host "• Web App: http://localhost:5173" -ForegroundColor White
Write-Host "• API: http://localhost:4000" -ForegroundColor White
Write-Host "• Health Check: http://localhost:4000/healthz" -ForegroundColor White
