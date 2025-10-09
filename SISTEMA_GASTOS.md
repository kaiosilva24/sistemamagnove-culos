# 💰 Sistema de Gastos - Guia Completo

## 🎯 Funcionalidade
Adicione gastos aos veículos usando **comandos de voz**!

---

## 📋 Passo a Passo

### 1️⃣ **Criar Tabela no Supabase**

Acesse https://supabase.com/dashboard e execute este SQL:

```sql
CREATE TABLE gastos_veiculos (
    id SERIAL PRIMARY KEY,
    veiculo_id INTEGER NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data_gasto DATE DEFAULT CURRENT_DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_gastos_veiculo ON gastos_veiculos(veiculo_id);
CREATE INDEX idx_gastos_data ON gastos_veiculos(data_gasto);
CREATE INDEX idx_gastos_tipo ON gastos_veiculos(tipo);
```

---

### 2️⃣ **Reiniciar o Servidor**

```powershell
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 🎤 Comandos de Voz

### Formato Básico
> **"[Modelo/Placa] gastei [valor] em [tipo]"**

### Exemplos Práticos

#### 📝 Exemplo 1: Um Gasto
> **"Civic placa ABC1234 gastei 80 reais em peça"**

Resultado:
- Busca o Civic com placa ABC1234
- Adiciona gasto de R$ 80,00 tipo "peça"

#### 📝 Exemplo 2: Múltiplos Gastos
> **"Gol placa XYZ9876 gastei 80 em uma peça, 200 em serviço e 150 em documentação"**

Resultado:
- Adiciona 3 gastos:
  - R$ 80,00 - peça
  - R$ 200,00 - serviço
  - R$ 150,00 - documentação

#### 📝 Exemplo 3: Apenas Modelo
> **"Civic gastei 300 reais em manutenção"**

Resultado:
- Busca qualquer Civic no banco
- Adiciona gasto de R$ 300,00

---

## 🏷️ Tipos de Gastos

- **peça** - Peças e componentes
- **serviço** - Mão de obra
- **documentação** - IPVA, licenciamento, etc
- **manutenção** - Revisões, trocas de óleo
- **outro** - Outros gastos

---

## 📊 Visualizar Gastos

### Via API (para desenvolvedores):
```bash
GET /api/veiculos/:id/gastos
```

Retorna:
```json
{
  "gastos": [
    {
      "id": 1,
      "tipo": "peça",
      "descricao": "peça",
      "valor": 80.00,
      "data_gasto": "2025-10-08"
    }
  ],
  "total": 80.00
}
```

---

## ✅ Teste Completo

1. **Cadastre um veículo**:
   > "Cadastrar Honda Civic 2020 placa ABC1234"

2. **Adicione gastos**:
   > "Civic placa ABC1234 gastei 80 em peça, 200 em serviço e 150 em documentação"

3. **Resposta esperada**:
   ```
   ✅ Gastos adicionados com sucesso!
   
   🚗 Veículo: Honda Civic - ABC1234
   
   💰 Gastos registrados:
      • peça: R$ 80,00 - peça
      • serviço: R$ 200,00 - serviço
      • documentação: R$ 150,00 - documentação
   
   💵 Total: R$ 430,00
   ```

---

## 🔧 Arquivos Modificados

- ✅ `server/supabaseDB.js` - Métodos de gastos
- ✅ `server/hybridAI.js` - Detecção e extração
- ✅ `server/index.supabase.js` - Rotas e processamento
- ✅ `gastos_schema.sql` - Schema do banco

---

## 🚀 Pronto para Usar!

Após executar o SQL no Supabase e reiniciar o servidor, você pode começar a adicionar gastos por voz! 🎉
