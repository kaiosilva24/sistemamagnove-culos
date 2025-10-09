# 🚀 Deploy do Backend - Sistema MAGNO

## 📋 Problema Atual

O Vercel hospeda apenas o **frontend estático** (React). Mas o sistema precisa do **backend** (Node.js/Express) rodando para:
- Processar comandos de IA
- Gerenciar veículos e gastos
- Salvar preferências
- Gerar relatórios

## ✅ Solução: Hospedar Backend no Railway/Render

---

## 🚂 Opção 1: Railway (Recomendado)

### Vantagens:
- ✅ **Gratuito** (500h/mês)
- ✅ Deploy automático do GitHub
- ✅ Variáveis de ambiente fáceis
- ✅ Logs em tempo real

### Passo a Passo:

#### 1️⃣ Criar Conta no Railway
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em **"New Project"**
4. Selecione **"Deploy from GitHub repo"**
5. Escolha: **sistemamagnove-culos**

#### 2️⃣ Configurar o Projeto
1. Railway vai detectar automaticamente Node.js
2. Configure o **Start Command**:
   ```bash
   node server/index.supabase.js
   ```

#### 3️⃣ Adicionar Variáveis de Ambiente
Vá em **Variables** e adicione:

```env
PORT=3000
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_anon_supabase
GEMINI_API_KEY=sua_chave_gemini (opcional)
GROQ_API_KEY=sua_chave_groq (opcional)
NODE_ENV=production
```

#### 4️⃣ Deploy
1. Clique em **"Deploy"**
2. Aguarde o build (2-5 min)
3. Copie a URL gerada (ex: `https://seu-app.up.railway.app`)

#### 5️⃣ Atualizar Frontend no Vercel
Você precisa dizer ao frontend onde está o backend.

---

## 🎨 Opção 2: Render

### Vantagens:
- ✅ **Gratuito**
- ✅ SSL automático
- ✅ Deploy do GitHub

### Passo a Passo:

#### 1️⃣ Criar Conta no Render
1. Acesse: https://render.com
2. Login com GitHub
3. **New** → **Web Service**
4. Conecte o repositório: **sistemamagnove-culos**

#### 2️⃣ Configurar o Serviço
```
Name: magno-backend
Environment: Node
Region: Oregon (US West)
Branch: main
Build Command: npm install
Start Command: node server/index.supabase.js
```

#### 3️⃣ Adicionar Variáveis de Ambiente
```env
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_anon_supabase
GEMINI_API_KEY=sua_chave_gemini
GROQ_API_KEY=sua_chave_groq
NODE_ENV=production
PORT=3000
```

#### 4️⃣ Plan
Selecione **Free** (gratuito)

#### 5️⃣ Create Web Service
Aguarde deploy (5-10 min)

---

## 🔗 Conectar Frontend ao Backend

Depois que o backend estiver rodando, você precisa atualizar o frontend.

### Atualizar arquivo `src/lib/api.js`:

```javascript
// Trocar de:
const API_URL = 'http://localhost:3000/api';

// Para:
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### Adicionar variável no Vercel:

1. Vercel Dashboard → Settings → Environment Variables
2. Adicione:
```
Nome: VITE_API_URL
Valor: https://seu-backend.railway.app/api
         (ou https://seu-backend.onrender.com/api)
Environments: Production, Preview, Development
```

3. Redeploy no Vercel

---

## 🧪 Testar o Backend

### Teste 1: Health Check
```bash
curl https://seu-backend.railway.app/api/health
```

Deve retornar:
```json
{"status": "ok", "message": "API funcionando"}
```

### Teste 2: Dashboard (sem auth)
```bash
curl https://seu-backend.railway.app/api/dashboard
```

---

## 🐛 Resolução de Problemas

### ❌ Backend não inicia

**Verificar logs:**
- Railway: Clique em **Deployments** → Ver logs
- Render: Vá em **Logs** no menu

**Causas comuns:**
1. Variáveis de ambiente faltando
2. Porta incorreta
3. Caminho do arquivo errado

**Solução:**
```bash
# Verificar se variáveis estão corretas
# Confirmar comando: node server/index.supabase.js
```

---

### ❌ CORS Error no frontend

**Causa:** Backend não permite requisições do Vercel

**Solução:** Backend já tem CORS configurado, mas verifique se a URL do frontend está correta.

Se precisar, adicione no backend (`server/index.supabase.js`):
```javascript
app.use(cors({
  origin: ['https://seu-frontend.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

---

### ❌ "Cannot GET /"

**Normal!** O backend não tem página inicial, apenas a API em `/api/*`

---

## 📊 Monitoramento

### Railway:
- Ver logs em tempo real
- Métricas de CPU/RAM
- Reiniciar serviço

### Render:
- Logs persistentes
- Métricas básicas
- Auto-sleep após 15min inatividade (free tier)

---

## 💰 Custos

### Railway:
- **Gratuito:** 500h/mês ($5 de crédito)
- Depois: ~$5/mês

### Render:
- **Gratuito:** Ilimitado
- ⚠️ Dorme após 15 min de inatividade
- Leva ~30s para "acordar" na primeira requisição

---

## 🔒 Segurança

### Variáveis que DEVEM estar no backend:
✅ `SUPABASE_URL`
✅ `SUPABASE_KEY` (anon key)
✅ `GEMINI_API_KEY`
✅ `GROQ_API_KEY`

### NÃO exponha no frontend:
❌ Service Role Key do Supabase
❌ Chaves de API sensíveis

---

## ✅ Checklist Final

### Backend:
- [ ] Deploy no Railway ou Render
- [ ] Variáveis de ambiente configuradas
- [ ] Backend acessível via URL pública
- [ ] Teste `/api/health` funcionando

### Frontend:
- [ ] `VITE_API_URL` configurada no Vercel
- [ ] Arquivo `api.js` atualizado
- [ ] Redeploy feito
- [ ] Teste de login funcionando
- [ ] Dashboard carregando dados

---

## 🎯 Resumo

1. **Frontend (Vercel):** Interface React
2. **Backend (Railway/Render):** API Node.js
3. **Banco (Supabase):** PostgreSQL + Auth

Todos se comunicam via HTTPS! 🔒

---

## 📞 Próximos Passos

Após configurar:
1. Teste o login
2. Tente cadastrar um veículo
3. Use comando de voz
4. Verifique o dashboard

**Tudo funcionando?** Sistema completo no ar! 🎉
