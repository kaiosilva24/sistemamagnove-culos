-- 🔧 CORREÇÃO: Gastos Órfãos e Faltantes
-- Execute este script APÓS o diagnóstico (investigar_gastos_faltantes.sql)

-- ⚠️ ATENÇÃO: Faça backup antes de executar!
-- Comando de backup: pg_dump ou exportar via Supabase Dashboard

-- ==========================================
-- PASSO 1: VER GASTOS ÓRFÃOS ANTES DE DELETAR
-- ==========================================
-- Execute PRIMEIRO para ver o que será deletado:

SELECT 
    g.id,
    g.vehicle_id,
    g.tipo,
    g.valor,
    g.descricao,
    g.data,
    'SERÁ DELETADO' as acao
FROM gastos g
WHERE g.vehicle_id NOT IN (SELECT id FROM veiculos);

-- ==========================================
-- PASSO 2: BACKUP DOS GASTOS ÓRFÃOS
-- ==========================================
-- Criar tabela temporária com os gastos órfãos (backup)

CREATE TABLE IF NOT EXISTS gastos_orfaos_backup AS
SELECT 
    g.*,
    NOW() as backup_em
FROM gastos g
WHERE g.vehicle_id NOT IN (SELECT id FROM veiculos);

-- Verificar backup
SELECT COUNT(*) as gastos_no_backup FROM gastos_orfaos_backup;

-- ==========================================
-- PASSO 3: DELETAR GASTOS ÓRFÃOS
-- ==========================================
-- ⚠️ Execute apenas se tiver certeza!
-- Isso vai deletar gastos com vehicle_id que não existe

DELETE FROM gastos 
WHERE vehicle_id NOT IN (SELECT id FROM veiculos);

-- Ver quantos foram deletados:
SELECT COUNT(*) as gastos_deletados 
FROM gastos_orfaos_backup;

-- ==========================================
-- PASSO 4: CORRIGIR GASTOS COM vehicle_id NULL
-- ==========================================
-- Se houver gastos sem vehicle_id, você pode:

-- Opção A: Deletar
-- DELETE FROM gastos WHERE vehicle_id IS NULL;

-- Opção B: Associar ao primeiro veículo (NÃO RECOMENDADO)
-- UPDATE gastos 
-- SET vehicle_id = (SELECT id FROM veiculos ORDER BY created_at LIMIT 1)
-- WHERE vehicle_id IS NULL;

-- ==========================================
-- PASSO 5: VERIFICAR RESULTADO
-- ==========================================
-- Agora todos os gastos devem ter um vehicle_id válido:

SELECT 
    v.marca || ' ' || v.modelo as veiculo,
    COUNT(g.id) as qtd_gastos,
    COALESCE(SUM(g.valor), 0) as total
FROM veiculos v
LEFT JOIN gastos g ON g.vehicle_id = v.id
GROUP BY v.id, v.marca, v.modelo
ORDER BY total DESC;

-- Total geral (deve bater com o dashboard):
SELECT 
    COUNT(*) as total_gastos,
    SUM(valor) as total_em_reais
FROM gastos;

-- ==========================================
-- PASSO 6: VERIFICAR SE HÁ ÓRFÃOS
-- ==========================================
-- Deve retornar 0:

SELECT COUNT(*) as gastos_orfaos_restantes
FROM gastos g
WHERE NOT EXISTS (
    SELECT 1 FROM veiculos v WHERE v.id = g.vehicle_id
);

-- ==========================================
-- PASSO 7: RESTAURAR DO BACKUP (se precisar)
-- ==========================================
-- Se deletou por engano, pode restaurar:

-- INSERT INTO gastos (id, vehicle_id, tipo, valor, descricao, data, created_at)
-- SELECT id, vehicle_id, tipo, valor, descricao, data, created_at
-- FROM gastos_orfaos_backup;

-- ==========================================
-- PASSO 8: LIMPAR BACKUP (após confirmar)
-- ==========================================
-- Depois de confirmar que está tudo OK:

-- DROP TABLE gastos_orfaos_backup;

-- ==========================================
-- VERIFICAÇÃO FINAL
-- ==========================================
SELECT 
    'Estatísticas Finais' as status,
    (SELECT COUNT(*) FROM gastos) as total_gastos,
    (SELECT SUM(valor) FROM gastos) as soma_total,
    (SELECT COUNT(*) FROM gastos WHERE vehicle_id IS NULL) as gastos_sem_veiculo,
    (SELECT COUNT(*) FROM gastos g WHERE NOT EXISTS (
        SELECT 1 FROM veiculos v WHERE v.id = g.vehicle_id
    )) as gastos_orfaos;
