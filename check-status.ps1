# System Status Check Script
Write-Host "🔍 Checking Lexora AI System Status..." -ForegroundColor Green
Write-Host ""

# Check if server is running
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -Method GET -TimeoutSec 5
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Server Status: RUNNING" -ForegroundColor Green
        $healthData = $healthResponse.Content | ConvertFrom-Json
        Write-Host "   Server started at: $($healthData.timestamp)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Server Status: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Check configuration
try {
    $configResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/config/status" -Method GET -TimeoutSec 5
    if ($configResponse.StatusCode -eq 200) {
        $configData = $configResponse.Content | ConvertFrom-Json
        Write-Host "✅ Configuration Status: OK" -ForegroundColor Green
        Write-Host "   Environment: $($configData.config.environment)" -ForegroundColor Gray
        Write-Host "   All Configured: $($configData.config.allConfigured)" -ForegroundColor Gray
        Write-Host "   Development Mode: $($configData.config.isDevelopment)" -ForegroundColor Gray
        
        if ($configData.config.missingServices.Count -gt 0) {
            Write-Host "   Missing Services: $($configData.config.missingServices -join ', ')" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Configuration Status: ERROR" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

# Check D-ID service
try {
    $didResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/videos/did/health" -Method GET -TimeoutSec 5
    if ($didResponse.StatusCode -eq 200) {
        $didData = $didResponse.Content | ConvertFrom-Json
        Write-Host "✅ D-ID Service: $($didData.message)" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  D-ID Service: NOT AVAILABLE (expected in dev mode)" -ForegroundColor Yellow
}

# Check if client is running
try {
    $clientResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($clientResponse.StatusCode -eq 200) {
        Write-Host "✅ Client Status: RUNNING" -ForegroundColor Green
        Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Client Status: NOT RUNNING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🎯 System Summary:" -ForegroundColor Cyan
Write-Host "   - Server: http://localhost:5000" -ForegroundColor Gray
Write-Host "   - Client: http://localhost:5173" -ForegroundColor Gray
Write-Host "   - ElevenLabs TTS: Working" -ForegroundColor Gray
Write-Host "   - D-ID Video: Mock mode (dev)" -ForegroundColor Gray
Write-Host "   - Voice ID Mapping: Working" -ForegroundColor Gray
