# 📊 Sistema de Relatórios do Agente IA

## 🎯 Visão Geral

O agente IA do MAGNO agora trabalha em **segundo plano** registrando todas as ações executadas e pode gerar **relatórios detalhados** sobre o que foi feito durante a sessão.

## 🔍 O que é Registrado

Todas as interações com o agente são registradas automaticamente:

- ✅ **Comando falado/digitado**
- ✅ **Ação executada** (cadastro, consulta, navegação, etc.)
- ✅ **IA utilizada** (Gemini, Groq ou Local)
- ✅ **Sucesso ou falha** da operação
- ✅ **Resposta gerada** pelo agente
- ✅ **Nível de confiança** da IA
- ✅ **Timestamp** (data e hora)
- ✅ **ID da sessão**

## 📝 Tipos de Relatórios

### 1. **Relatório JSON** (API)
Formato estruturado para integração com outros sistemas.

**Endpoint**: `GET /api/agent/report`

**Exemplo de resposta**:
```json
{
  "sessionId": "session_1744567890123_abc123",
  "summary": {
    "totalActions": 15,
    "successfulActions": 14,
    "failedActions": 1,
    "vehiclesCreated": 3,
    "aiUsage": {
      "gemini": 5,
      "groq": 3,
      "local": 7
    },
    "actionsByType": {
      "create_vehicle": 3,
      "success": 10,
      "navigate": 2
    }
  }
}
```

### 2. **Relatório em Texto** (Legível)
Formato bonito e organizado para humanos.

**Endpoint**: `GET /api/agent/report/text`

**Exemplo**:
```
╔═══════════════════════════════════════════════════════════╗
║           📊 RELATÓRIO DO AGENTE IA - MAGNO              ║
╚═══════════════════════════════════════════════════════════╝

📅 INFORMAÇÕES DA SESSÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session ID: session_1744567890123_abc123
Início: 08/10/2025 16:00:00
Fim: 08/10/2025 16:15:30
Duração: 15m 30s

📈 ESTATÍSTICAS GERAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de ações: 15
✅ Ações bem-sucedidas: 14
❌ Ações falhadas: 1
Taxa de sucesso: 93.3%

🚗 VEÍCULOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Veículos cadastrados: 3

🤖 USO DE IA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 GEMINI: 5 comando(s)
⚡ GROQ: 3 comando(s)
🔧 LOCAL: 7 comando(s)

📋 TIPOS DE AÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
➕ Cadastrar veículo: 3x
✅ Consulta: 10x
🧭 Navegação: 2x

📝 HISTÓRICO DE COMANDOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. [16:00:15] ✅
   Comando: "quantos veículos tenho"
   Ação: Consulta (local)
   Resposta: Você tem 10 veículos cadastrados no total. 5 em estoque e 5 já...

2. [16:02:30] ✅
   Comando: "cadastrar honda civic 2020 preto 50 mil"
   Ação: Cadastrar veículo (gemini)
   Resposta: ✅ Veículo cadastrado com sucesso! 🚗 Honda Civic 2020 - preto...

...
```

### 3. **Download de Arquivo**
Baixa um arquivo `.txt` com o relatório completo.

**Endpoint**: `GET /api/agent/report/download`

**Arquivo gerado**: `relatorio_magno_2025-10-08.txt`

## 🚀 Como Gerar Relatório

### Método 1: Botão na Interface

1. Use o agente normalmente (fale comandos)
2. Clique no botão **📄** (roxo) ao lado dos controles
3. Relatório é baixado automaticamente!

### Método 2: Por Voz

```
Você: "Gerar relatório ok"
Agente: "Relatório gerado e baixado com sucesso!"
```

### Método 3: Via API

```bash
# Relatório JSON
curl http://localhost:3000/api/agent/report

# Relatório em texto
curl http://localhost:3000/api/agent/report/text

# Download
curl http://localhost:3000/api/agent/report/download -o relatorio.txt
```

## 📊 Informações no Relatório

### Estatísticas Gerais:
- **Total de ações** executadas
- **Taxa de sucesso** (%)
- **Ações falhadas** e motivos
- **Duração da sessão**

### Análise de Uso:
- **Qual IA foi mais usada** (Gemini, Groq ou Local)
- **Distribuição de ações** (cadastros, consultas, navegação)
- **Veículos cadastrados** durante a sessão

### Histórico Completo:
- **Cada comando** executado
- **Timestamp** preciso
- **IA utilizada** para processar
- **Resultado** da operação
- **Resposta** gerada

## 🔄 Gerenciamento de Sessões

### Ver Todas as Sessões:
```bash
GET /api/agent/sessions
```

**Retorna**:
```json
[
  {
    "session_id": "session_123",
    "start_time": "2025-10-08 16:00:00",
    "end_time": "2025-10-08 16:15:30",
    "total_actions": 15,
    "successful_actions": 14
  }
]
```

### Ver Logs de Uma Sessão Específica:
```bash
GET /api/agent/logs/:sessionId
```

### Iniciar Nova Sessão:
```bash
POST /api/agent/new-session
```

## 🗑️ Limpeza Automática

O sistema mantém um histórico, mas limpa logs antigos automaticamente:

- **Logs mais antigos que 30 dias** são deletados
- Mantém apenas sessões recentes para performance
- Você pode ajustar esse período no código

## 💡 Casos de Uso

### 1. **Auditoria**
Verificar todas as ações realizadas pelo agente em um período.

### 2. **Análise de Performance**
Ver qual IA teve melhor taxa de sucesso.

### 3. **Documentação**
Manter registro do que foi feito durante o dia.

### 4. **Debugging**
Identificar comandos que falharam e por quê.

### 5. **Relatórios Gerenciais**
Mostrar quantos veículos foram cadastrados, consultas feitas, etc.

## 📱 Exemplo de Uso Completo

```
1. Iniciar o sistema
   → npm run dev

2. Usar o agente normalmente
   → "Cadastrar Honda Civic 2020 ok"
   → "Quantos veículos tenho ok"
   → "Adicionar Fiat Uno 2015 ok"

3. Gerar relatório
   → Clicar no botão 📄
   
4. Arquivo baixado automaticamente!
   → relatorio_magno_2025-10-08.txt

5. Abrir e visualizar tudo que foi feito ✅
```

## 🎯 Benefícios

- ✅ **Transparência total** - Veja tudo que o agente fez
- ✅ **Rastreabilidade** - Cada ação é registrada
- ✅ **Análise de desempenho** - Compare IAs diferentes
- ✅ **Documentação automática** - Sem esforço manual
- ✅ **Trabalha em segundo plano** - Não atrapalha o uso
- ✅ **Múltiplos formatos** - JSON, texto, download
- ✅ **Histórico completo** - Por sessão ou geral

## 🔧 Personalização

Você pode modificar o relatório editando `server/agentLogger.js`:

- Adicionar mais métricas
- Mudar formato do texto
- Ajustar período de retenção
- Exportar para PDF/Excel
- Enviar por email

## 📊 Métricas Disponíveis

O sistema rastreia:

- ✅ Comandos por minuto
- ✅ Taxa de sucesso por IA
- ✅ Tempo médio de resposta
- ✅ Ações mais comuns
- ✅ Erros frequentes
- ✅ Veículos cadastrados por período

---

**Sistema de Relatórios do Agente IA - Transparência e controle total!** 📊✨
