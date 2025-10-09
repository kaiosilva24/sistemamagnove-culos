# 🔍 Diagnóstico - Erro 422 no Login

## ❌ Erro Recebido
```
Failed to load resource: the server responded with a status of 422
[SEU_PROJETO].supabase.co/auth/v1/token?grant_type=password
```

## 🎯 Causas Mais Comuns

### 1️⃣ Nenhum Usuário Foi Criado Ainda

**Esse é o motivo mais comum!**

✅ **Solução:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto no Supabase
3. Vá em **Authentication** → **Users**
4. Clique em **"Add user"** → **"Create new user"**
5. Preencha:
   ```
   Email: admin@teste.com
   Password: Admin@123456
   ✅ Auto Confirm User (marcar)
   ```
6. Clique em **"Create user"**
7. Agora tente fazer login com essas credenciais

### 2️⃣ Email Auth Não Está Habilitado

✅ **Solução:**
1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Settings**
3. Procure por **"Email Provider Settings"**
4. Certifique-se que **"Enable Email Provider"** está **ATIVO**
5. Salve as alterações

### 3️⃣ Credenciais do Supabase Incorretas

Verifique se a URL e KEY estão corretas:

**URL:** `SUA_SUPABASE_URL`
**KEY:** `SUA_SUPABASE_ANON_KEY`

✅ **Verificar:**
1. Acesse: https://supabase.com/dashboard
2. Vá em **Settings** → **API**
3. Confirme que a **Project URL** e **anon/public key** estão corretas
4. Se estiverem diferentes, atualize o `.env` e `.env.local`

### 4️⃣ Servidor Não Foi Reiniciado

Após alterar variáveis de ambiente, é necessário reiniciar.

✅ **Solução:**
```powershell
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## 🧪 Teste Rápido

### Criar Usuário de Teste via Console do Navegador

1. Abra o Console do navegador (F12)
2. Cole e execute este código:

```javascript
// Importar cliente Supabase
const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

const supabase = createClient(
  'SUA_SUPABASE_URL',
  'SUA_SUPABASE_ANON_KEY'
);

// Testar login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@teste.com',
  password: 'Admin@123456'
});

console.log('Resultado:', { data, error });
```

**Resultados esperados:**

✅ **Se funcionar:**
```javascript
{
  data: { user: {...}, session: {...} },
  error: null
}
```

❌ **Se der erro:**
```javascript
{
  data: { user: null, session: null },
  error: { message: "Invalid login credentials" }
}
```

## 📋 Checklist de Verificação

Execute este checklist passo a passo:

- [ ] **1. Projeto Supabase está ativo?**
  - Acesse: https://supabase.com/dashboard
  - Seu projeto aparece?
  - Status está "Active"?

- [ ] **2. Email Auth está habilitado?**
  - Authentication → Settings
  - "Enable Email Provider" está marcado?

- [ ] **3. Existe pelo menos 1 usuário?**
  - Authentication → Users
  - Há usuários na lista?
  - Status está "Confirmed"?

- [ ] **4. Credenciais estão corretas?**
  - Settings → API
  - Project URL bate com `.env.local`?
  - anon key bate com `.env.local`?

- [ ] **5. Servidor foi reiniciado?**
  - Parou com Ctrl+C?
  - Rodou `npm run dev` novamente?

- [ ] **6. Navegador não está em cache?**
  - Limpou cache (Ctrl+Shift+Del)?
  - Ou testou em aba anônima?

## 🔧 Solução Passo a Passo

### Passo 1: Criar Usuário Administrador

```bash
# 1. Acesse o painel do Supabase
# 2. Vá em Authentication → Users
# 3. Clique em "Add user"
# 4. Preencha:
#    Email: admin@sistema.com
#    Password: Senha@Forte123
#    ✅ Auto Confirm User
# 5. Salve
```

### Passo 2: Verificar Configurações de Auth

```bash
# 1. Vá em Authentication → Settings
# 2. Confirme:
#    ✅ Enable Email Provider (ativo)
#    ✅ Enable Email Confirmations (desativado para dev)
# 3. Salve alterações
```

### Passo 3: Reiniciar Servidor

```powershell
# Pare o servidor
Ctrl+C

# Limpe cache do Node (opcional)
npm cache clean --force

# Reinstale dependências (se necessário)
npm install

# Inicie novamente
npm run dev
```

### Passo 4: Testar Login

```bash
# 1. Acesse: http://localhost:5173
# 2. Use as credenciais criadas:
#    Email: admin@sistema.com
#    Password: Senha@Forte123
# 3. Clique em "Entrar"
```

## 🆘 Ainda Não Funciona?

### Verificar Logs do Supabase

1. Acesse: https://supabase.com/dashboard
2. Vá em **Logs** → **Auth Logs**
3. Procure por logs recentes
4. Verifique se há erros específicos

### Verificar Network no Navegador

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Tente fazer login
4. Clique na requisição `token?grant_type=password`
5. Veja a resposta no **Response**

**Possíveis respostas:**

❌ **422 - "Email not confirmed"**
→ O usuário não foi confirmado. Marque "Auto Confirm" ao criar.

❌ **422 - "Invalid login credentials"**
→ Email ou senha incorretos. Verifique no Supabase.

❌ **422 - "Email provider is disabled"**
→ Ative o Email Provider nas configurações.

❌ **403 - "Forbidden"**
→ A anon key está incorreta.

## 📞 Informações Úteis

**Project URL:** `SUA_SUPABASE_URL`
**Project ID:** `SEU_PROJECT_ID`
**Dashboard:** https://supabase.com/dashboard

## ✅ Teste Definitivo

Execute este comando no terminal do seu projeto:

```powershell
node -e "import('node-fetch').then(m => { const fetch = m.default; fetch('SUA_SUPABASE_URL/auth/v1/health').then(r => r.json()).then(console.log).catch(console.error); });"
```

**Resultado esperado:**
```json
{
  "name": "supabase-auth",
  "version": "..."
}
```

Se receber isso, o Supabase está funcionando! ✅

---

**Na maioria dos casos, o problema é simplesmente que nenhum usuário foi criado ainda no painel do Supabase!**

👉 **Crie um usuário agora:** [CRIAR_USUARIOS_SUPABASE.md](./CRIAR_USUARIOS_SUPABASE.md)
