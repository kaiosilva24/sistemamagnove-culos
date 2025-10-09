# 💾 Sistema de Preferências do Usuário

## 🎯 Funcionalidade
Salva suas preferências no Supabase e mantém entre sessões!

---

## 📋 Primeira Configuração

### 1️⃣ Execute no Supabase

Acesse https://supabase.com/dashboard e execute:

```sql
CREATE TABLE user_preferences (
    id SERIAL PRIMARY KEY,
    preference_key VARCHAR(100) NOT NULL UNIQUE,
    preference_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_preferences_key ON user_preferences(preference_key);

INSERT INTO user_preferences (preference_key, preference_value) 
VALUES ('preferred_ai', 'gemini')
ON CONFLICT (preference_key) DO NOTHING;
```

---

## ✅ O Que Foi Implementado

### 1️⃣ **Backend (Supabase)**
- ✅ Tabela `user_preferences` criada
- ✅ Rotas de API:
  - `GET /api/preferences` - Todas as preferências
  - `GET /api/preferences/:key` - Preferência específica
  - `POST /api/preferences` - Salvar preferência

### 2️⃣ **Frontend (React)**
- ✅ Carrega preferência ao abrir o site
- ✅ Salva automaticamente quando troca de IA
- ✅ Mantém seleção entre sessões

---

## 🧪 Como Funciona

### Ao Abrir o Site:
1. Busca preferência salva no Supabase
2. Se encontrar, seleciona automaticamente a IA

### Ao Trocar de IA:
1. Você clica no dropdown e seleciona outra IA
2. Sistema salva automaticamente no Supabase
3. Na próxima vez que abrir, já vem selecionada!

---

## 💡 Extensível

Esta mesma estrutura pode salvar outras preferências:
- Volume da voz
- Velocidade da fala
- Tema do site (claro/escuro)
- Idioma
- etc...

Basta adicionar novas chaves na tabela!

---

## 🔧 Arquivos Modificados

- ✅ `server/supabaseDB.js` - Métodos de preferências
- ✅ `server/index.supabase.js` - Rotas de API
- ✅ `src/components/VoiceAgent.jsx` - Carregar/salvar preferência
- ✅ `preferencias_schema.sql` - Schema do banco

---

## 🚀 Pronto para Usar!

Após executar o SQL no Supabase e reiniciar o servidor, suas preferências serão persistidas! 🎉
