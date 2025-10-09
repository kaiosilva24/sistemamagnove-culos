# 🚀 Deploy COMPLETO no Vercel - Sistema MAGNO

## ✅ Backend + Frontend no Vercel (Tudo em Um!)

O sistema agora usa **Serverless Functions** do Vercel. Frontend e Backend hospedados juntos!

## ⚡ Passo a Passo Completo

### 1️⃣ Preparar o Projeto

Certifique-se de que o código está no GitHub:
```bash
git add .
git commit -m "Preparar para deploy"
git push origin main
```

---

### 2️⃣ Criar Projeto no Vercel

1. Acesse: https://vercel.com
2. Clique em **"Add New Project"**
3. Conecte seu repositório GitHub
4. Selecione o repositório: **sistemamagnove-culos**

---

### 3️⃣ Configurar Variáveis de Ambiente (IMPORTANTE!)

Antes de fazer deploy, **você DEVE configurar as variáveis de ambiente**:

#### No Vercel Dashboard:

1. Na página de configuração do projeto, vá em **"Environment Variables"**
2. Adicione as seguintes variáveis **EXATAMENTE com esses nomes**:

**Para o Frontend (começam com VITE_):**
```
VITE_SUPABASE_URL
```
**Valor:** Sua URL do Supabase (ex: `https://seu-projeto.supabase.co`)

```
VITE_SUPABASE_KEY
```
**Valor:** Sua chave anon/public do Supabase

**Para o Backend (Serverless Functions):**
```
SUPABASE_URL
```
**Valor:** Sua URL do Supabase (mesma do frontend)

```
SUPABASE_KEY
```
**Valor:** Sua chave anon/public do Supabase (mesma do frontend)

```
GEMINI_API_KEY
```
**Valor:** Sua chave da API do Gemini (opcional, para IA)

```
GROQ_API_KEY
```
**Valor:** Sua chave da API do Groq (opcional, para IA)

```
NODE_ENV
```
**Valor:** `production`

#### ⚠️ MUITO IMPORTANTE:
- Variáveis com `VITE_` são para o frontend
- Variáveis **sem** `VITE_` são para o backend (Serverless Functions)
- Use a chave **anon/public** do Supabase (NÃO use a service_role)
- Aplique para: **Production, Preview, e Development**

---

### 4️⃣ Configurações de Build

Configure as seguintes opções:

**Framework Preset:** `Vite`

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
dist
```

**Install Command:**
```bash
npm install
```

---

### 5️⃣ Deploy

1. Clique em **"Deploy"**
2. Aguarde o build completar (2-5 minutos)
3. Se houver erro, leia os logs e corrija

---

## 🐛 Resolução de Problemas

### ❌ Erro: "Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY devem estar configuradas"

**Causa:** As variáveis de ambiente não foram configuradas ou têm nomes incorretos.

**Solução:**

1. Vá em: **Settings** → **Environment Variables**
2. Verifique se as variáveis existem com os nomes **EXATOS**:
   - `VITE_SUPABASE_URL` (não `SUPABASE_URL`)
   - `VITE_SUPABASE_KEY` (não `SUPABASE_KEY`)
3. Se já existem, **delete e recrie** com os nomes corretos
4. Depois, vá em **Deployments** → Clique nos 3 pontinhos do último deploy → **Redeploy**
5. Marque a opção **"Use existing Build Cache"** como **OFF**
6. Clique em **"Redeploy"**

---

### ❌ Build falha com erro de dependências

**Solução:**
```bash
# Local: apague node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Atualizar dependências"
git push
```

---

### ❌ Site carrega mas dá erro 404 em rotas

**Causa:** Vercel precisa de configuração para SPA (Single Page Application)

**Solução:** Já está configurado no `vercel.json` (se não existir, veja próxima seção)

---

## 📁 Arquivo vercel.json (Obrigatório para React Router)

Certifique-se de que existe o arquivo `vercel.json` na raiz:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Se não existir, crie e faça commit:
```bash
git add vercel.json
git commit -m "Add vercel config"
git push
```

---

## ✅ Verificar Deploy

Após deploy bem-sucedido:

1. Acesse a URL fornecida pelo Vercel (ex: `https://seu-projeto.vercel.app`)
2. Teste o login
3. Verifique se consegue acessar o dashboard

---

## 🔒 Segurança

### Variáveis de Ambiente no Vercel

✅ **SEGURO - Pode adicionar:**
- `VITE_SUPABASE_URL` - URL pública do Supabase
- `VITE_SUPABASE_KEY` - **Anon/Public Key** (não service_role)

❌ **NUNCA adicione no frontend:**
- Service Role Key do Supabase
- Chaves privadas de API
- Senhas de banco de dados

### Backend/API

Se precisar de variáveis sensíveis (como service_role), você deve:
1. Criar uma API separada (Vercel Serverless Functions ou servidor externo)
2. Adicionar variáveis **sem** o prefixo `VITE_`
3. Acessá-las apenas no backend

---

## 🔄 Atualizar Deploy

Sempre que fizer mudanças:

```bash
git add .
git commit -m "Sua mensagem"
git push origin main
```

O Vercel fará **deploy automático** a cada push!

---

## 📊 Monitoramento

No dashboard do Vercel você pode:
- Ver logs de build
- Monitorar performance
- Ver analytics de uso
- Configurar domínio customizado

---

## 🌐 Domínio Customizado (Opcional)

1. No Vercel, vá em **Settings** → **Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruções
4. Aguarde propagação (até 48h)

---

## 💡 Dicas

1. **Sempre teste localmente antes** de fazer push
2. **Use Preview Deployments** para testar branches
3. **Monitore os logs** em caso de erros
4. **Configure alertas** para falhas de deploy

---

## 📞 Suporte

Se ainda tiver problemas:

1. Verifique os logs de build no Vercel
2. Teste localmente com `npm run build && npm run preview`
3. Confirme que as variáveis estão corretas no Supabase
4. Verifique se o Supabase está ativo e acessível

---

## ✅ Checklist Final

- [ ] Variáveis de ambiente configuradas no Vercel
- [ ] Nomes das variáveis começam com `VITE_`
- [ ] Build completa sem erros
- [ ] Site abre na URL do Vercel
- [ ] Login funciona
- [ ] Dashboard carrega corretamente
- [ ] Rotas funcionam (sem 404)

**Deploy concluído com sucesso!** 🎉
