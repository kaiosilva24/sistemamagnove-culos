# Script de teste do sistema de autenticação

Write-Host "🔍 Verificando configuração do sistema de autenticação..." -ForegroundColor Cyan
Write-Host ""

# Verifica arquivos necessários
$arquivos = @(
    "src/lib/supabase.js",
    "src/context/AuthContext.jsx",
    "src/pages/Login.jsx",
    "src/components/ProtectedRoute.jsx",
    "src/lib/api.js",
    "server/authMiddleware.js",
    "supabase_auth_config.sql",
    ".env.local"
)

$todosOk = $true

foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        Write-Host "✅ $arquivo" -ForegroundColor Green
    } else {
        Write-Host "❌ $arquivo (não encontrado)" -ForegroundColor Red
        $todosOk = $false
    }
}

Write-Host ""

# Verifica variáveis de ambiente
Write-Host "🔑 Verificando variáveis de ambiente..." -ForegroundColor Cyan

if (Test-Path .env.local) {
    $envContent = Get-Content .env.local -Raw
    
    if ($envContent -match "VITE_SUPABASE_URL") {
        Write-Host "✅ VITE_SUPABASE_URL configurada" -ForegroundColor Green
    } else {
        Write-Host "❌ VITE_SUPABASE_URL não encontrada" -ForegroundColor Red
        $todosOk = $false
    }
    
    if ($envContent -match "VITE_SUPABASE_KEY") {
        Write-Host "✅ VITE_SUPABASE_KEY configurada" -ForegroundColor Green
    } else {
        Write-Host "❌ VITE_SUPABASE_KEY não encontrada" -ForegroundColor Red
        $todosOk = $false
    }
}

Write-Host ""

# Verifica .env para backend
if (Test-Path .env) {
    $envContent = Get-Content .env -Raw
    
    if ($envContent -match "SUPABASE_URL") {
        Write-Host "✅ SUPABASE_URL (backend) configurada" -ForegroundColor Green
    } else {
        Write-Host "❌ SUPABASE_URL (backend) não encontrada" -ForegroundColor Red
        $todosOk = $false
    }
    
    if ($envContent -match "SUPABASE_KEY") {
        Write-Host "✅ SUPABASE_KEY (backend) configurada" -ForegroundColor Green
    } else {
        Write-Host "❌ SUPABASE_KEY (backend) não encontrada" -ForegroundColor Red
        $todosOk = $false
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($todosOk) {
    Write-Host "✅ TUDO OK! Sistema pronto para uso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
    Write-Host "1. Execute o script SQL no Supabase (supabase_auth_config.sql)" -ForegroundColor White
    Write-Host "   👉 https://supabase.com/dashboard > SQL Editor" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "2. Desative confirmação de email (para desenvolvimento):" -ForegroundColor White
    Write-Host "   👉 Authentication > Settings > Desmarque 'Enable email confirmations'" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "3. Inicie o sistema:" -ForegroundColor White
    Write-Host "   npm run dev" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "4. Acesse: http://localhost:5173" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Documentação: INICIO_RAPIDO_AUTH.md" -ForegroundColor Magenta
} else {
    Write-Host "⚠️  Alguns arquivos estão faltando!" -ForegroundColor Yellow
    Write-Host "Execute o assistente novamente ou verifique a instalação." -ForegroundColor White
}

Write-Host ""
