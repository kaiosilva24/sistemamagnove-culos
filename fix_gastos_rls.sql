-- ============================================
-- FIX: Políticas RLS para tabela GASTOS
-- ============================================
-- Problema: A política RLS pode estar usando o nome errado da coluna
-- Solução: Recriar políticas com o nome correto

-- Primeiro, remover políticas antigas se existirem
DROP POLICY IF EXISTS "Users can view gastos of their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can insert gastos on their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can update gastos of their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can delete gastos of their vehicles" ON gastos;

-- Verificar qual coluna existe na tabela gastos
-- Se a coluna for 'vehicle_id', use esta versão:

-- Política: Usuário pode ver gastos dos seus veículos
CREATE POLICY "Users can view gastos of their vehicles"
ON gastos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- Política: Usuário pode inserir gastos nos seus veículos
CREATE POLICY "Users can insert gastos on their vehicles"
ON gastos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- Política: Usuário pode atualizar gastos dos seus veículos
CREATE POLICY "Users can update gastos of their vehicles"
ON gastos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- Política: Usuário pode deletar gastos dos seus veículos
CREATE POLICY "Users can delete gastos of their vehicles"
ON gastos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- ============================================
-- NOTA: Se a coluna for 'veiculo_id' em vez de 'vehicle_id',
-- substitua 'gastos.vehicle_id' por 'gastos.veiculo_id' acima
-- ============================================
