# 🚀 Guia Rápido - Sistema com Agente IA

## ⚡ Instalação Rápida (3 passos)

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Iniciar o Sistema
```bash
npm run dev
```

### 3️⃣ Acessar
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000

---

## 🎤 Usar o Agente de Voz IA

### Primeira Vez
1. Abra http://localhost:5173 no **Chrome** (recomendado)
2. Clique no **ícone do microfone** (🎤) no canto inferior direito
3. **Permita** acesso ao microfone quando solicitado
4. Clique no botão azul para ativar
5. **Fale** seu comando

### Exemplos para Testar

**Consulta Simples:**
```
👤 "Quantos veículos eu tenho?"
🤖 "Você tem X veículos cadastrados no sistema"
```

**Análise Financeira:**
```
👤 "Qual o meu lucro?"
🤖 "Seu lucro líquido atual é de R$ X.XXX,XX"
```

**Navegação:**
```
👤 "Mostrar dashboard"
🤖 "Abrindo o dashboard principal" [navega automaticamente]
```

**Relatório Completo:**
```
👤 "Me dê um resumo"
🤖 "Relatório completo: Você tem X veículos..." [relatório detalhado]
```

---

## 🎯 Principais Comandos

### 📊 Consultas
- "Quantos veículos tenho?"
- "Quantos em estoque?"
- "Quantos foram vendidos?"

### 💰 Financeiro
- "Qual o lucro?"
- "Quanto investido?"
- "Qual o faturamento?"
- "Total de gastos"

### 🔍 Busca
- "Buscar Honda Civic"
- "Mostrar Toyota"
- "Procurar Fiat Uno"

### 📈 Análises
- "Qual foi o veículo mais lucrativo?"
- "Análise de performance"
- "Calcular métricas"

### 🧭 Navegação
- "Mostrar dashboard"
- "Lista de veículos"
- "Novo veículo"

---

## 🎨 Interface do Agente

### Indicadores Visuais

**🧠 Ícone IA Pulsante**
- Indica que o agente está ativo

**📊 Barra de Confiança**
- Mostra certeza da resposta (0-100%)
- Verde: Alta confiança
- Amarelo: Média confiança
- Vermelho: Baixa confiança

**⚙️ Status de Processamento**
- Mostra a intenção detectada
- Feedback em tempo real

**💬 Áreas de Resposta**
- Azul: Sua fala (transcrição)
- Amarelo: IA processando
- Verde: Resposta da IA

### Botões de Controle

**🎤 Botão Azul (Microfone)**
- Clique para começar a ouvir
- Fica vermelho quando está gravando
- Clique novamente para parar

**🔊 Botão Verde (Alto-falante)**
- Liga/desliga respostas de voz
- Verde: Voz ativa
- Cinza: Voz desativada

---

## 💡 Dicas de Uso

### ✅ Faça
- ✅ Fale naturalmente, como com uma pessoa
- ✅ Use frases completas
- ✅ Seja específico no que quer
- ✅ Verifique o índice de confiança
- ✅ Use sinônimos (o agente entende)

### ❌ Evite
- ❌ Comandos muito curtos e ambíguos
- ❌ Falar muito rápido
- ❌ Ruído de fundo excessivo
- ❌ Usar comandos em outros idiomas

---

## 🔧 Resolução de Problemas

### "Microfone não funciona"
1. Verifique permissões do navegador
2. Use Chrome, Edge ou Safari
3. Teste o microfone em outras aplicações

### "IA não entende os comandos"
1. Fale mais claramente
2. Use frases completas
3. Reformule o comando
4. Veja a lista de comandos em `COMANDOS_DE_VOZ.md`

### "Resposta sem confiança"
1. O comando pode ser ambíguo
2. Tente ser mais específico
3. Use palavras-chave (lucro, estoque, buscar, etc.)

### "Sistema não responde"
1. Verifique se backend está rodando (porta 3000)
2. Veja o console do navegador (F12)
3. Reinicie o sistema com `npm run dev`

---

## 📚 Documentação Completa

- **[AGENTE_IA.md](./AGENTE_IA.md)** - Documentação completa da IA
- **[COMANDOS_DE_VOZ.md](./COMANDOS_DE_VOZ.md)** - Lista de todos os comandos
- **[README.md](./README.md)** - Visão geral do sistema

---

## 🎓 Exemplos Avançados

### Análise Contextual
```
👤 "Como está meu negócio?"
🤖 [Análise completa com múltiplas métricas]
```

### Comparação
```
👤 "Qual foi o melhor negócio?"
🤖 [Compara todos os veículos e mostra o mais lucrativo]
```

### Busca Inteligente
```
👤 "Mostrar todos os Honda"
🤖 [Lista todos os veículos da marca Honda]
```

### Navegação Contextual
```
👤 "Buscar Honda Civic"
🤖 "Encontrei o Honda Civic 2020. Abrindo detalhes"
[Navega automaticamente para a página do veículo]
```

---

## 🚀 Próximos Passos

Depois de dominar o básico:

1. **Explore comandos avançados** em `AGENTE_IA.md`
2. **Cadastre alguns veículos** para testar análises
3. **Experimente consultas complexas**
4. **Use o agente para navegação rápida**
5. **Gere relatórios por voz**

---

**Desenvolvido com 🤖 IA + 🎤 Voz**
