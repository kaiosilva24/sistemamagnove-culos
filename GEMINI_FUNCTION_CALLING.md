# 🚀 Gemini Function Calling - IA que Executa Ações Reais

## 🎯 O Que é Function Calling?

O **Gemini Function Calling** permite que a IA **execute ações diretamente no sistema**:

✅ **Cadastrar veículos** - IA adiciona ao banco de dados  
✅ **Adicionar gastos** - IA registra despesas  
✅ **Marcar vendidos** - IA atualiza status  
✅ **Atualizar dados** - IA modifica informações  
✅ **Deletar veículos** - IA remove do sistema  
✅ **Consultar tudo** - IA acessa dados em tempo real  

---

## 🆚 Diferença: Gemini Simples vs Function Calling

### Gemini Simples (geminiService.js)
```
👤: "Cadastrar Honda Civic 2020 por 55 mil"
🤖: "Entendi! Você quer cadastrar um Honda Civic..."
❌ NÃO EXECUTA - Só entende
```

### Gemini Function Calling (geminiWithFunctions.js) 
```
👤: "Cadastrar Honda Civic 2020 por 55 mil"
🤖: "Vou cadastrar. Confirma?"
👤: "ok"
🤖: "Veículo Honda Civic cadastrado com ID 15!"
✅ EXECUTOU - Salvou no banco de dados!
```

---

## 🔧 Funções Disponíveis

### 1. **listar_veiculos**
Lista todos os veículos ou filtra por status

**Exemplos:**
```
"Mostrar todos os veículos"
"Listar carros em estoque"
"Quais veículos foram vendidos?"
```

---

### 2. **cadastrar_veiculo**
Cadastra novo veículo no sistema

**Parâmetros:**
- marca (obrigatório)
- modelo (obrigatório)
- preco_compra (obrigatório)
- ano, cor, placa, km, observacoes (opcionais)

**Exemplos:**
```
"Cadastrar um Honda Civic 2020 prata por 55 mil reais"
"Adicionar Toyota Corolla 2021 branco 30 mil km valor 85 mil"
"Novo veículo Fiat Uno 2015 vermelho placa ABC1234 por 35 mil"
```

---

### 3. **adicionar_gasto**
Adiciona gasto a um veículo

**Parâmetros:**
- veiculo_identificador (marca, modelo ou ID)
- valor (obrigatório)
- descricao, categoria (opcionais)

**Exemplos:**
```
"Adicionar gasto de 1500 reais no Civic para revisão"
"Registrar despesa de 800 no Corolla com troca de pneus"
"Gastei 3500 com pintura no veículo 15"
```

---

### 4. **marcar_vendido**
Marca veículo como vendido

**Parâmetros:**
- veiculo_identificador
- preco_venda (obrigatório)
- data_venda (opcional)

**Exemplos:**
```
"Vendi o Civic por 62 mil reais"
"Marcar Corolla como vendido por 95 mil"
"O veículo 15 foi vendido por 48 mil ontem"
```

---

### 5. **atualizar_veiculo**
Atualiza informações do veículo

**Campos permitidos:** km, cor, placa, observacoes

**Exemplos:**
```
"Atualizar km do Civic para 55000"
"Mudar cor do Corolla para preto"
"Alterar placa do veículo 15 para XYZ9876"
```

---

### 6. **consultar_lucro**
Consulta lucro total ou de veículo específico

**Exemplos:**
```
"Qual o lucro total?"
"Quanto lucrei com o Civic?"
"Mostrar lucro líquido do negócio"
```

---

### 7. **consultar_estatisticas**
Consulta estatísticas gerais

**Tipos:** geral, financeiro, vendas, estoque

**Exemplos:**
```
"Mostrar estatísticas gerais"
"Dados financeiros do negócio"
"Quantos veículos tenho?"
```

---

### 8. **buscar_veiculo**
Busca veículos por qualquer termo

**Exemplos:**
```
"Buscar todos os Honda"
"Procurar veículos vermelhos"
"Encontrar placa ABC1234"
```

---

### 9. **deletar_veiculo**
Remove veículo do sistema

**⚠️ CUIDADO:** Ação irreversível!

**Exemplos:**
```
"Deletar o Civic"
"Remover veículo 15"
"Apagar o Fiat Uno do sistema"
```

---

## 🎯 Como Funciona

### Fluxo de Execução:

```
1. Você fala: "Cadastrar Honda Civic 2020 por 55 mil"
   
2. Gemini analisa e identifica:
   - Função: cadastrar_veiculo
   - Argumentos: {marca: "Honda", modelo: "Civic", ano: 2020, preco_compra: 55000}
   - Precisa confirmação: SIM
   
3. Sistema retorna:
   "Entendi que você quer cadastrar veículo. Confirma? Diga 'ok'"
   
4. Você confirma: "ok"
   
5. Sistema executa:
   - INSERT INTO veiculos (...)
   - Salva no banco de dados
   
6. Gemini responde:
   "Veículo Honda Civic cadastrado com sucesso com ID 15!"
```

---

## 💬 Exemplos de Conversação Completa

### Exemplo 1: Gerenciamento Completo

```
👤: "Cadastrar Honda Civic 2020 prata por 55 mil"
🤖: "Vou cadastrar Honda Civic 2020 por R$ 55.000,00. Confirma?"
👤: "ok"
🤖: "Veículo Honda Civic cadastrado com ID 15!"

👤: "Adicionar gasto de 1500 no Civic para revisão"
🤖: "Vou adicionar gasto de R$ 1.500,00 no Honda Civic. Confirma?"
👤: "sim"
🤖: "Gasto de R$ 1.500,00 adicionado ao Honda Civic!"

👤: "Atualizar km do Civic para 52000"
🤖: "Vou atualizar a quilometragem. Confirma?"
👤: "ok"
🤖: "Quilometragem do Honda Civic atualizada para 52.000 km!"

👤: "Vendi o Civic por 62 mil"
🤖: "Vou marcar como vendido por R$ 62.000,00. Confirma?"
👤: "confirmar"
🤖: "Honda Civic marcado como vendido! Lucro bruto: R$ 7.000,00"

👤: "Qual foi meu lucro com esse carro?"
🤖: "No Honda Civic você teve:
     - Preço de venda: R$ 62.000,00
     - Preço de compra: R$ 55.000,00
     - Gastos: R$ 1.500,00
     - Lucro líquido: R$ 5.500,00"
```

### Exemplo 2: Análise e Decisão

```
👤: "Quais carros eu tenho em estoque?"
🤖: "Você tem 8 veículos em estoque:
     1. Honda Civic 2020 - R$ 55.000,00
     2. Toyota Corolla 2021 - R$ 85.000,00
     ..."

👤: "Quanto gastei no total com o Corolla?"
🤖: "Consultando... No Toyota Corolla você gastou R$ 2.300,00 em:
     - Revisão: R$ 1.500,00
     - Pneus: R$ 800,00"

👤: "Se eu vender por 95 mil, quanto vou lucrar?"
🤖: "Vamos calcular:
     - Preço de venda: R$ 95.000,00
     - Preço de compra: R$ 85.000,00
     - Gastos: R$ 2.300,00
     - Lucro estimado: R$ 7.700,00"
```

---

## 🔐 Segurança e Confirmações

### Ações que SEMPRE pedem confirmação:

✅ Cadastrar veículo  
✅ Adicionar gasto  
✅ Marcar vendido  
✅ Atualizar dados  
✅ Deletar veículo  

### Ações que NÃO pedem confirmação:

❌ Listar veículos  
❌ Buscar  
❌ Consultar lucro  
❌ Consultar estatísticas  

### Como confirmar:

```
"ok"
"sim"
"confirmar"
"confirma"
"pode fazer"
```

### Como cancelar:

```
"cancelar"
"não"
"nao"
"para"
```

---

## 🧠 Inteligência Contextual

O Gemini entende contexto e sinônimos:

### Valores por Extenso:
```
"cinquenta e cinco mil" → R$ 55.000,00
"mil e quinhentos" → R$ 1.500,00
```

### Datas Relativas:
```
"ontem" → calcula data de ontem
"semana passada" → calcula data
```

### Referências:
```
👤: "Cadastrar Civic 2020"
🤖: "Qual o preço?"
👤: "55 mil"  ← Gemini associa ao veículo anterior
```

---

## ⚙️ Configuração

1. **Obter API Key:**
   https://makersuite.google.com/app/apikey

2. **Configurar `.env`:**
   ```
   GEMINI_API_KEY=sua_chave_aqui
   ```

3. **Instalar:**
   ```bash
   npm install
   ```

4. **Iniciar:**
   ```bash
   npm run dev
   ```

---

## 📊 Logs do Sistema

O sistema mostra em tempo real:

```bash
🤖 Gemini (Function Calling) processando: "Cadastrar Civic 2020 por 55 mil"
📥 Gemini respondeu: {"function":"cadastrar_veiculo",...}
🔧 Executando função: cadastrar_veiculo {...}
✅ Resposta gerada: {...}
```

---

## 🎯 Diferencial do Function Calling

### Antes (IA Tradicional):
```
👤: "Cadastrar um carro"
🤖: "Ok, vou cadastrar"
❌ Não faz nada - só texto
```

### Agora (Function Calling):
```
👤: "Cadastrar Honda Civic"
🤖: "Vou cadastrar. Confirma?"
👤: "ok"
✅ EXECUTA - Salva no banco!
🤖: "Veículo cadastrado com ID 15!"
```

---

## 🚀 Casos de Uso Avançados

### 1. Gerenciamento Rápido
```
"Cadastrar 3 veículos: Civic 2020 55 mil, Corolla 2021 85 mil, Uno 2015 35 mil"
```

### 2. Análise Completa
```
"Me mostre todos os dados do Civic, quanto gastei, quanto posso lucrar se vender por 65 mil"
```

### 3. Decisão Baseada em Dados
```
"Qual veículo devo vender primeiro baseado no lucro potencial?"
```

### 4. Auditoria
```
"Liste todos os gastos deste mês e me diga o total"
```

---

## 📚 Documentação Técnica

### Estrutura de Resposta:

```json
{
  "action": "success|pending|clarify|error",
  "response": "Texto amigável",
  "confidence": 0.95,
  "data": {...},
  "needs_confirmation": true|false
}
```

### Endpoints API:

- `POST /api/ai/process` - Processar comando
- `POST /api/ai/confirm` - Confirmar ação pendente
- `POST /api/ai/cancel` - Cancelar ação pendente

---

## ✨ Conclusão

Com **Gemini Function Calling**, você tem:

✅ IA que **realmente faz** ao invés de só falar  
✅ **Segurança** com confirmações  
✅ **Flexibilidade** total nos comandos  
✅ **Contexto** completo do sistema  
✅ **Execução** direta no banco de dados  

**Seu sistema agora tem um assistente de verdade!** 🚀🤖
