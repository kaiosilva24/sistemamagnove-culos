-- Adiciona coluna vehicle_id na tabela agent_logs
ALTER TABLE agent_logs 
ADD COLUMN IF NOT EXISTS vehicle_id INTEGER REFERENCES veiculos(id);

-- Cria índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_agent_logs_vehicle_id ON agent_logs(vehicle_id);
