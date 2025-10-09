# Sistema Genérico de Extração de Gastos

## 📋 Resumo
Sistema **100% genérico** que aceita **QUALQUER tipo de gasto** de veículos, sem necessidade de listas pré-definidas.

## ✅ Problema Resolvido
**Antes:** Apenas tipos específicos na lista eram reconhecidos (câmbio, motor, pneu, etc)  
**Depois:** Sistema aceita QUALQUER palavra como tipo de gasto (roda, volante, turbina, parabrisa, sensor, etc)

## 🔧 Mudanças Implementadas

### Arquivo: `api/ai/process.js`

#### 1. **Padrão Genérico com Unicode**
- Usa `\p{L}` (Unicode Letter) para capturar **qualquer letra** (incluindo acentuadas)
- Suporta hífens: ar-condicionado, para-choque, etc

#### 2. **Três Formatos de Entrada**

**Formato 1:** `[TIPO] r$ [VALOR]`
```
câmbio r$ 200
transmissão r$ 1500
turbina r$ 3000
```

**Formato 2:** `[TIPO] [VALOR]`
```
motor 200 roda 800 volante 350
parabrisa 450 sensor 280
```

**Formato 3:** `[VALOR] em/na/no [TIPO]`
```
500 em embreagem
300 na bomba
200 no radiador
```

#### 3. **Filtros Inteligentes**
- ✅ Ignora palavras de comando (adicionar, gasto, placa, etc)
- ✅ Não captura número da placa como gasto
- ✅ Aceita valores de 10 a 99.999
- ✅ Evita duplicatas automáticas

## 🧪 Testes Realizados

**8/8 testes passaram com sucesso:**

1. ✅ Gastos comuns (câmbio, motor, roda)
2. ✅ Peças menos comuns (volante, turbina, escapamento)
3. ✅ Com valores monetários (transmissão r$ 1500)
4. ✅ Formato inverso (500 em embreagem)
5. ✅ Peças específicas (parabrisa, retrovisor, farol)
6. ✅ Mix de formatos
7. ✅ Componentes eletrônicos (sensor, módulo, chicote)
8. ✅ Peças diversas (pastilha, disco, amortecedor, mola)

## 📝 Exemplos de Comandos Válidos

```
✅ "placa abcd1234 câmbio 200 motor 200 roda 800"
✅ "placa xyz123 volante 350 turbina 2500 escapamento 800"
✅ "placa abc123 transmissão r$ 1500 radiador r$ 600"
✅ "placa test123 500 em embreagem 300 na bomba"
✅ "placa qwe456 parabrisa 450 retrovisor 180 farol 220"
✅ "placa xyz789 sensor 280 módulo 950 chicote 320"
✅ "placa abc123 correia 150 alternador r$ 800 400 em bateria"
✅ "placa test456 pastilha 190 disco 340 amortecedor 560 mola 210"
```

## 🎯 Tipos de Gastos Aceitos

**Literalmente QUALQUER palavra em português**, incluindo:

- ✅ Peças comuns: câmbio, motor, pneu, roda, bateria, freio
- ✅ Eletrônica: sensor, módulo, chicote, central, computador
- ✅ Suspensão: amortecedor, mola, barra, braço
- ✅ Transmissão: embreagem, disco, platô, volante
- ✅ Motor: pistão, biela, comando, correia, bomba
- ✅ Carroceria: parabrisa, farol, lanterna, retrovisor, para-choque
- ✅ Serviços: pintura, funilaria, alinhamento, balanceamento
- ✅ Documentação: transferência, IPVA, licenciamento, seguro
- ✅ **E qualquer outra palavra que você inventar!**

## 💡 Vantagens

1. **Flexibilidade Total:** Não precisa atualizar código para novos tipos
2. **Suporta Acentos:** transmissão, suspensão, óleo, bateria
3. **Múltiplos Formatos:** r$, valores diretos, preposições
4. **Múltiplos Gastos:** Adiciona vários gastos em um único comando
5. **Robusto:** Não confunde placa com gasto

## 🚀 Data da Implementação
09/10/2025 - Sistema 100% funcional e testado
