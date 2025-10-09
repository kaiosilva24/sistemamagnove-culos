# 🚀 Início Rápido - Sistema de Autenticação

## ⚡ Configuração em 3 Passos

### 1️⃣ Configurar o Supabase (IMPORTANTE)

Antes de usar o sistema, você DEVE executar o script SQL no Supabase:

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Copie e cole o conteúdo do arquivo `supabase_auth_config.sql`
6. Clique em **Run** (ou pressione Ctrl+Enter)
7. Verifique se não há erros

✅ Isso irá:
- Adicionar a coluna `user_id` nas tabelas
- Ativar Row Level Security (RLS)
- Criar políticas de segurança para isolar dados por usuário

### 2️⃣ Configurar Email Automático (Desenvolvimento)

Para facilitar o desenvolvimento, desative a confirmação de email:

1. No painel do Supabase, vá em **Authentication** → **Settings**
2. Role até **Email Settings**
3. **Desmarque** a opção "Enable email confirmations"
4. Salve as alterações

Isso permite criar contas sem precisar confirmar o email.

### 3️⃣ Iniciar o Sistema

```bash
npm run dev
```

Acesse: http://localhost:5173

## 📝 Primeiro Uso

### Criar Usuários

⚠️ **IMPORTANTE**: Usuários são criados apenas pelo administrador no painel do Supabase.

**[👥 Ver guia completo de criação de usuários](./CRIAR_USUARIOS_SUPABASE.md)**

**Resumo rápido:**
1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Clique em **"Add user"** → **"Create new user"**
4. Preencha email e senha
5. Marque **"Auto Confirm User"**
6. Clique em **"Create user"**

### Fazer Login

1. O usuário acessa http://localhost:5173
2. Insere email e senha fornecidos pelo administrador
3. Clica em **"Entrar"**
4. Pronto! Acesso liberado ao sistema

### Usar o Sistema

Após o login, você terá acesso completo a:

- ✅ Dashboard com estatísticas
- ✅ Listagem de veículos
- ✅ Cadastro de novos veículos
- ✅ Agente de voz com IA
- ✅ Controle de gastos

## 🔒 Segurança

### Isolamento de Dados

Cada usuário vê APENAS seus próprios dados:
- Seus veículos
- Seus gastos
- Suas preferências
- Seus logs de IA

### Como Funciona

1. Ao fazer login, você recebe um **token JWT**
2. Esse token é enviado automaticamente em cada requisição
3. O backend valida o token
4. O Supabase filtra automaticamente os dados pelo seu `user_id`

## 🧪 Testar com Múltiplos Usuários

1. Abra uma janela anônima do navegador
2. Crie uma segunda conta
3. Cadastre veículos diferentes em cada conta
4. Verifique que cada usuário vê apenas seus dados

## 📊 Verificar Dados no Supabase

1. Acesse: https://supabase.com/dashboard
2. Vá em **Table Editor**
3. Selecione a tabela `veiculos`
4. Note que cada registro tem um `user_id` diferente

## ❓ FAQ

### Esqueci minha senha

No Supabase, você pode implementar recuperação de senha:
1. No painel, vá em **Authentication** → **Email Templates**
2. Configure o template "Reset Password"
3. Adicione botão "Esqueci senha" na tela de login

### Erro "Não autorizado"

- Verifique se você está logado
- Faça logout e login novamente
- Limpe o cache do navegador

### Não consigo criar conta

- Verifique se executou o script SQL (`supabase_auth_config.sql`)
- Verifique se o email já está em uso
- Tente com outro email

### Vejo dados de outros usuários

- Isso NÃO deve acontecer se o RLS estiver configurado corretamente
- Execute novamente o script `supabase_auth_config.sql`
- Verifique no painel do Supabase se o RLS está ativo nas tabelas

## 🛠️ Comandos Úteis

### Limpar dados do usuário atual
```sql
-- Execute no SQL Editor do Supabase
DELETE FROM veiculos WHERE user_id = auth.uid();
DELETE FROM user_preferences WHERE user_id = auth.uid();
DELETE FROM agent_logs WHERE user_id = auth.uid();
```

### Ver usuários cadastrados
```sql
-- Execute no SQL Editor do Supabase
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;
```

## 📞 Suporte

Leia a documentação completa em: **AUTENTICACAO.md**

---

**Pronto! Agora você tem um sistema de veículos completo e seguro! 🎉**
