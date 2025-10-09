-- ============================================
-- FIX AUTOMÁTICO: RLS para tabela GASTOS
-- ============================================
-- Este script detecta automaticamente o nome da coluna
-- e cria as políticas corretas

-- PASSO 1: Verificar qual coluna existe
DO $$
DECLARE
    coluna_veiculo TEXT;
BEGIN
    -- Detectar se é 'vehicle_id' ou 'veiculo_id'
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gastos' AND column_name = 'vehicle_id'
    ) THEN
        coluna_veiculo := 'vehicle_id';
        RAISE NOTICE '✅ Detectado: coluna "vehicle_id"';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gastos' AND column_name = 'veiculo_id'
    ) THEN
        coluna_veiculo := 'veiculo_id';
        RAISE NOTICE '✅ Detectado: coluna "veiculo_id"';
    ELSE
        RAISE EXCEPTION '❌ ERRO: Nenhuma coluna de veículo encontrada na tabela gastos!';
    END IF;
END $$;

-- PASSO 2: Remover políticas antigas
DROP POLICY IF EXISTS "Users can view gastos of their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can insert gastos on their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can update gastos of their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can delete gastos of their vehicles" ON gastos;

-- PASSO 3: Criar políticas com VEHICLE_ID (tente primeiro)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gastos' AND column_name = 'vehicle_id'
    ) THEN
        -- Usar vehicle_id
        EXECUTE '
        CREATE POLICY "Users can view gastos of their vehicles"
        ON gastos FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.vehicle_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        EXECUTE '
        CREATE POLICY "Users can insert gastos on their vehicles"
        ON gastos FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.vehicle_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        EXECUTE '
        CREATE POLICY "Users can update gastos of their vehicles"
        ON gastos FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.vehicle_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        EXECUTE '
        CREATE POLICY "Users can delete gastos of their vehicles"
        ON gastos FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.vehicle_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        RAISE NOTICE '✅ Políticas RLS criadas com sucesso usando VEHICLE_ID';
    ELSE
        -- Usar veiculo_id
        EXECUTE '
        CREATE POLICY "Users can view gastos of their vehicles"
        ON gastos FOR SELECT
        USING (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.veiculo_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        EXECUTE '
        CREATE POLICY "Users can insert gastos on their vehicles"
        ON gastos FOR INSERT
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.veiculo_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        EXECUTE '
        CREATE POLICY "Users can update gastos of their vehicles"
        ON gastos FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.veiculo_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        EXECUTE '
        CREATE POLICY "Users can delete gastos of their vehicles"
        ON gastos FOR DELETE
        USING (
          EXISTS (
            SELECT 1 FROM veiculos 
            WHERE veiculos.id = gastos.veiculo_id 
            AND veiculos.user_id = auth.uid()
          )
        )';

        RAISE NOTICE '✅ Políticas RLS criadas com sucesso usando VEICULO_ID';
    END IF;
END $$;

-- PASSO 4: Verificar se RLS está habilitado
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Confirmar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as comando
FROM pg_policies 
WHERE tablename = 'gastos'
ORDER BY policyname;
