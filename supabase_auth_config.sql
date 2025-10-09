-- ============================================
-- CONFIGURAÇÃO DE AUTENTICAÇÃO E SEGURANÇA
-- Sistema de Gestão de Veículos
-- ============================================

-- Habilitar Row Level Security (RLS) nas tabelas
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ADICIONAR COLUNA user_id NAS TABELAS
-- ============================================

-- Adicionar coluna user_id na tabela veiculos
ALTER TABLE veiculos 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar coluna user_id na tabela user_preferences
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar coluna user_id na tabela agent_logs
ALTER TABLE agent_logs 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- POLÍTICAS RLS PARA VEÍCULOS
-- ============================================

-- Política: Usuário pode ver apenas seus próprios veículos
CREATE POLICY "Users can view their own vehicles"
ON veiculos FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuário pode inserir veículos apenas para si mesmo
CREATE POLICY "Users can insert their own vehicles"
ON veiculos FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuário pode atualizar apenas seus próprios veículos
CREATE POLICY "Users can update their own vehicles"
ON veiculos FOR UPDATE
USING (auth.uid() = user_id);

-- Política: Usuário pode deletar apenas seus próprios veículos
CREATE POLICY "Users can delete their own vehicles"
ON veiculos FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS RLS PARA GASTOS
-- ============================================

-- Política: Usuário pode ver gastos dos seus veículos
CREATE POLICY "Users can view gastos of their vehicles"
ON gastos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.veiculo_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- Política: Usuário pode inserir gastos nos seus veículos
CREATE POLICY "Users can insert gastos on their vehicles"
ON gastos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.veiculo_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- Política: Usuário pode atualizar gastos dos seus veículos
CREATE POLICY "Users can update gastos of their vehicles"
ON gastos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.veiculo_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- Política: Usuário pode deletar gastos dos seus veículos
CREATE POLICY "Users can delete gastos of their vehicles"
ON gastos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.veiculo_id 
    AND veiculos.user_id = auth.uid()
  )
);

-- ============================================
-- POLÍTICAS RLS PARA PREFERÊNCIAS
-- ============================================

-- Política: Usuário pode ver apenas suas preferências
CREATE POLICY "Users can view their own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuário pode inserir suas preferências
CREATE POLICY "Users can insert their own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política: Usuário pode atualizar suas preferências
CREATE POLICY "Users can update their own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- Política: Usuário pode deletar suas preferências
CREATE POLICY "Users can delete their own preferences"
ON user_preferences FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS RLS PARA LOGS DO AGENTE
-- ============================================

-- Política: Usuário pode ver apenas seus logs
CREATE POLICY "Users can view their own agent logs"
ON agent_logs FOR SELECT
USING (auth.uid() = user_id);

-- Política: Usuário pode inserir seus logs
CREATE POLICY "Users can insert their own agent logs"
ON agent_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- FUNÇÕES AUXILIARES
-- ============================================

-- Função para obter user_id do token JWT
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS UUID AS $$
  SELECT auth.uid();
$$ LANGUAGE SQL STABLE;

-- ============================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_veiculos_user_id ON veiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_user_id ON agent_logs(user_id);

-- ============================================
-- COMENTÁRIOS
-- ============================================

COMMENT ON POLICY "Users can view their own vehicles" ON veiculos IS 
  'Permite que usuários visualizem apenas seus próprios veículos';

COMMENT ON POLICY "Users can view gastos of their vehicles" ON gastos IS 
  'Permite que usuários visualizem gastos apenas dos seus veículos';

-- ============================================
-- CONFIGURAÇÕES DE EMAIL (OPCIONAL)
-- ============================================

-- Para desenvolvimento, você pode desabilitar confirmação de email
-- no painel do Supabase: Authentication > Settings > Email Auth
-- Marque "Enable email confirmations" como OFF

-- ============================================
-- TESTE DE CONFIGURAÇÃO
-- ============================================

-- Execute isso após criar um usuário para verificar:
-- SELECT * FROM veiculos WHERE user_id = auth.uid();

-- ============================================
-- NOTA IMPORTANTE
-- ============================================

-- Execute este script no SQL Editor do Supabase:
-- 1. Acesse: https://supabase.com/dashboard
-- 2. Selecione seu projeto
-- 3. Vá em "SQL Editor"
-- 4. Cole e execute este script
-- 5. Verifique se não há erros

-- ============================================
-- ROLLBACK (caso precise reverter)
-- ============================================

-- Para desabilitar RLS (NÃO RECOMENDADO EM PRODUÇÃO):
-- ALTER TABLE veiculos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_logs DISABLE ROW LEVEL SECURITY;
