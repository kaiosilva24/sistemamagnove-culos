# Sistema de Gestão de Veículos 🚗

Sistema completo para gerenciar compra, venda e custos de veículos com cálculo automático de lucro.

## 🔐 Sistema de Autenticação com Supabase

O sistema agora possui **autenticação completa e segura**:

- 🔒 **Login e Cadastro** - Acesso controlado ao sistema
- 👤 **Isolamento de Dados** - Cada usuário vê apenas seus próprios veículos
- 🛡️ **Proteção Total** - Todas as rotas protegidas por autenticação
- ☁️ **Supabase Auth** - Autenticação profissional na nuvem
- 🔑 **Tokens JWT** - Segurança moderna e confiável

**[📖 Guia Rápido de Configuração](./INICIO_RAPIDO_AUTH.md)** | **[📚 Documentação Completa](./AUTENTICACAO.md)**

## ⭐ Agente de IA com Comando de Voz!

Agora você pode controlar todo o sistema usando **comandos de voz com Inteligência Artificial**! 🤖🎤

### 🧠 Inteligência Artificial Avançada
- **Processamento de Linguagem Natural**: Entende frases complexas e contextuais
- **Análise de Intenção**: Identifica automaticamente o que você quer fazer
- **Confiança Adaptativa**: Cada resposta inclui índice de certeza (0-100%)
- **Memória Conversacional**: Mantém contexto das últimas 10 interações
- **Respostas Inteligentes**: Análises, comparações e cálculos automáticos

### 🎤 Comando de Voz Natural
- 🗣️ Fale naturalmente, sem comandos rígidos
- 📊 Consultas financeiras complexas
- 🔍 Busca inteligente de veículos
- 💰 Análises de lucro e performance
- 📈 Relatórios completos por voz
- 🚀 Navegação intuitiva

**[Ver documentação completa da IA](./AGENTE_IA.md)** | **[Lista de comandos](./COMANDOS_DE_VOZ.md)**

## Funcionalidades

### 🔐 Autenticação e Segurança
- ✅ **Login e Cadastro** com Supabase
- ✅ **Isolamento de dados** por usuário
- ✅ **Proteção de rotas** frontend e backend
- ✅ **Sessões persistentes** e seguras

### 🚗 Gestão de Veículos
- ✅ Cadastro de veículos (marca, modelo, ano, placa, etc.)
- ✅ Registro de preço de compra
- ✅ Controle de gastos (serviços, peças, etc.)
- ✅ Registro de venda
- ✅ Cálculo automático de lucro
- ✅ Dashboard com métricas e estatísticas
- ✅ Interface moderna e responsiva

### 🤖 Inteligência Artificial
- 🎤 Controle total por comando de voz
- 🤖 Agente inteligente com respostas em áudio
- 🧠 Processamento de linguagem natural

## Tecnologias

- **Frontend**: React + TailwindCSS + Vite
- **Backend**: Node.js + Express
- **Banco de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth (JWT)
- **IA**: Gemini AI + Groq AI + IA Local
- **UI**: Lucide Icons + TailwindCSS
- **Voz**: Web Speech API (reconhecimento e síntese)

## Como usar

### ⚡ Início Rápido (3 passos)

#### 1️⃣ Configurar Supabase (IMPORTANTE)
Execute o script SQL no painel do Supabase para ativar a autenticação:
- Arquivo: `supabase_auth_config.sql`
- **[Ver instruções detalhadas](./INICIO_RAPIDO_AUTH.md)**

#### 2️⃣ Instalar dependências
```bash
npm install
```

#### 3️⃣ Iniciar o sistema
```bash
npm run dev
```

O sistema estará disponível em:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

### 🔐 Primeiro Acesso

**Criar Usuário (Administrador):**
1. Acesse o painel do Supabase
2. Vá em **Authentication** → **Users** → **Add user**
3. Preencha email e senha → **Create user**
4. **[Ver guia completo](./CRIAR_USUARIOS_SUPABASE.md)**

**Fazer Login (Usuário):**
1. Acesse http://localhost:5173
2. Insira email e senha fornecidos
3. Clique em **"Entrar"**
4. **Pronto!** Você já pode usar o sistema!

### 3. Usar o Agente de Voz 🎤

1. Abra o sistema no navegador (Chrome recomendado)
2. Clique no botão do **microfone** no canto inferior direito
3. Permita o acesso ao microfone quando solicitado
4. Fale um comando (ex: "Quantos veículos?")
5. Ouça a resposta do agente

**Exemplos de comandos naturais:**
- "Quantos carros eu tenho?" *(consulta simples)*
- "Qual o lucro líquido atual?" *(análise financeira)*
- "Mostrar o veículo mais lucrativo" *(análise comparativa)*
- "Me dê um resumo do negócio" *(relatório completo)*
- "Buscar todos os Honda" *(busca inteligente)*

💡 **Dica**: Fale naturalmente! A IA entende contexto e sinônimos.

📖 **[Ver documentação completa da IA](./AGENTE_IA.md)** | **[Todos os comandos](./COMANDOS_DE_VOZ.md)**

## Estrutura

```
MAGNO/
├── server/                          # Backend (API REST)
│   ├── index.supabase.js           # Servidor Express com autenticação
│   ├── authMiddleware.js           # 🔐 Middleware de autenticação
│   ├── supabaseDB.js               # Operações de banco de dados
│   ├── hybridAI.js                 # Sistema híbrido de IA
│   └── aiService.js                # 🤖 Agente de IA Local
├── src/                            # Frontend (React)
│   ├── components/      
│   │   ├── VoiceAgent.jsx          # 🎤 Componente de comando de voz
│   │   └── ProtectedRoute.jsx      # 🔐 Proteção de rotas
│   ├── context/
│   │   └── AuthContext.jsx         # 🔐 Contexto de autenticação
│   ├── lib/
│   │   ├── supabase.js             # Cliente Supabase
│   │   └── api.js                  # Utilitário de requisições
│   ├── pages/           
│   │   ├── Login.jsx               # 🔐 Página de login/cadastro
│   │   ├── Dashboard.jsx           # Dashboard principal
│   │   └── ...                     # Outras páginas
│   └── App.jsx                     # Componente principal
├── supabase_auth_config.sql        # 🔐 Script de configuração SQL
├── INICIO_RAPIDO_AUTH.md           # 🚀 Guia rápido de autenticação
├── AUTENTICACAO.md                 # 📚 Documentação completa de auth
├── AGENTE_IA.md                    # 📚 Documentação do Agente IA
├── COMANDOS_DE_VOZ.md              # 📖 Lista completa de comandos
└── README.md                       # Este arquivo
```

## 📖 Documentação

- 🚀 **[Início Rápido de Autenticação](./INICIO_RAPIDO_AUTH.md)** - Configure em 3 passos
- 👥 **[Criar Usuários no Supabase](./CRIAR_USUARIOS_SUPABASE.md)** - Guia completo
- 🔐 **[Documentação Completa de Auth](./AUTENTICACAO.md)** - Tudo sobre autenticação
- 🤖 **[Agente de IA](./AGENTE_IA.md)** - Como usar a IA
- 🎤 **[Comandos de Voz](./COMANDOS_DE_VOZ.md)** - Lista completa de comandos
- 📊 **[Guia Completo](./GUIA_COMPLETO.md)** - Documentação geral do sistema

## Exemplo de Uso

1. **Fazer login** no sistema
2. **Cadastrar um veículo** com preço de compra (ex: R$ 55.000)
3. **Adicionar gastos** (serviços, peças) (ex: R$ 10.000)
4. **Registrar a venda** (ex: R$ 75.000)
5. O sistema calcula automaticamente o **lucro** (R$ 10.000)
6. Seus dados ficam isolados e seguros! 🔒

## 🔒 Segurança

- ✅ Autenticação JWT com Supabase
- ✅ Row Level Security (RLS) no banco de dados
- ✅ Isolamento completo de dados por usuário
- ✅ Todas as rotas protegidas
- ✅ Senhas criptografadas (bcrypt)
- ✅ Tokens com expiração automática

## 🙋 Suporte

**Problemas com autenticação?** Leia: [INICIO_RAPIDO_AUTH.md](./INICIO_RAPIDO_AUTH.md)

**Dúvidas sobre o sistema?** Leia: [GUIA_COMPLETO.md](./GUIA_COMPLETO.md)

---

**Desenvolvido com ❤️ usando React, Node.js, Supabase e Inteligência Artificial**
