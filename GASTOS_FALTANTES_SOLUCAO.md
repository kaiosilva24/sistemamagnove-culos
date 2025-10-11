# 🔍 Solução: Gastos Faltantes no Dashboard

## 📊 Situação Atual

Você tem **5 veículos**, mas apenas **1 tem gastos**:

```
Veículo              | Qtd Gastos | Total
---------------------|------------|--------
Honda Civic          | 0          | null
Chevrolet Onix       | 4          | R$ 1.090,00  ✅
Ford Esporte         | 0          | null
Fiat Toro            | 0          | null
Ford Ranger          | 0          | null
```

**Total esperado no dashboard:** R$ 1.090,00

---

## ❓ Por Que o Total Não Bate?

Possíveis causas:

### 1. **Gastos Órfãos** (Mais Provável)
Há gastos no banco com `vehicle_id` de veículos que foram **deletados**.

**Exemplo:**
- Você tinha um carro "Toyota Corolla" (id=10)
- Adicionou gastos nele (R$ 500)
- Deletou o carro
- Os gastos continuam no banco com `vehicle_id=10`, mas o veículo não existe mais
- Dashboard não soma esses R$ 500

### 2. **Gastos com vehicle_id NULL**
Gastos que não foram associados a nenhum veículo.

### 3. **RLS Bloqueando**
Políticas de segurança impedindo acesso a alguns gastos.

---

## 🔍 PASSO 1: Diagnóstico

Execute no **Supabase SQL Editor**:

```sql
-- Ver TODOS os gastos (incluindo órfãos)
SELECT 
    g.id,
    g.vehicle_id,
    g.tipo,
    g.valor,
    g.descricao,
    CASE 
        WHEN v.id IS NULL THEN '❌ ÓRFÃO'
        ELSE '✅ ' || v.marca || ' ' || v.modelo
    END as status
FROM gastos g
LEFT JOIN veiculos v ON g.vehicle_id = v.id
ORDER BY g.created_at DESC;
```

**O que procurar:**
- Linhas com "❌ ÓRFÃO" = gastos perdidos
- Se houver, anote os valores

---

## 🔍 PASSO 2: Ver Total Real

```sql
-- Total de TODOS os gastos (incluindo órfãos)
SELECT 
    COUNT(*) as total_gastos,
    SUM(valor) as soma_total
FROM gastos;
```

**Compare:**
- Se retornar **R$ 1.090** = Está correto, não há órfãos
- Se retornar **mais que R$ 1.090** = Há gastos órfãos!

---

## 🔧 PASSO 3: Limpar Gastos Órfãos

Se houver gastos órfãos, você tem 2 opções:

### **Opção A: Deletar Gastos Órfãos** (Recomendado)

Execute no Supabase:

```sql
-- 1. Ver o que será deletado
SELECT 
    g.id,
    g.vehicle_id,
    g.tipo,
    g.valor,
    '❌ Será deletado' as acao
FROM gastos g
WHERE g.vehicle_id NOT IN (SELECT id FROM veiculos);

-- 2. Se concordar, deletar
DELETE FROM gastos 
WHERE vehicle_id NOT IN (SELECT id FROM veiculos);

-- 3. Verificar
SELECT COUNT(*) FROM gastos;  -- Deve retornar 4 (só do Onix)
```

### **Opção B: Associar a um Veículo** (Não Recomendado)

Se quiser manter os gastos, associe a um veículo existente:

```sql
-- Associar gastos órfãos ao Chevrolet Onix
UPDATE gastos 
SET vehicle_id = (
    SELECT id FROM veiculos 
    WHERE marca = 'Chevrolet' AND modelo = 'Onix'
)
WHERE vehicle_id NOT IN (SELECT id FROM veiculos);
```

---

## 🔧 PASSO 4: Corrigir CASCADE

Para evitar esse problema no futuro, garanta que a tabela tem CASCADE:

```sql
-- Verificar constraint atual
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name = 'gastos';
```

Se **delete_rule** não for "CASCADE":

```sql
-- Remover constraint antiga
ALTER TABLE gastos 
DROP CONSTRAINT IF EXISTS gastos_vehicle_id_fkey;

-- Adicionar com CASCADE
ALTER TABLE gastos
ADD CONSTRAINT gastos_vehicle_id_fkey 
FOREIGN KEY (vehicle_id) 
REFERENCES veiculos(id) 
ON DELETE CASCADE;
```

Agora, quando deletar um veículo, os gastos serão deletados automaticamente!

---

## ✅ PASSO 5: Verificar Dashboard

Após limpar órfãos:

1. **Recarregue o dashboard** no navegador (Ctrl+Shift+R)
2. O **Total em Gastos** deve mostrar: **R$ 1.090,00**
3. Se ainda não bater, veja os logs no Vercel:
   - Functions → `/api/dashboard`
   - Procure por "📊 Dashboard Stats"

---

## 🧪 Teste Rápido

Execute tudo de uma vez:

```sql
-- Teste completo
WITH stats AS (
    SELECT 
        (SELECT COUNT(*) FROM veiculos) as total_veiculos,
        (SELECT COUNT(*) FROM gastos) as total_gastos_sistema,
        (SELECT SUM(valor) FROM gastos) as soma_total_sistema,
        (SELECT COUNT(*) FROM gastos g 
         WHERE NOT EXISTS (
             SELECT 1 FROM veiculos v WHERE v.id = g.vehicle_id
         )) as gastos_orfaos,
        (SELECT COUNT(*) FROM gastos WHERE vehicle_id IS NULL) as gastos_null
)
SELECT 
    total_veiculos,
    total_gastos_sistema,
    soma_total_sistema,
    gastos_orfaos,
    gastos_null,
    CASE 
        WHEN gastos_orfaos > 0 THEN '❌ HÁ GASTOS ÓRFÃOS'
        WHEN gastos_null > 0 THEN '⚠️ HÁ GASTOS SEM VEÍCULO'
        ELSE '✅ TUDO OK'
    END as status
FROM stats;
```

**Resultado esperado:**
```
total_veiculos: 5
total_gastos_sistema: 4
soma_total_sistema: 1090.00
gastos_orfaos: 0
gastos_null: 0
status: ✅ TUDO OK
```

---

## 📋 Scripts Disponíveis

Criei 2 arquivos SQL para você:

### 1. **`investigar_gastos_faltantes.sql`**
- 10 queries de diagnóstico
- Mostra todos os problemas
- Execute PRIMEIRO

### 2. **`corrigir_gastos_orfaos.sql`**
- Cria backup antes de deletar
- Remove gastos órfãos
- Verifica resultado
- Execute DEPOIS do diagnóstico

---

## 🎯 Resumo

1. Execute `investigar_gastos_faltantes.sql` (query 1 e 2)
2. Se houver órfãos, execute `corrigir_gastos_orfaos.sql`
3. Recarregue o dashboard
4. Verifique se o total agora é R$ 1.090,00

---

## 🔧 Se o Problema Persistir

Execute e me envie o resultado:

```sql
-- Debug completo
SELECT 
    'Total Gastos' as metrica,
    COUNT(*) as quantidade,
    SUM(valor) as total
FROM gastos
UNION ALL
SELECT 
    'Gastos Órfãos',
    COUNT(*),
    SUM(valor)
FROM gastos g
WHERE NOT EXISTS (
    SELECT 1 FROM veiculos v WHERE v.id = g.vehicle_id
)
UNION ALL
SELECT 
    'Gastos Válidos',
    COUNT(g.id),
    SUM(g.valor)
FROM veiculos v
INNER JOIN gastos g ON g.vehicle_id = v.id;
```

---

**Próximo passo:** Execute a query de diagnóstico e me mostre o resultado! 🔍
