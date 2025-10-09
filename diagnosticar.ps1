# Script de diagnóstico rápido para problemas de login

Write-Host ""
Write-Host "🔍 DIAGNÓSTICO - Problema de Login (Erro 422)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""

# Verificar arquivos de configuração
Write-Host "1️⃣ Verificando arquivos de configuração..." -ForegroundColor Yellow
Write-Host ""

$arquivos = @(".env", ".env.local")
$todosOk = $true

foreach ($arquivo in $arquivos) {
    if (Test-Path $arquivo) {
        Write-Host "  ✅ $arquivo existe" -ForegroundColor Green
        
        $conteudo = Get-Content $arquivo -Raw
        
        if ($arquivo -eq ".env") {
            if ($conteudo -match "SUPABASE_URL") {
                Write-Host "     ✅ SUPABASE_URL encontrada" -ForegroundColor Green
            } else {
                Write-Host "     ❌ SUPABASE_URL não encontrada" -ForegroundColor Red
                $todosOk = $false
            }
            
            if ($conteudo -match "SUPABASE_KEY") {
                Write-Host "     ✅ SUPABASE_KEY encontrada" -ForegroundColor Green
            } else {
                Write-Host "     ❌ SUPABASE_KEY não encontrada" -ForegroundColor Red
                $todosOk = $false
            }
        }
        
        if ($arquivo -eq ".env.local") {
            if ($conteudo -match "VITE_SUPABASE_URL") {
                Write-Host "     ✅ VITE_SUPABASE_URL encontrada" -ForegroundColor Green
            } else {
                Write-Host "     ❌ VITE_SUPABASE_URL não encontrada" -ForegroundColor Red
                $todosOk = $false
            }
            
            if ($conteudo -match "VITE_SUPABASE_KEY") {
                Write-Host "     ✅ VITE_SUPABASE_KEY encontrada" -ForegroundColor Green
            } else {
                Write-Host "     ❌ VITE_SUPABASE_KEY não encontrada" -ForegroundColor Red
                $todosOk = $false
            }
        }
    } else {
        Write-Host "  ❌ $arquivo NÃO EXISTE" -ForegroundColor Red
        $todosOk = $false
    }
}

Write-Host ""
Write-Host "2️⃣ Testando conexão com Supabase..." -ForegroundColor Yellow
Write-Host ""

# Executar teste de conexão
if (Test-Path "test-supabase.js") {
    Write-Host "  ⏳ Executando teste..." -ForegroundColor Gray
    node test-supabase.js
} else {
    Write-Host "  ⚠️  Arquivo test-supabase.js não encontrado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "3️⃣ CAUSA MAIS COMUM DO ERRO 422" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "  ⚠️  Você ainda não criou nenhum usuário no Supabase!" -ForegroundColor Red
Write-Host ""
Write-Host "  📋 SOLUÇÃO:" -ForegroundColor Cyan
Write-Host "     1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
Write-Host "     2. Vá em: Authentication → Users" -ForegroundColor White
Write-Host "     3. Clique em: 'Add user' → 'Create new user'" -ForegroundColor White
Write-Host "     4. Preencha:" -ForegroundColor White
Write-Host "        Email: admin@teste.com" -ForegroundColor Gray
Write-Host "        Password: Admin@123456" -ForegroundColor Gray
Write-Host "        ✅ Marcar 'Auto Confirm User'" -ForegroundColor Green
Write-Host "     5. Clique em: 'Create user'" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣ OUTRAS VERIFICAÇÕES" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "  🔧 Verificar no painel do Supabase:" -ForegroundColor Cyan
Write-Host "     [ ] Authentication → Settings" -ForegroundColor White
Write-Host "         → 'Enable Email Provider' está ATIVO?" -ForegroundColor Gray
Write-Host ""
Write-Host "     [ ] Authentication → Users" -ForegroundColor White
Write-Host "         → Existe pelo menos 1 usuário?" -ForegroundColor Gray
Write-Host "         → Status está 'Confirmed'?" -ForegroundColor Gray
Write-Host ""
Write-Host "     [ ] Settings → API" -ForegroundColor White
Write-Host "         → Project URL e anon key estão corretos?" -ForegroundColor Gray
Write-Host ""

Write-Host "5️⃣ DOCUMENTAÇÃO" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""
Write-Host "  📖 DIAGNOSTICO_LOGIN.md" -ForegroundColor Cyan
Write-Host "     → Guia completo de diagnóstico" -ForegroundColor Gray
Write-Host ""
Write-Host "  👥 CRIAR_USUARIOS_SUPABASE.md" -ForegroundColor Cyan
Write-Host "     → Como criar usuários passo a passo" -ForegroundColor Gray
Write-Host ""
Write-Host "  🚀 INICIO_RAPIDO_AUTH.md" -ForegroundColor Cyan
Write-Host "     → Configuração inicial em 3 passos" -ForegroundColor Gray
Write-Host ""

Write-Host "═══════════════════════════════════════════════" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 PRÓXIMOS PASSOS:" -ForegroundColor Yellow
Write-Host "   1. Crie um usuário no painel do Supabase" -ForegroundColor White
Write-Host "   2. Reinicie o servidor (Ctrl+C e npm run dev)" -ForegroundColor White
Write-Host "   3. Tente fazer login novamente" -ForegroundColor White
Write-Host ""
