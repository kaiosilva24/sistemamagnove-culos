# 🔐 Sistema de Autenticação - Guia Completo

## 📋 Visão Geral

O sistema agora possui autenticação completa usando **Supabase Auth**, garantindo que apenas usuários autorizados possam acessar o sistema de veículos.

## ✨ Funcionalidades

- ✅ **Login com Email e Senha**
- ✅ **Criação de Usuários pelo Administrador** (no painel Supabase)
- ✅ **Logout Seguro**
- ✅ **Proteção de Rotas** (todas as páginas requerem autenticação)
- ✅ **Middleware de Autenticação no Backend**
- ✅ **Tokens JWT Automáticos** (gerenciados pelo Supabase)
- ✅ **Sessões Persistentes**
- ✅ **UI Moderna e Responsiva**

## 🚀 Como Usar

### 1. Iniciar o Sistema

```bash
npm run dev
```

Isso iniciará:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### 2. Criar Usuários (Administrador)

⚠️ **IMPORTANTE**: Usuários são criados apenas no painel do Supabase, não há cadastro público.

**[👥 Ver guia completo de criação de usuários](./CRIAR_USUARIOS_SUPABASE.md)**

**Resumo:**
1. Acesse: https://supabase.com/dashboard
2. Vá em **Authentication** → **Users**
3. Clique em **"Add user"**
4. Preencha email e senha
5. Marque **"Auto Confirm User"**
6. O usuário já pode fazer login!

### 3. Login (Usuário)

1. Na página de login, insira:
   - Email cadastrado
   - Senha
2. Clique em **"Entrar"**
3. Você será redirecionado para o Dashboard

### 4. Logout

- Clique no botão **"Sair"** no canto superior direito da navegação
- Você será desconectado e redirecionado para a página de login

## 🔧 Configuração Técnica

### Frontend

#### Arquivos Criados

1. **`src/lib/supabase.js`** - Cliente Supabase
2. **`src/context/AuthContext.jsx`** - Contexto de autenticação
3. **`src/pages/Login.jsx`** - Página de login/cadastro
4. **`src/components/ProtectedRoute.jsx`** - Componente de proteção de rotas
5. **`src/lib/api.js`** - Utilitário para requisições autenticadas

#### Como Usar o AuthContext

```jsx
import { useAuth } from '../context/AuthContext';

function MeuComponente() {
  const { user, signIn, signUp, signOut, loading } = useAuth();
  
  // user: objeto do usuário autenticado ou null
  // loading: true enquanto verifica autenticação
  
  return (
    <div>
      {user ? (
        <p>Olá, {user.email}</p>
      ) : (
        <p>Não autenticado</p>
      )}
    </div>
  );
}
```

#### Como Fazer Requisições Autenticadas

```jsx
import api from '../lib/api';

// Buscar todos os veículos
const veiculos = await api.veiculos.getAll();

// Criar veículo
const novoVeiculo = await api.veiculos.create({
  marca: 'Ford',
  modelo: 'Ka',
  // ...
});

// Dashboard
const stats = await api.dashboard.getStats();

// IA
const resultado = await api.ai.processCommand('cadastrar novo veículo');
```

### Backend

#### Arquivos Criados/Modificados

1. **`server/authMiddleware.js`** - Middleware de autenticação
2. **`server/index.supabase.js`** - Rotas protegidas

#### Middleware de Autenticação

```javascript
import { authenticateUser } from './authMiddleware.js';

// Rota protegida
app.get('/api/veiculos', authenticateUser, async (req, res) => {
  // req.user contém os dados do usuário autenticado
  const userId = req.user.id;
  // ...
});
```

#### Rotas Protegidas

Todas as seguintes rotas requerem autenticação:

- ✅ `GET /api/veiculos` - Listar veículos
- ✅ `GET /api/veiculos/:id` - Buscar veículo
- ✅ `POST /api/veiculos` - Criar veículo
- ✅ `PUT /api/veiculos/:id` - Atualizar veículo
- ✅ `DELETE /api/veiculos/:id` - Deletar veículo
- ✅ `GET /api/veiculos/:id/gastos` - Listar gastos
- ✅ `POST /api/veiculos/:id/gastos` - Adicionar gasto
- ✅ `GET /api/dashboard` - Estatísticas do dashboard
- ✅ `POST /api/ai/process` - Processar comando de IA

## 🔑 Configuração do Supabase

### Variáveis de Ambiente

O sistema já está configurado com as credenciais do Supabase. Caso precise alterar:

**Frontend** (`.env.local`):
```env
VITE_SUPABASE_URL=sua_url_supabase
VITE_SUPABASE_KEY=sua_chave_publica
```

**Backend** (`.env`):
```env
SUPABASE_URL=sua_url_supabase
SUPABASE_KEY=sua_chave_publica
```

### Configuração no Painel Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Authentication** → **Settings**
4. Configure:
   - **Email Auth**: Ativado
   - **Auto Confirm**: Recomendado ativar para desenvolvimento (confirma email automaticamente)
   - **Password Requirements**: Mínimo 6 caracteres

## 🛡️ Segurança

### Proteções Implementadas

1. **Tokens JWT**: Gerados e validados pelo Supabase
2. **HTTPS**: Todas as comunicações com Supabase usam HTTPS
3. **Sessões Seguras**: Tokens armazenados de forma segura
4. **Middleware de Autenticação**: Valida cada requisição no backend
5. **Proteção de Rotas**: Frontend redireciona para login se não autenticado

### Boas Práticas

- ✅ Senhas são criptografadas pelo Supabase (bcrypt)
- ✅ Tokens expiram automaticamente
- ✅ Não há senhas no código ou banco de dados local
- ✅ Todas as requisições sensíveis requerem autenticação

## 🐛 Resolução de Problemas

### "Não autorizado - Token não fornecido"

- **Causa**: Usuário não está autenticado
- **Solução**: Faça login novamente

### "Token inválido"

- **Causa**: Token expirado ou corrompido
- **Solução**: Faça logout e login novamente

### "Email já está cadastrado"

- **Causa**: Email já foi usado para criar uma conta
- **Solução**: Use outro email ou faça login

### Não recebo email de confirmação

- **Causa**: Email não está sendo enviado
- **Solução**: 
  1. Verifique spam
  2. No painel Supabase, ative "Auto Confirm" para desenvolvimento
  3. Configure SMTP no Supabase para produção

## 📱 Interface de Login

A página de login possui:

- ✨ Design moderno e responsivo
- 🎨 Gradientes e sombras suaves
- 🔄 Toggle entre Login e Cadastro
- ⚠️ Mensagens de erro claras
- ✅ Feedback visual de sucesso
- 🔄 Loading states
- 🎯 Validação de formulário

## 🚦 Fluxo de Autenticação

```
1. Usuário acessa o sistema
   ↓
2. AuthContext verifica se há sessão ativa
   ↓
3a. SIM → Permite acesso ao sistema
3b. NÃO → Redireciona para /login
   ↓
4. Usuário faz login
   ↓
5. Supabase valida credenciais
   ↓
6. Token JWT é gerado
   ↓
7. Token é armazenado automaticamente
   ↓
8. Usuário é redirecionado para Dashboard
   ↓
9. Todas as requisições incluem o token
   ↓
10. Backend valida token em cada requisição
```

## 📞 Suporte

Para mais informações sobre Supabase Auth:
- Documentação: https://supabase.com/docs/guides/auth
- Discord: https://discord.supabase.com

---

**Sistema desenvolvido com ❤️ usando React, Supabase e Express**
