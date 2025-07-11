# Lexora AI Tutor - Quick Start Script
Write-Host "🚀 Starting Lexora AI Tutor Application..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Starting development servers..." -ForegroundColor Yellow
Write-Host ""

# Start the application
try {
    Write-Host "📦 Running: npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Server will be available at: http://localhost:5000" -ForegroundColor Gray
    Write-Host "🎨 Client will be available at: http://localhost:5173 (or next available port)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
    Write-Host ""
    
    npm run dev
} catch {
    Write-Host "❌ Failed to start application: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
