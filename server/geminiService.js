import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import db from './database.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

class GeminiAIAgent {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    this.conversationHistory = [];
  }

  // Contexto do sistema e dados disponíveis
  getSystemContext() {
    // Pega dados atuais do sistema
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_veiculos,
        SUM(CASE WHEN status = 'estoque' THEN 1 ELSE 0 END) as em_estoque,
        SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendidos,
        COALESCE(SUM(preco_compra), 0) as total_investido,
        COALESCE(SUM(CASE WHEN status = 'vendido' THEN preco_venda ELSE 0 END), 0) as total_vendas
      FROM veiculos
    `).get();

    const veiculos = db.prepare('SELECT marca, modelo, ano, status FROM veiculos LIMIT 10').all();

    return `
CONTEXTO DO SISTEMA:
Você é um assistente inteligente de um sistema de gestão de veículos. 

DADOS ATUAIS:
- Total de veículos: ${stats.total_veiculos}
- Em estoque: ${stats.em_estoque}
- Vendidos: ${stats.vendidos}
- Total investido: R$ ${stats.total_investido.toLocaleString('pt-BR')}
- Total vendas: R$ ${stats.total_vendas.toLocaleString('pt-BR')}

VEÍCULOS CADASTRADOS (últimos):
${veiculos.map(v => `- ${v.marca} ${v.modelo} ${v.ano} (${v.status})`).join('\n')}

FUNÇÕES DISPONÍVEIS:
1. navigate(route) - Navegar para página (/, /veiculos, /novo-veiculo)
2. add_vehicle(data) - Cadastrar novo veículo
3. add_expense(veiculo_id, data) - Adicionar gasto a um veículo
4. query_data(type) - Consultar dados (lucro, estoque, vendas, etc)
5. search_vehicle(termo) - Buscar veículo específico
6. generate_report() - Gerar relatório completo

FORMATO DE RESPOSTA:
Você DEVE responder SEMPRE em JSON com esta estrutura:
{
  "action": "navigate|add_vehicle|add_expense|query|search|report|help|clarify",
  "parameters": {},
  "response": "Texto amigável em português para o usuário",
  "confidence": 0.0-1.0,
  "needs_confirmation": true|false
}

REGRAS:
- Seja conversacional e amigável em português do Brasil
- Para ações importantes (cadastrar, adicionar gastos), sempre marque needs_confirmation: true
- Extraia dados de forma inteligente dos comandos em linguagem natural
- Se não entender, use action: "clarify" e peça esclarecimento
- Sempre retorne JSON válido
`;
  }

  // Processa comando com Gemini
  async processCommand(userCommand) {
    try {
      console.log('🤖 Gemini processando:', userCommand);

      const systemContext = this.getSystemContext();
      
      const prompt = `${systemContext}

COMANDO DO USUÁRIO: "${userCommand}"

Analise o comando e retorne JSON conforme especificado acima.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      // Remove markdown code blocks se houver
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      console.log('📥 Resposta bruta Gemini:', text);

      const aiResponse = JSON.parse(text);

      // Adiciona ao histórico
      this.conversationHistory.push({
        user: userCommand,
        assistant: aiResponse.response,
        timestamp: new Date()
      });

      // Mantém últimas 10 conversas
      if (this.conversationHistory.length > 10) {
        this.conversationHistory.shift();
      }

      // Executa ação se não precisar confirmação
      if (!aiResponse.needs_confirmation) {
        return await this.executeAction(aiResponse);
      }

      return aiResponse;

    } catch (error) {
      console.error('❌ Erro Gemini:', error);
      
      // Fallback para processamento local se Gemini falhar
      return {
        action: 'error',
        response: 'Desculpe, tive um problema ao processar. Pode reformular?',
        confidence: 0,
        error: error.message
      };
    }
  }

  // Executa ação baseada na resposta da IA
  async executeAction(aiResponse) {
    const { action, parameters } = aiResponse;

    switch (action) {
      case 'navigate':
        return {
          ...aiResponse,
          route: parameters.route
        };

      case 'query':
        return await this.handleQuery(parameters.type, aiResponse);

      case 'search':
        return await this.searchVehicle(parameters.search_term, aiResponse);

      case 'report':
        return await this.generateReport(aiResponse);

      case 'add_vehicle':
        // Retorna para aguardar confirmação
        return {
          ...aiResponse,
          needs_confirmation: true,
          pending_data: parameters
        };

      case 'add_expense':
        return {
          ...aiResponse,
          needs_confirmation: true,
          pending_data: parameters
        };

      default:
        return aiResponse;
    }
  }

  // Confirma e executa ação pendente
  async confirmAction(pendingData, actionType) {
    try {
      if (actionType === 'add_vehicle') {
        return await this.addVehicle(pendingData);
      } else if (actionType === 'add_expense') {
        return await this.addExpense(pendingData);
      }
    } catch (error) {
      return {
        action: 'error',
        response: 'Erro ao executar ação: ' + error.message,
        confidence: 0
      };
    }
  }

  // Adiciona veículo
  async addVehicle(data) {
    const stmt = db.prepare(`
      INSERT INTO veiculos (marca, modelo, ano, cor, placa, km, preco_compra, data_compra, observacoes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'estoque')
    `);

    const result = stmt.run(
      data.marca,
      data.modelo,
      data.ano,
      data.cor || null,
      data.placa || null,
      data.km || null,
      data.preco_compra,
      data.data_compra || new Date().toISOString().split('T')[0],
      data.observacoes || 'Cadastrado por voz'
    );

    return {
      action: 'success',
      response: `Veículo ${data.marca} ${data.modelo} cadastrado com sucesso!`,
      confidence: 1.0,
      data: { id: result.lastInsertRowid, ...data }
    };
  }

  // Adiciona gasto
  async addExpense(data) {
    const stmt = db.prepare(`
      INSERT INTO gastos (veiculo_id, descricao, categoria, valor, data)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.veiculo_id,
      data.descricao,
      data.categoria || 'outros',
      data.valor,
      data.data || new Date().toISOString().split('T')[0]
    );

    return {
      action: 'success',
      response: `Gasto de R$ ${data.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} adicionado com sucesso!`,
      confidence: 1.0,
      data: { id: result.lastInsertRowid, ...data }
    };
  }

  // Consultas
  async handleQuery(type, aiResponse) {
    let data;

    switch (type) {
      case 'lucro':
        const stats = db.prepare(`
          SELECT 
            COALESCE(SUM(preco_venda), 0) as vendas,
            COALESCE(SUM(preco_compra), 0) as compras
          FROM veiculos WHERE status = 'vendido'
        `).get();
        const gastos = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos').get();
        data = {
          lucro_liquido: stats.vendas - stats.compras - gastos.total,
          vendas: stats.vendas,
          compras: stats.compras,
          gastos: gastos.total
        };
        break;

      case 'estoque':
        data = db.prepare('SELECT COUNT(*) as total FROM veiculos WHERE status = ?').get('estoque');
        break;

      case 'vendidos':
        data = db.prepare('SELECT COUNT(*) as total FROM veiculos WHERE status = ?').get('vendido');
        break;

      default:
        data = db.prepare(`
          SELECT 
            COUNT(*) as total_veiculos,
            SUM(CASE WHEN status = 'estoque' THEN 1 ELSE 0 END) as em_estoque,
            SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendidos
          FROM veiculos
        `).get();
    }

    return {
      ...aiResponse,
      data
    };
  }

  // Busca veículo
  async searchVehicle(searchTerm, aiResponse) {
    const veiculos = db.prepare(`
      SELECT * FROM veiculos 
      WHERE LOWER(marca) LIKE ? OR LOWER(modelo) LIKE ?
    `).all(`%${searchTerm.toLowerCase()}%`, `%${searchTerm.toLowerCase()}%`);

    return {
      ...aiResponse,
      data: veiculos,
      found: veiculos.length
    };
  }

  // Gera relatório
  async generateReport(aiResponse) {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_veiculos,
        SUM(CASE WHEN status = 'estoque' THEN 1 ELSE 0 END) as em_estoque,
        SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendidos,
        COALESCE(SUM(preco_compra), 0) as total_investido,
        COALESCE(SUM(CASE WHEN status = 'vendido' THEN preco_venda ELSE 0 END), 0) as total_vendas
      FROM veiculos
    `).get();

    const gastos = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos').get();

    return {
      ...aiResponse,
      data: {
        ...stats,
        total_gastos: gastos.total,
        lucro_liquido: stats.total_vendas - stats.total_investido - gastos.total
      }
    };
  }

  // Limpa histórico
  clearHistory() {
    this.conversationHistory = [];
  }
}

// Verifica se tem API key
const hasApiKey = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'dummy-key';

if (!hasApiKey) {
  console.warn('⚠️  GEMINI_API_KEY não configurada. Usando modo local.');
}

const geminiAgent = new GeminiAIAgent();

export { geminiAgent, hasApiKey };
