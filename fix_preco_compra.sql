-- Tornar o campo preco_compra opcional
ALTER TABLE veiculos 
ALTER COLUMN preco_compra DROP NOT NULL;

-- Opcional: Adicionar um valor default de 0
-- ALTER TABLE veiculos 
-- ALTER COLUMN preco_compra SET DEFAULT 0;
