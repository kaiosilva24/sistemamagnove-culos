# 🔧 Como Corrigir o Campo preco_compra

## Problema
O campo `preco_compra` está marcado como **NOT NULL** no banco de dados, mas nem sempre o usuário menciona o preço no comando de voz.

## Solução
Tornar o campo **OPCIONAL** (permite NULL).

---

## 📝 Passo a Passo

### 1️⃣ Acesse o Supabase
Vá para: https://supabase.com/dashboard

### 2️⃣ Abra o SQL Editor
- Clique no seu projeto
- Menu lateral: **SQL Editor**
- Clique em **New Query**

### 3️⃣ Cole e Execute este SQL

```sql
-- Tornar o campo preco_compra opcional
ALTER TABLE veiculos 
ALTER COLUMN preco_compra DROP NOT NULL;
```

### 4️⃣ Clique em RUN (Executar)

---

## ✅ Pronto!
Agora você pode cadastrar veículos sem precisar mencionar o preço.

---

## 🎯 Teste
Após executar o SQL, reinicie o servidor e teste:
> "Cadastrar Honda Civic 2020 cor prata"

Deve funcionar sem erro! 🎉
