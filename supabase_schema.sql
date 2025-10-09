-- ============================================
-- MAGNO - Schema Supabase
-- Execute este script no SQL Editor do Supabase
-- ============================================

-- Tabela de Veículos
CREATE TABLE IF NOT EXISTS veiculos (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INTEGER,
    cor VARCHAR(50),
    placa VARCHAR(20),
    km INTEGER DEFAULT 0,
    preco_compra DECIMAL(10,2) NOT NULL,
    preco_venda DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'estoque',
    data_compra DATE DEFAULT CURRENT_DATE,
    data_venda DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Logs do Agente
CREATE TABLE IF NOT EXISTS agent_logs (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    command TEXT NOT NULL,
    action VARCHAR(50) NOT NULL,
    ai_used VARCHAR(20) NOT NULL,
    success BOOLEAN DEFAULT TRUE,
    data JSONB,
    response TEXT,
    confidence DECIMAL(3,2),
    timestamp TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_veiculos_status ON veiculos(status);
CREATE INDEX IF NOT EXISTS idx_veiculos_marca ON veiculos(marca);
CREATE INDEX IF NOT EXISTS idx_agent_logs_session ON agent_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_veiculos_updated_at BEFORE UPDATE ON veiculos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE veiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público (ajuste conforme necessário)
CREATE POLICY "Permitir acesso público a veículos" ON veiculos
    FOR ALL USING (true);

CREATE POLICY "Permitir acesso público a logs" ON agent_logs
    FOR ALL USING (true);

-- Comentários
COMMENT ON TABLE veiculos IS 'Tabela principal de veículos do sistema MAGNO';
COMMENT ON TABLE agent_logs IS 'Logs de ações do agente de IA';
