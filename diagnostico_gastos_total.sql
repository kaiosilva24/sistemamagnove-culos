-- 🔍 Diagnóstico: Total de Gastos Não Bate
-- Execute este script no SQL Editor do Supabase para identificar problemas

-- 1. Verificar todos os gastos e seus valores
SELECT 
    g.id,
    g.vehicle_id,
    g.tipo,
    g.valor,
    g.descricao,
    g.data,
    v.marca,
    v.modelo,
    v.user_id
FROM gastos g
LEFT JOIN veiculos v ON g.vehicle_id = v.id
ORDER BY g.created_at DESC;

-- 2. Verificar gastos órfãos (sem veículo associado)
SELECT 
    COUNT(*) as gastos_orfaos,
    SUM(valor) as valor_total_orfao
FROM gastos g
WHERE NOT EXISTS (
    SELECT 1 FROM veiculos v WHERE v.id = g.vehicle_id
);

-- 3. Total de gastos por veículo
SELECT 
    v.id as veiculo_id,
    v.marca,
    v.modelo,
    v.placa,
    COUNT(g.id) as quantidade_gastos,
    SUM(g.valor) as total_gastos
FROM veiculos v
LEFT JOIN gastos g ON g.vehicle_id = v.id
GROUP BY v.id, v.marca, v.modelo, v.placa
ORDER BY total_gastos DESC;

-- 4. Total geral de gastos
SELECT 
    COUNT(*) as total_gastos,
    SUM(valor) as soma_valores,
    AVG(valor) as media_valor,
    MIN(valor) as menor_valor,
    MAX(valor) as maior_valor
FROM gastos;

-- 5. Verificar tipos de dados do campo valor
SELECT 
    pg_typeof(valor) as tipo_dado_valor,
    COUNT(*) as quantidade
FROM gastos
GROUP BY pg_typeof(valor);

-- 6. Gastos com valores nulos ou zero
SELECT 
    id,
    vehicle_id,
    tipo,
    valor,
    descricao
FROM gastos
WHERE valor IS NULL OR valor = 0
ORDER BY created_at DESC;

-- 7. Total de gastos por usuário (comparar com dashboard)
SELECT 
    v.user_id,
    COUNT(DISTINCT v.id) as total_veiculos,
    COUNT(g.id) as total_gastos,
    SUM(g.valor) as soma_gastos
FROM veiculos v
LEFT JOIN gastos g ON g.vehicle_id = v.id
GROUP BY v.user_id;

-- 8. Verificar se há gastos duplicados
SELECT 
    vehicle_id,
    tipo,
    valor,
    data,
    COUNT(*) as duplicatas
FROM gastos
GROUP BY vehicle_id, tipo, valor, data
HAVING COUNT(*) > 1;

-- 9. Últimos 20 gastos adicionados
SELECT 
    g.id,
    g.vehicle_id,
    v.marca || ' ' || v.modelo as veiculo,
    g.tipo,
    g.valor,
    g.descricao,
    g.data,
    g.created_at
FROM gastos g
LEFT JOIN veiculos v ON g.vehicle_id = v.id
ORDER BY g.created_at DESC
LIMIT 20;

-- 10. Comparação: Total no banco vs Total esperado
-- Execute e compare com o valor mostrado no dashboard
SELECT 
    'Total Geral de Gastos' as descricao,
    COUNT(*) as quantidade,
    SUM(valor)::numeric(10,2) as total_gastos
FROM gastos;
