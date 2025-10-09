-- ============================================
-- Tabela de Gastos dos Veículos
-- ============================================

CREATE TABLE gastos_veiculos (
    id SERIAL PRIMARY KEY,
    veiculo_id INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- 'peça', 'serviço', 'documentação', 'manutenção', 'outro'
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_gasto DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_gastos_veiculo ON gastos_veiculos(veiculo_id);
CREATE INDEX idx_gastos_data ON gastos_veiculos(data_gasto);
CREATE INDEX idx_gastos_tipo ON gastos_veiculos(tipo);
