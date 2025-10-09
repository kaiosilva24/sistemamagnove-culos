# 🔧 FIX: Erro de Row Level Security (RLS) em Gastos

## ❌ Problema

Erro ao adicionar gastos:
```
Error: new row violates row-level security policy for table "gastos"
```

## 🔍 Causa

As políticas RLS da tabela `gastos` estão configuradas com o nome de coluna **errado**:
- Código usa: `vehicle_id`
- Política RLS pode estar usando: `veiculo_id`

## ✅ Solução

### Opção 1: Corrigir as Políticas RLS no Supabase (RECOMENDADO)

1. Acesse o **Supabase Dashboard** → SQL Editor
2. Execute o arquivo `fix_gastos_rls.sql`:

```sql
-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view gastos of their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can insert gastos on their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can update gastos of their vehicles" ON gastos;
DROP POLICY IF EXISTS "Users can delete gastos of their vehicles" ON gastos;

-- Recriar com nome correto (vehicle_id)
CREATE POLICY "Users can view gastos of their vehicles"
ON gastos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert gastos on their vehicles"
ON gastos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update gastos of their vehicles"
ON gastos FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete gastos of their vehicles"
ON gastos FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM veiculos 
    WHERE veiculos.id = gastos.vehicle_id 
    AND veiculos.user_id = auth.uid()
  )
);
```

### Opção 2: Verificar o nome da coluna primeiro

1. No Supabase, execute:
```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'gastos';
```

2. Se a coluna for `veiculo_id`, então você precisa mudar o código em `api/ai/process.js`:
   - Trocar `vehicle_id` por `veiculo_id` na linha 116

### Opção 3: Temporária - Desabilitar RLS (NÃO RECOMENDADO)

**APENAS PARA TESTE, NÃO USE EM PRODUÇÃO:**
```sql
ALTER TABLE gastos DISABLE ROW LEVEL SECURITY;
```

## 🧪 Teste após o fix

Execute o comando:
```
"adicionar gasto placa abcd câmbio r$ 200 motor r$ 3000 ok"
```

Deve funcionar sem erros! ✅

## 📝 Arquivos relacionados

- `fix_gastos_rls.sql` - Script SQL para corrigir
- `api/ai/process.js` - Código que insere gastos
- `supabase_auth_config.sql` - Configuração RLS original
