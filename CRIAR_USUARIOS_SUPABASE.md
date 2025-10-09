# 👥 Como Criar Usuários no Supabase

## 📋 Visão Geral

Neste sistema, **apenas administradores podem criar usuários** através do painel do Supabase. Não há opção de cadastro público na interface.

## 🔐 Criar Novo Usuário

### Passo a Passo

1. **Acessar o Painel do Supabase**
   - Acesse: https://supabase.com/dashboard
   - Faça login com sua conta
   - Selecione seu projeto

2. **Ir para Authentication**
   - No menu lateral, clique em **Authentication**
   - Clique em **Users**

3. **Adicionar Novo Usuário**
   - Clique no botão **"Add user"** (canto superior direito)
   - Selecione **"Create new user"**

4. **Preencher Dados do Usuário**
   ```
   Email: usuario@exemplo.com
   Password: SenhaSegura123!
   ```
   
   **Campos:**
   - **Email**: Email do usuário (será usado para login)
   - **Password**: Senha do usuário (mínimo 6 caracteres)
   - **Auto Confirm User**: ✅ Marque para confirmar automaticamente

5. **Criar o Usuário**
   - Clique em **"Create user"**
   - O usuário será criado imediatamente
   - ✅ Usuário já pode fazer login no sistema!

## 📊 Gerenciar Usuários Existentes

### Visualizar Usuários

1. Vá em **Authentication** → **Users**
2. Você verá a lista de todos os usuários:
   - Email
   - Data de criação
   - Último acesso
   - Status

### Editar Usuário

1. Clique no email do usuário
2. Você pode:
   - 🔄 Alterar senha
   - ✉️ Alterar email
   - 🔒 Bloquear/Desbloquear acesso
   - 📝 Editar metadados

### Resetar Senha

**Opção 1: Definir Nova Senha**
1. Clique no usuário
2. Vá em **"User Management"**
3. Clique em **"Send password reset email"**
4. Ou defina nova senha diretamente em **"Change password"**

**Opção 2: Link de Reset**
1. No painel do usuário, copie o **Recovery Token**
2. Envie para o usuário
3. Ele poderá criar nova senha

### Deletar Usuário

⚠️ **ATENÇÃO**: Ao deletar um usuário, todos os seus dados (veículos, gastos, etc.) serão deletados automaticamente devido às políticas de RLS.

1. Clique no usuário
2. Role até o final da página
3. Clique em **"Delete user"**
4. Confirme a ação

## 🔑 Informações para Passar ao Usuário

Após criar o usuário, envie estas informações:

```
📧 Sistema de Gestão de Veículos

Seu acesso foi criado!

URL: http://localhost:5173 (ou URL de produção)
Email: usuario@exemplo.com
Senha: SenhaSegura123!

⚠️ Recomendamos que você altere sua senha no primeiro acesso.

Dúvidas? Entre em contato com o administrador.
```

## 🛡️ Segurança das Senhas

### Senhas Fortes Recomendadas

- ✅ Mínimo 8 caracteres
- ✅ Letras maiúsculas e minúsculas
- ✅ Números
- ✅ Caracteres especiais (@, #, $, etc.)

**Exemplos de senhas fortes:**
- `Veiculo@2025!`
- `SistemA#Forte99`
- `Gest@oVeic2025`

### Configurar Requisitos de Senha

1. Vá em **Authentication** → **Settings**
2. Role até **"Password Requirements"**
3. Configure:
   - Mínimo de caracteres
   - Exigir letras maiúsculas
   - Exigir números
   - Exigir caracteres especiais

## 📝 Criar Múltiplos Usuários

Se você precisa criar vários usuários de uma vez, pode usar a **API do Supabase**:

### Script Node.js (criar-usuarios.js)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUA_SUPABASE_URL';
const supabaseServiceKey = 'SUA_SERVICE_ROLE_KEY_AQUI'; // Service role key (não anon)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const usuarios = [
  { email: 'usuario1@exemplo.com', password: 'Senha@123' },
  { email: 'usuario2@exemplo.com', password: 'Senha@456' },
  { email: 'usuario3@exemplo.com', password: 'Senha@789' }
];

async function criarUsuarios() {
  for (const usuario of usuarios) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: usuario.email,
      password: usuario.password,
      email_confirm: true
    });

    if (error) {
      console.error(`❌ Erro ao criar ${usuario.email}:`, error.message);
    } else {
      console.log(`✅ Usuário criado: ${usuario.email}`);
    }
  }
}

criarUsuarios();
```

**Para executar:**
```bash
node criar-usuarios.js
```

⚠️ **IMPORTANTE**: A `service_role_key` tem acesso total. Nunca exponha ela no frontend!

## 🔍 Verificar Usuários

### Ver Usuários Ativos

1. **Authentication** → **Users**
2. Filtre por:
   - **Status**: Confirmed / Unconfirmed
   - **Last Sign In**: Ordenar por último acesso
   - **Created At**: Ordenar por data de criação

### Buscar Usuário

Use a barra de busca no topo da lista de usuários para encontrar por email.

## 🔄 Logs de Autenticação

Para ver tentativas de login:

1. Vá em **Logs** → **Auth Logs**
2. Você verá:
   - ✅ Logins bem-sucedidos
   - ❌ Tentativas falhadas
   - 🔑 Tokens gerados
   - 🚪 Logouts

## 🎯 Boas Práticas

### ✅ Faça

- ✅ Use emails corporativos ou profissionais
- ✅ Crie senhas fortes para cada usuário
- ✅ Confirme os usuários automaticamente (Auto Confirm)
- ✅ Envie as credenciais por canal seguro
- ✅ Oriente os usuários a trocar a senha no primeiro acesso
- ✅ Mantenha registro de quem tem acesso

### ❌ Evite

- ❌ Usar senhas fracas ou padrões (ex: 123456)
- ❌ Criar usuários com emails inválidos
- ❌ Deixar usuários inativos por muito tempo
- ❌ Compartilhar credenciais entre múltiplos usuários
- ❌ Enviar senhas por email não criptografado

## 🆘 Problemas Comuns

### Usuário não consegue fazer login

**Possíveis causas:**
1. Email ou senha incorretos
2. Usuário não foi confirmado
3. Usuário foi bloqueado

**Solução:**
- Verifique se o usuário está "Confirmed" no painel
- Resete a senha
- Verifique se não está bloqueado

### "Email already registered"

**Causa:** Já existe um usuário com esse email

**Solução:**
- Use outro email
- Ou delete o usuário existente primeiro

### Usuário esqueceu a senha

**Solução:**
1. No painel do Supabase, clique no usuário
2. Clique em **"Send password reset email"**
3. Ou defina uma nova senha manualmente

## 📞 Suporte

**Dúvidas sobre criação de usuários?**
- Documentação Supabase Auth: https://supabase.com/docs/guides/auth
- Support: https://supabase.com/support

---

**Agora você está pronto para gerenciar usuários no Supabase! 👥🔐**
