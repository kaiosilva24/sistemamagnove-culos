-- Remove a constraint antiga e recria com ON DELETE CASCADE

-- Para agent_logs
ALTER TABLE agent_logs 
DROP CONSTRAINT IF EXISTS agent_logs_vehicle_id_fkey;

ALTER TABLE agent_logs 
ADD CONSTRAINT agent_logs_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) REFERENCES veiculos(id) 
ON DELETE CASCADE;

-- Confirma que gastos_veiculos já tem CASCADE
ALTER TABLE gastos_veiculos 
DROP CONSTRAINT IF EXISTS gastos_veiculos_veiculo_id_fkey;

ALTER TABLE gastos_veiculos 
ADD CONSTRAINT gastos_veiculos_veiculo_id_fkey 
FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) 
ON DELETE CASCADE;
