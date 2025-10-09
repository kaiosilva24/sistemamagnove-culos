# ✅ Checklist de Configuração - Sistema de Autenticação

Use este checklist para garantir que tudo está configurado corretamente.

## 📋 Pré-requisitos

- [ ] Node.js instalado (v14 ou superior)
- [ ] Conta no Supabase criada
- [ ] Projeto Supabase ativo

## 🔧 Configuração do Supabase

### 1. Executar Script SQL

- [ ] Acessei https://supabase.com/dashboard
- [ ] Selecionei o projeto correto
- [ ] Abri o **SQL Editor**
- [ ] Copiei o conteúdo de `supabase_auth_config.sql`
- [ ] Executei o script sem erros
- [ ] Verifiquei que as tabelas têm a coluna `user_id`
- [ ] Verifiquei que RLS está ativo nas tabelas

### 2. Configurar Autenticação

- [ ] Abri **Authentication** → **Settings**
- [ ] Em **Email Auth**, marquei **"Enable email auth"**
- [ ] Para desenvolvimento: **Desmarquei** "Enable email confirmations"
- [ ] Salvei as alterações

### 3. Copiar Credenciais

- [ ] Abri **Settings** → **API**
- [ ] Copiei a **Project URL**
- [ ] Copiei a **anon/public key**
- [ ] Verifiquei que as credenciais estão corretas no `.env` e `.env.local`

## 💻 Configuração Local

### 1. Arquivos Criados

Verifique se estes arquivos existem:

**Frontend:**
- [ ] `src/lib/supabase.js`
- [ ] `src/context/AuthContext.jsx`
- [ ] `src/pages/Login.jsx`
- [ ] `src/components/ProtectedRoute.jsx`
- [ ] `src/lib/api.js`
- [ ] `.env.local`

**Backend:**
- [ ] `server/authMiddleware.js`
- [ ] `server/index.supabase.js` (atualizado)
- [ ] `server/supabaseDB.js` (atualizado)

**Documentação:**
- [ ] `AUTENTICACAO.md`
- [ ] `INICIO_RAPIDO_AUTH.md`
- [ ] `supabase_auth_config.sql`

### 2. Variáveis de Ambiente

Arquivo **`.env.local`** (Frontend):
```env
VITE_SUPABASE_URL=SUA_SUPABASE_URL
VITE_SUPABASE_KEY=sua_chave_anon_aqui
```

- [ ] `.env.local` criado na raiz do projeto
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_KEY` configurada

Arquivo **`.env`** (Backend):
```env
SUPABASE_URL=SUA_SUPABASE_URL
SUPABASE_KEY=sua_chave_anon_aqui
```

- [ ] `.env` existe e tem as credenciais do Supabase
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_KEY` configurada

### 3. Instalação

- [ ] Executei `npm install`
- [ ] Não houve erros de instalação

## 🚀 Testes

### 1. Iniciar o Sistema

- [ ] Executei `npm run dev`
- [ ] Backend iniciou na porta 3000
- [ ] Frontend iniciou na porta 5173
- [ ] Não há erros no console do terminal

### 2. Testar Autenticação

#### Criar Usuário no Supabase (Administrador)
- [ ] Acessei https://supabase.com/dashboard
- [ ] Fui em **Authentication** → **Users**
- [ ] Cliquei em **"Add user"**
- [ ] Preenchi email e senha
- [ ] Marquei **"Auto Confirm User"**
- [ ] Cliquei em **"Create user"**
- [ ] Usuário foi criado com sucesso
- [ ] Verifiquei que o usuário aparece na lista

#### Login (Usuário)
- [ ] Na tela de login, inseri email e senha
- [ ] Cliquei em "Entrar"
- [ ] Fui redirecionado para o Dashboard
- [ ] Vejo meu email no canto superior direito
- [ ] O botão "Sair" está visível

#### Proteção de Rotas
- [ ] Tentei acessar `/veiculos` sem estar logado → fui redirecionado para `/login`
- [ ] Após login, consegui acessar todas as páginas

#### Isolamento de Dados
- [ ] Cadastrei um veículo
- [ ] Fiz logout
- [ ] Abri uma aba anônima
- [ ] Criei outra conta
- [ ] O novo usuário NÃO vê o veículo do primeiro usuário

### 3. Testar API

- [ ] Acessei o Dashboard e vejo estatísticas
- [ ] Consegui criar um veículo
- [ ] Consegui adicionar gastos
- [ ] Os dados são salvos corretamente
- [ ] Apenas meus dados são exibidos

### 4. Testar Logout

- [ ] Cliquei em "Sair"
- [ ] Fui redirecionado para `/login`
- [ ] Tentei acessar uma página protegida → fui redirecionado para `/login`

## 🔍 Verificação no Supabase

### Dados no Banco

- [ ] Abri **Table Editor** no Supabase
- [ ] Selecionei tabela `veiculos`
- [ ] Vejo a coluna `user_id` preenchida
- [ ] Cada veículo tem o `user_id` do dono

### Usuários

- [ ] Abri **Authentication** → **Users**
- [ ] Vejo os usuários cadastrados
- [ ] Os emails estão corretos

### Logs

- [ ] Abri **Logs** → **API Logs**
- [ ] Vejo requisições sendo feitas
- [ ] Não há erros de autenticação

## ❌ Troubleshooting

### Erro "Não autorizado"
- [ ] Verifiquei que estou logado
- [ ] Fiz logout e login novamente
- [ ] Limpei cache do navegador (Ctrl+Shift+Del)

### Erro "Token inválido"
- [ ] Verifiquei as credenciais no `.env` e `.env.local`
- [ ] Comparei com as credenciais do painel Supabase
- [ ] Reiniciei o servidor

### Vejo dados de outros usuários
- [ ] Executei novamente o `supabase_auth_config.sql`
- [ ] Verifiquei que RLS está ativo: Table Editor → Tabela → RLS
- [ ] Reiniciei o servidor

### Não consigo criar usuário no Supabase
- [ ] Verifiquei que o email não está em uso
- [ ] Marquei "Auto Confirm User"
- [ ] Tentei com outro email
- [ ] Verifiquei que tenho permissões de administrador

## ✅ Tudo Funcionando!

Se todos os itens estão marcados, seu sistema de autenticação está **100% funcional**! 🎉

### Próximos Passos

1. 📖 Leia a documentação completa: `AUTENTICACAO.md`
2. 🤖 Configure o agente de IA: `AGENTE_IA.md`
3. 🎤 Teste os comandos de voz: `COMANDOS_DE_VOZ.md`
4. 🚀 Comece a usar o sistema!

---

**Precisa de ajuda?** Leia o [INICIO_RAPIDO_AUTH.md](./INICIO_RAPIDO_AUTH.md)
