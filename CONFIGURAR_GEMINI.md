# 🤖 Como Configurar o Google Gemini AI

## 🎯 Por Que Usar Gemini?

✅ **100% GRATUITO** - Não precisa cartão de crédito  
✅ **Mais Inteligente** - Entende linguagem natural perfeitamente  
✅ **Sem Padrões Rígidos** - Fale do jeito que quiser  
✅ **Extração Perfeita** - Identifica dados automaticamente  
✅ **Contexto Completo** - Acessa dados do sistema em tempo real  

---

## 📝 Passo a Passo (5 minutos)

### 1️⃣ Obter API Key do Gemini

1. Acesse: **https://makersuite.google.com/app/apikey**

2. Faça login com sua conta Google

3. Clique em **"Create API Key"** ou **"Get API Key"**

4. Copie a chave (algo como: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX`)

---

### 2️⃣ Configurar no Sistema

**Opção A - Criar arquivo `.env` (Recomendado):**

```bash
# Na pasta raiz do projeto (MAGNO), crie o arquivo .env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Opção B - Variável de ambiente do Windows:**

```powershell
# PowerShell
$env:GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX"
```

---

### 3️⃣ Instalar Dependências

```bash
npm install
```

---

### 4️⃣ Reiniciar Servidor

```bash
npm run dev
```

**Você verá:**
```
🚀 Servidor rodando em http://localhost:3000
🤖 Agente de IA ativado com Gemini AI ✨
```

---

## ✨ Diferenças: Local vs Gemini

### 🔵 Modo Local (Sem API Key)
```
👤: "cadastrar honda civic 2020 por 55000"
🤖: ❌ "Não entendi os dados do veículo"
```

### 🟢 Modo Gemini (Com API Key)
```
👤: "quero adicionar um Honda Civic do ano 2020 que comprei por 55 mil"
🤖: ✅ "Entendi! Cadastrar Honda Civic ano 2020 por R$ 55.000,00. Confirma?"
```

---

## 🎯 Exemplos Com Gemini

### Cadastro Super Natural:

```
👤: "Comprei um Corolla branco 2021 com 30 mil quilômetros 
     por 85 mil reais ontem"

🤖: "Perfeito! Entendi:
     - Marca: Toyota
     - Modelo: Corolla
     - Ano: 2021
     - Cor: Branco
     - KM: 30.000
     - Preço: R$ 85.000,00
     - Data: [data de ontem]
     Confirma? Diga 'ok'"
```

### Gasto Contextual:

```
👤: "Gastei mil e quinhentos na revisão do Civic semana passada"

🤖: "Certo! Vou adicionar:
     - Veículo: Honda Civic
     - Descrição: Revisão
     - Valor: R$ 1.500,00
     - Data: [semana passada]
     Confirma?"
```

### Consultas Complexas:

```
👤: "Quanto lucrei até agora e ainda tenho pra vender?"

🤖: "Analisando seus dados:
     - Lucro líquido: R$ 45.000,00
     - Veículos em estoque: 8
     - Valor investido em estoque: R$ 420.000,00
     
     Você está indo muito bem! 📈"
```

---

## 🔧 Verificar Se Está Funcionando

### Teste 1: Ver nos Logs

Quando iniciar o servidor, deve aparecer:
```
🤖 Processando comando com Gemini AI: [seu comando]
```

Se aparecer:
```
🤖 Processando comando localmente: [seu comando]
```
= API Key não configurada

### Teste 2: Comando Natural

Fale algo bem natural tipo:
```
"Oi! Quantos carros eu tenho cadastrados aí?"
```

**Com Gemini:** Responde perfeitamente  
**Sem Gemini:** Pode não entender

---

## 💰 Limites Gratuitos

- **60 requisições por minuto** (mais que suficiente!)
- **1.500 requisições por dia**
- **Sem custo algum**

Se ultrapassar: Aguarde 1 minuto

---

## 🆚 Alternativa: OpenAI (ChatGPT)

Se preferir usar ChatGPT (pago):

1. Obtenha chave em: https://platform.openai.com/api-keys

2. Configure:
```bash
# .env
OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXX
AI_PROVIDER=openai  # em vez de gemini
```

3. Instale: `npm install openai`

---

## 🐛 Problemas Comuns

### "API Key inválida"

**Causa:** Chave copiada errada

**Solução:**
1. Gere nova chave no Google AI Studio
2. Copie com cuidado (sem espaços)
3. Cole no `.env`
4. Reinicie servidor

---

### "Gemini não responde"

**Causa:** Limite de requisições atingido

**Solução:**
- Aguarde 1 minuto
- Sistema volta a funcionar automaticamente

---

### "Arquivo .env não funciona"

**Verificar:**
```bash
# Windows PowerShell
Get-Content .env
```

Deve mostrar:
```
GEMINI_API_KEY=AIzaSy...
```

Se não aparecer = arquivo não existe ou está em pasta errada

---

## 📊 Monitoramento

### Ver Uso da API:

1. Acesse: https://makersuite.google.com/app/apikey
2. Clique na sua chave
3. Veja estatísticas de uso

---

## 🚀 Melhorias Com Gemini

### Antes (Local):
- ❌ Comandos rígidos
- ❌ Precisa falar exatamente certo
- ❌ Não entende contexto
- ❌ Extração limitada

### Depois (Gemini):
- ✅ Fale naturalmente
- ✅ Entende variações
- ✅ Contexto completo
- ✅ Extração perfeita
- ✅ Conversação real

---

## ✨ Funcionalidades Extras Com Gemini

1. **Correção Automática:**
   ```
   👤: "Adiciona um gasto de duzentos e cinquenta reais"
   🤖: ✅ Entende "R$ 250,00"
   ```

2. **Datas Relativas:**
   ```
   👤: "Comprei ontem"
   🤖: ✅ Calcula a data de ontem
   ```

3. **Valores Por Extenso:**
   ```
   👤: "Cinquenta e cinco mil reais"
   🤖: ✅ Converte para 55.000
   ```

4. **Contexto de Conversa:**
   ```
   👤: "Cadastrar Civic 2020"
   🤖: "Qual o preço?"
   👤: "55 mil"
   🤖: ✅ Associa ao veículo anterior
   ```

---

## 🎯 Começar Agora

1. ✅ Pegar API Key: https://makersuite.google.com/app/apikey
2. ✅ Criar `.env` com a chave
3. ✅ `npm install`
4. ✅ `npm run dev`
5. ✅ Testar: "Oi! Quantos veículos tenho?"

**Sistema pronto com IA de verdade!** 🚀✨
