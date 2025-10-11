-- 🔍 INVESTIGAÇÃO: Gastos Faltantes
-- Execute este script no Supabase SQL Editor

-- ==========================================
-- 1. TODOS OS GASTOS (incluindo órfãos)
-- ==========================================
SELECT 
    g.id,
    g.vehicle_id,
    g.tipo,
    g.valor,
    g.descricao,
    g.data,
    g.created_at,
    CASE 
        WHEN v.id IS NULL THEN '❌ ÓRFÃO (sem veículo)'
        ELSE '✅ ' || v.marca || ' ' || v.modelo
    END as status_veiculo
FROM gastos g
LEFT JOIN veiculos v ON g.vehicle_id = v.id
ORDER BY g.created_at DESC;

-- ==========================================
-- 2. TOTAL DE GASTOS (incluindo órfãos)
-- ==========================================
SELECT 
    COUNT(*) as total_gastos_sistema,
    SUM(valor) as soma_total_sistema,
    COUNT(CASE WHEN vehicle_id IS NULL THEN 1 END) as gastos_sem_vehicle_id,
    COUNT(CASE WHEN vehicle_id IS NOT NULL THEN 1 END) as gastos_com_vehicle_id
FROM gastos;

-- ==========================================
-- 3. GASTOS ÓRFÃOS (vehicle_id inválido)
-- ==========================================
SELECT 
    g.id,
    g.vehicle_id as vehicle_id_invalido,
    g.tipo,
    g.valor,
    g.descricao,
    g.data,
    '❌ Vehicle ID não existe na tabela veiculos' as problema
FROM gastos g
WHERE g.vehicle_id IS NOT NULL 
  AND NOT EXISTS (
    SELECT 1 FROM veiculos v WHERE v.id = g.vehicle_id
);

-- ==========================================
-- 4. GASTOS COM vehicle_id = NULL
-- ==========================================
SELECT 
    id,
    tipo,
    valor,
    descricao,
    data,
    '❌ Vehicle ID é NULL' as problema
FROM gastos
WHERE vehicle_id IS NULL;

-- ==========================================
-- 5. COMPARAÇÃO: Veículos vs Gastos
-- ==========================================
SELECT 
    v.id as veiculo_id,
    v.marca || ' ' || v.modelo as veiculo,
    v.placa,
    COUNT(g.id) as qtd_gastos,
    COALESCE(SUM(g.valor), 0) as total_gastos
FROM veiculos v
LEFT JOIN gastos g ON g.vehicle_id = v.id
GROUP BY v.id, v.marca, v.modelo, v.placa
ORDER BY total_gastos DESC;

-- ==========================================
-- 6. TOTAL QUE DEVERIA APARECER NO DASHBOARD
-- ==========================================
SELECT 
    'Total no Dashboard' as tipo,
    COUNT(g.id) as quantidade_gastos,
    COALESCE(SUM(g.valor), 0) as total_deve_ser
FROM veiculos v
LEFT JOIN gastos g ON g.vehicle_id = v.id
WHERE v.user_id = (SELECT id FROM auth.users LIMIT 1); -- seu user_id

-- ==========================================
-- 7. VERIFICAR USER_ID DOS VEÍCULOS
-- ==========================================
SELECT 
    v.user_id,
    COUNT(DISTINCT v.id) as qtd_veiculos,
    COUNT(g.id) as qtd_gastos,
    COALESCE(SUM(g.valor), 0) as total_gastos
FROM veiculos v
LEFT JOIN gastos g ON g.vehicle_id = v.id
GROUP BY v.user_id;

-- ==========================================
-- 8. VERIFICAR RLS (Row Level Security)
-- ==========================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('gastos', 'veiculos')
ORDER BY tablename, policyname;

-- ==========================================
-- 9. IDs DE VEÍCULOS EXISTENTES
-- ==========================================
SELECT 
    'IDs Válidos de Veículos:' as info,
    array_agg(id ORDER BY id) as vehicle_ids_validos
FROM veiculos;

-- ==========================================
-- 10. GASTOS COM IDs QUE NÃO EXISTEM
-- ==========================================
SELECT 
    g.vehicle_id as id_que_nao_existe,
    COUNT(*) as qtd_gastos_perdidos,
    SUM(g.valor) as valor_total_perdido,
    array_agg(g.id) as gastos_ids
FROM gastos g
WHERE g.vehicle_id NOT IN (SELECT id FROM veiculos)
GROUP BY g.vehicle_id;
