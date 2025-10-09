# 🚀 MAGNO v2.0 - Guia Completo de Inicialização

## ✅ O QUE FOI IMPLEMENTADO

### 1. 🧠 Sistema Híbrido de IA
- **Gemini AI** - Para cadastros (interpreta linguagem natural)
- **Groq AI** - Alternativa rápida
- **IA Local** - Fallback e consultas rápidas

### 2. 🎤 Cadastro por Voz com "OK"
- Fale naturalmente e termine com "ok"
- Sistema aguarda confirmação antes de executar
- Exemplo: "Cadastrar Volkswagen Gol 2025 branco 60 mil ok"

### 3. 📊 Sistema de Relatórios
- Registra todas as ações em segundo plano
- Gera relatórios detalhados
- Botão de download no painel

### 4. 🎯 Seletor de IA
- Escolha qual IA usar (Auto, Gemini, Groq, Local)
- Interface visual no header do agente

### 5. ✅ Feedback Visual Completo
- Mostra o que você está falando
- Avisa quando precisa dizer "ok"
- Confirma quando comando é executado

---

## 🔧 CONFIGURAÇÃO DO .env

Seu arquivo `.env` deve conter:

```bash
GEMINI_API_KEY=sua_chave_gemini_aqui
GROQ_API_KEY=sua_chave_groq_aqui
```

---

## 🚀 COMO INICIAR O SISTEMA

### Opção 1: Comando único (Recomendado)
```bash
npm run dev
```

### Opção 2: Separado (se Opção 1 não funcionar)

**Terminal 1 - Backend:**
```bash
node server/index.js
```

**Terminal 2 - Frontend:**
```bash
npm run client
```

### Opção 3: PowerShell Script
```powershell
# Matar processos existentes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force

# Iniciar backend (deixar rodando)
Start-Process powershell -ArgumentList "cd '$PWD'; node server/index.js" -WindowStyle Normal

# Aguardar 3 segundos
Start-Sleep -Seconds 3

# Iniciar frontend
npm run client
```

---

## 🌐 ACESSAR O SISTEMA

Após iniciar, acesse:

```
http://localhost:5173
```

O agente de voz estará no **canto inferior direito** 🎤

---

## 🎤 COMO USAR O CADASTRO POR VOZ

### 1. Clique no microfone 🎤

### 2. Fale seu comando completo:
```
"Cadastrar Volkswagen Gol ano 2025 cor branca valor 60 mil ok"
```

### 3. Aguarde o sistema processar

### 4. Veículo será cadastrado automaticamente!

---

## 📋 EXEMPLOS DE COMANDOS

### Cadastros:
```
✅ "Cadastrar Honda Civic 2020 preto 50 mil ok"
✅ "Adicionar Fiat Uno 2015 branco 35000 ok"
✅ "Novo veículo Toyota Corolla 2022 prata ok"
✅ "Cadastro novo Volkswagen Gol 2025 60 mil ok"
```

### Consultas:
```
✅ "Quantos veículos tenho ok"
✅ "Qual o lucro ok"
✅ "Mostrar estoque ok"
✅ "Listar todos os veículos ok"
```

---

## 🔍 VERIFICAR SE ESTÁ FUNCIONANDO

### 1. Backend rodando?
```bash
curl http://localhost:3000/api/ai/status
```

Deve retornar:
```json
{
  "available": {
    "gemini": true,
    "groq": true,
    "local": true
  }
}
```

### 2. Frontend rodando?
Abra: http://localhost:5173

### 3. Gemini ativo?
No console do servidor deve aparecer:
```
✅ Gemini AI (ativo)
✅ Groq AI (ativo)
```

---

## 🐛 RESOLUÇÃO DE PROBLEMAS

### Problema: "IA usada: none"
**Causa:** Gemini não está sendo detectado

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz
2. Confirme que as chaves têm mais de 20 caracteres
3. Reinicie COMPLETAMENTE o servidor:
```bash
# Matar todos os processos Node
Get-Process -Name node | Stop-Process -Force

# Iniciar novamente
npm run dev
```

### Problema: Porta 3000 em uso
**Solução:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /F /PID [número_do_PID]

# Ou
Get-Process -Name node | Stop-Process -Force
```

### Problema: Cadastro não funciona
**Verificar:**
1. Você falou "ok" no final?
2. Mencionou marca e modelo?
3. Qual IA está selecionada? (deve ser Gemini ou Auto)
4. Veja os logs no console do navegador (F12)

---

## 📊 LOGS E DEBUG

### Ver logs do servidor:
Os logs aparecem no terminal onde você rodou `node server/index.js`

Deve mostrar:
```
🎯 Processando comando: "cadastrar..."
🚗 ✅ CADASTRO DETECTADO
🌟 Tentando Gemini AI...
✅ Sucesso com Gemini AI!
```

### Ver logs do frontend:
Pressione F12 no navegador → Aba Console

Deve mostrar:
```
🎤 Comando recebido: ...
📋 Ação: create_vehicle
🧠 IA usada: gemini
```

---

## 📁 ARQUIVOS IMPORTANTES

```
MAGNO/
├── .env                          # ⚠️ IMPORTANTE - Chaves de API
├── package.json                  # Dependências
├── server/
│   ├── index.js                  # Servidor principal
│   ├── hybridAI.js              # Sistema híbrido de IA
│   ├── smartLocalAI.js          # IA Local
│   ├── geminiService.js         # Integração Gemini
│   ├── groqService.js           # Integração Groq
│   ├── agentLogger.js           # Sistema de logs
│   └── database.js              # SQLite
├── src/
│   ├── components/
│   │   └── VoiceAgent.jsx       # Componente de voz
│   └── App.jsx
└── GUIA_COMPLETO.md             # Este arquivo
```

---

## 🎯 FLUXO COMPLETO DE USO

```
1. Iniciar sistema → npm run dev
2. Abrir navegador → http://localhost:5173
3. Clicar microfone → 🎤
4. Falar comando → "Cadastrar Volkswagen Gol 2025 ok"
5. Sistema processa → Gemini extrai dados
6. Veículo cadastrado → ✅
7. Página atualiza → Lista mostra novo veículo
```

---

## ✨ RECURSOS AVANÇADOS

### Gerar Relatório
Clique no botão 📄 (roxo) no painel do agente

### Trocar IA
Clique no botão com a IA atual (ex: "🤖 Auto") e escolha outra

### Ver Histórico
Acesse: `GET /api/agent/sessions`

---

## 📝 COMANDOS ÚTEIS

```bash
# Instalar dependências
npm install

# Iniciar tudo
npm run dev

# Apenas servidor
npm run server

# Apenas frontend
npm run client

# Limpar e reinstalar
rm -rf node_modules
npm install
```

---

## 🎉 PRONTO!

Agora você tem um sistema completo de gestão de veículos com:
- ✅ Cadastro por voz com IA Gemini
- ✅ Confirmação com "ok"
- ✅ Relatórios automáticos
- ✅ Múltiplas IAs disponíveis
- ✅ Interface moderna e responsiva

**Aproveite o MAGNO v2.0!** 🚗🧠🎤

---

Para suporte, verifique os outros arquivos de documentação:
- `CADASTRO_VOZ.md` - Detalhes do cadastro por voz
- `SISTEMA_HIBRIDO_IA.md` - Arquitetura do sistema de IA
- `RELATORIOS_AGENTE.md` - Sistema de relatórios
- `ATUALIZACAO_V2.md` - Changelog completo
