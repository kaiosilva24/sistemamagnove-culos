-- 🔧 Corrigir campo "tipo" dos gastos existentes
-- Execute no Supabase SQL Editor

-- ==========================================
-- VER GASTOS COM TIPO INCORRETO
-- ==========================================
SELECT 
    id,
    tipo as tipo_atual,
    CASE 
        WHEN tipo ILIKE '%correia%' OR tipo ILIKE '%amortecedor%' OR tipo ILIKE '%bico%' THEN 'Peça'
        WHEN tipo ILIKE '%manutenção%' OR tipo ILIKE '%manutencao%' OR tipo ILIKE '%conserto%' THEN 'Manutenção'
        WHEN tipo ILIKE '%documentação%' OR tipo ILIKE '%documentacao%' THEN 'Documentação'
        WHEN tipo ILIKE '%pintura%' OR tipo ILIKE '%funilaria%' THEN 'Estética'
        ELSE 'Outros'
    END as tipo_correto,
    valor,
    descricao
FROM gastos
WHERE tipo NOT IN ('Peça', 'Manutenção', 'Documentação', 'Estética', 'Outros');

-- ==========================================
-- CORRIGIR TIPOS
-- ==========================================
-- Atualizar baseado no conteúdo do tipo/descrição

UPDATE gastos
SET tipo = CASE 
    WHEN tipo ILIKE '%correia%' OR tipo ILIKE '%amortecedor%' OR tipo ILIKE '%bico%' 
         OR tipo ILIKE '%peça%' OR tipo ILIKE '%peca%' THEN 'Peça'
    
    WHEN tipo ILIKE '%manutenção%' OR tipo ILIKE '%manutencao%' OR tipo ILIKE '%conserto%' 
         OR tipo ILIKE '%reparo%' THEN 'Manutenção'
    
    WHEN tipo ILIKE '%documentação%' OR tipo ILIKE '%documentacao%' 
         OR tipo ILIKE '%documento%' THEN 'Documentação'
    
    WHEN tipo ILIKE '%pintura%' OR tipo ILIKE '%funilaria%' 
         OR tipo ILIKE '%estética%' OR tipo ILIKE '%estetica%' THEN 'Estética'
    
    ELSE 'Outros'
END
WHERE tipo NOT IN ('Peça', 'Manutenção', 'Documentação', 'Estética', 'Outros');

-- ==========================================
-- VERIFICAR RESULTADO
-- ==========================================
SELECT 
    id,
    tipo,
    valor,
    descricao
FROM gastos
ORDER BY created_at DESC;

-- ==========================================
-- CORRIGIR OS 4 GASTOS ESPECÍFICOS DO ONIX
-- ==========================================
-- Baseado nos IDs que você mostrou (31, 32, 33, 34)

UPDATE gastos SET tipo = 'Peça' WHERE id = 34; -- Correia dentada
UPDATE gastos SET tipo = 'Peça' WHERE id = 33; -- Bico
UPDATE gastos SET tipo = 'Peça' WHERE id = 32; -- Amortecedor
UPDATE gastos SET tipo = 'Peça' WHERE id = 31; -- Sargaços correia

-- Verificar
SELECT id, tipo, valor, descricao 
FROM gastos 
WHERE id IN (31, 32, 33, 34);

-- ==========================================
-- VERIFICAR TOTAL (deve continuar 1090.00)
-- ==========================================
SELECT 
    COUNT(*) as total_gastos,
    SUM(valor) as soma_total
FROM gastos;
