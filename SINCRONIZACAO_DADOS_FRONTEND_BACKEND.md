# ✅ Sincronização Frontend ↔ Backend - Sistema MAGNO

## 🎯 Problema Resolvido

Os dados visualizados no **frontend** agora estão 100% sincronizados com o **backend no Vercel**.

---

## 🔧 Correções Aplicadas

### 1. **Padronização do Campo de Gastos**

**Problema:** O frontend usava `categoria` enquanto o backend esperava `tipo`.

**Solução:** Padronizamos tudo para usar `tipo`.

#### Arquivos Corrigidos:

✅ **src/components/AdvancedVoiceAgent.jsx** (linha 287)
- Alterado de `categoria` para `tipo`
- Mantido fallback: `collectedData.tipo || collectedData.categoria || 'Outros'`

✅ **src/hooks/useAdvancedVoice.js** (linhas 68-77)
- Função `extractExpenseData()` agora retorna `data.tipo`
- Valores: `'Manutenção'`, `'Peça'`, `'Documentação'`, `'Estética'`, `'Outros'`

✅ **src/pages/DetalhesVeiculo.jsx** (já estava correto)
- Usa `gasto.tipo` para exibição

---

## 📊 Estrutura de Dados Padronizada

### Tabela `gastos` (Supabase)

```sql
CREATE TABLE gastos (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES veiculos(id) ON DELETE CASCADE,
    tipo VARCHAR(50),        -- ✅ Campo padronizado
    descricao TEXT,
    valor DECIMAL(10,2),
    data DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Backend (`/api/veiculos/[id]/gastos.js`)

```javascript
// POST - Adicionar gasto
const { tipo, valor, descricao, data } = req.body;

await supabase
  .from('gastos')
  .insert([{
    vehicle_id: id,
    tipo: tipo,          // ✅ Campo padronizado
    valor: valor,
    descricao: descricao,
    data: data
  }]);
```

### Frontend (React)

```javascript
// Exibir gasto
<span>{gasto.tipo}</span>     // ✅ Campo padronizado

// Adicionar gasto
const data = {
  tipo: 'Peça',              // ✅ Campo padronizado
  valor: 500,
  descricao: 'Troca de óleo'
};
```

---

## 🔄 Fluxo de Dados Completo

```
1. Usuário adiciona gasto no frontend
   ↓
2. Frontend envia: { tipo, valor, descricao, data }
   ↓
3. API Vercel (/api/veiculos/[id]/gastos) recebe
   ↓
4. Backend salva no Supabase com campo "tipo"
   ↓
5. Frontend busca gastos
   ↓
6. API retorna gastos com campo "tipo"
   ↓
7. Frontend exibe gasto.tipo ✅
```

---

## ✅ Checklist de Sincronização

### Backend (Vercel)
- [x] `/api/veiculos/[id]/gastos.js` - Usa campo `tipo`
- [x] `/api/ai/process.js` - Usa campo `tipo`
- [x] `/api/dashboard.js` - Busca gastos corretamente
- [x] `/api/_lib/supabase.js` - Configuração correta

### Frontend
- [x] `src/components/AdvancedVoiceAgent.jsx` - Envia `tipo`
- [x] `src/hooks/useAdvancedVoice.js` - Extrai `tipo`
- [x] `src/pages/DetalhesVeiculo.jsx` - Exibe `tipo`
- [x] `src/lib/api.js` - Configuração correta de API_URL

### Banco de Dados (Supabase)
- [x] Tabela `gastos` tem coluna `tipo`
- [x] RLS (Row Level Security) configurado
- [x] Triggers e políticas ativas

---

## 🚀 Como Garantir Sincronização Contínua

### 1. **Ao Adicionar Novos Campos**

Siga esta ordem:
1. Adicionar coluna no Supabase
2. Atualizar API backend (`/api`)
3. Atualizar frontend (`/src`)
4. Testar localmente
5. Deploy no Vercel

### 2. **Ao Modificar Campos Existentes**

Se precisar renomear:
```sql
-- No Supabase SQL Editor
ALTER TABLE gastos RENAME COLUMN tipo TO categoria;
```

Depois atualizar:
- Backend: `/api/veiculos/[id]/gastos.js`
- Frontend: todos os componentes que usam o campo

### 3. **Variáveis de Ambiente**

Certifique-se de que estão configuradas no Vercel:

**Frontend:**
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_KEY=sua_chave_anon
```

**Backend (Serverless):**
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua_chave_anon
GEMINI_API_KEY=sua_chave_gemini
GROQ_API_KEY=sua_chave_groq
```

---

## 🔍 Verificação Rápida

Execute estes comandos para verificar sincronização:

### 1. Verificar estrutura da tabela
```sql
-- No Supabase SQL Editor
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'gastos';
```

### 2. Testar endpoint local
```bash
# Iniciar backend local
npm run server

# Iniciar frontend local
npm run client
```

### 3. Testar no Vercel
Acesse: `https://seu-projeto.vercel.app`

---

## 📝 Valores Aceitos para `tipo`

Padronizados no sistema:

- ✅ `Peça`
- ✅ `Manutenção`
- ✅ `Documentação`
- ✅ `Estética`
- ✅ `Outros`

---

## 🐛 Resolução de Problemas

### Problema: Gastos aparecem sem tipo no frontend

**Causa:** Dados antigos no banco com campo `categoria`

**Solução:**
```sql
-- Migrar dados antigos (se houver)
UPDATE gastos 
SET tipo = categoria 
WHERE tipo IS NULL AND categoria IS NOT NULL;
```

### Problema: API retorna erro 500 ao adicionar gasto

**Causa:** Variáveis de ambiente não configuradas no Vercel

**Solução:**
1. Vercel Dashboard → Settings → Environment Variables
2. Adicionar: `SUPABASE_URL` e `SUPABASE_KEY`
3. Redeploy do projeto

### Problema: Frontend não busca dados

**Causa:** CORS ou URL da API incorreta

**Solução:**
Verificar `src/lib/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
    ? '/api'
    : 'http://localhost:3000/api'
);
```

---

## 📞 Suporte

Se ainda houver problemas de sincronização:

1. Verificar logs do Vercel (Functions)
2. Verificar console do navegador (Network tab)
3. Confirmar que variáveis de ambiente estão corretas
4. Verificar RLS no Supabase (pode bloquear acesso)

---

## 🎉 Status Atual

✅ **SINCRONIZADO** - Frontend e backend usando `tipo`  
✅ **DEPLOY PRONTO** - Pode fazer push para Vercel  
✅ **BANCO ATUALIZADO** - Schema alinhado  

**Última atualização:** 11/10/2025
