-- ============================================
-- MAGNO - Schema Supabase (Simplificado)
-- ============================================

-- Tabela de Veículos
CREATE TABLE veiculos (
    id SERIAL PRIMARY KEY,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano INTEGER,
    cor VARCHAR(50),
    placa VARCHAR(20),
    km INTEGER DEFAULT 0,
    preco_compra DECIMAL(10,2), -- Agora é OPCIONAL
    preco_venda DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'estoque',
    data_compra DATE DEFAULT CURRENT_DATE,
    data_venda DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Logs do Agente
CREATE TABLE agent_logs (
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

-- Índices
CREATE INDEX idx_veiculos_status ON veiculos(status);
CREATE INDEX idx_veiculos_marca ON veiculos(marca);
CREATE INDEX idx_agent_logs_session ON agent_logs(session_id);
CREATE INDEX idx_agent_logs_timestamp ON agent_logs(timestamp);
