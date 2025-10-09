$body = @{
    command = "quantos veiculos"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri 'http://localhost:3000/api/ai/process' -Method POST -ContentType 'application/json' -Body $body

Write-Host "Status:" $response.StatusCode
Write-Host "Resposta:" $response.Content
