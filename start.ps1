# Script de inicializacao do MAGNO
Write-Host "Iniciando MAGNO v2.0..." -ForegroundColor Cyan

# 1. Matar processos Node
Write-Host "Encerrando processos Node..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# 2. Iniciar Backend
Write-Host "Iniciando Backend (porta 3000)..." -ForegroundColor Green
$backend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'BACKEND RODANDO' -ForegroundColor Blue; node server/index.js" -PassThru

# 3. Aguardar backend
Write-Host "Aguardando backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 4. Iniciar Frontend
Write-Host "Iniciando Frontend (porta 5173)..." -ForegroundColor Green
$frontend = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; Write-Host 'FRONTEND RODANDO' -ForegroundColor Green; npm run client" -PassThru

# 5. Aguardar frontend
Start-Sleep -Seconds 3

Write-Host "`nMAGNO iniciado com sucesso!" -ForegroundColor Green
Write-Host "Acesse: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Teste: Cadastrar Volkswagen Gol 2025 ok" -ForegroundColor Yellow
