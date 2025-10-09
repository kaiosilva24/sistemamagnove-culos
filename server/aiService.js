import db from './database.js';

class IntelligentAgent {
  constructor() {
    this.context = {
      conversationHistory: [],
      lastQuery: null,
      userPreferences: {}
    };
  }

  // Processador inteligente de linguagem natural
  async processCommand(userInput, contextData = {}) {
    const input = userInput.toLowerCase().trim();
    
    // Adiciona ao histórico
    this.context.conversationHistory.push({
      role: 'user',
      content: userInput,
      timestamp: new Date()
    });

    // Mantém apenas últimas 10 conversas
    if (this.context.conversationHistory.length > 10) {
      this.context.conversationHistory.shift();
    }

    // Análise inteligente do comando
    const analysis = this.analyzeIntent(input);
    
    // Executa ação baseada na intenção
    const result = await this.executeAction(analysis, contextData);
    
    // Adiciona resposta ao histórico
    this.context.conversationHistory.push({
      role: 'assistant',
      content: result.response,
      timestamp: new Date()
    });

    return result;
  }

  // Análise de intenção com IA local
  analyzeIntent(input) {
    const analysis = {
      intent: 'unknown',
      entities: [],
      confidence: 0,
      parameters: {}
    };

    // Navegação
    if (this.matchPattern(input, ['dashboard', 'painel', 'início', 'inicio', 'home'])) {
      analysis.intent = 'navigate_dashboard';
      analysis.confidence = 0.95;
    }
    else if (this.matchPattern(input, ['veículos', 'veiculos', 'carros', 'lista'])) {
      analysis.intent = 'navigate_vehicles';
      analysis.confidence = 0.95;
    }
    else if (this.matchPattern(input, ['novo', 'adicionar', 'cadastrar', 'registrar']) && 
             this.matchPattern(input, ['veículo', 'veiculo', 'carro'])) {
      analysis.intent = 'navigate_new_vehicle';
      analysis.confidence = 0.9;
    }

    // Consultas numéricas
    else if (this.matchPattern(input, ['quantos', 'quantidade', 'total']) && 
             this.matchPattern(input, ['veículos', 'veiculos', 'carros'])) {
      analysis.intent = 'query_total_vehicles';
      analysis.confidence = 0.9;
    }
    else if (this.matchPattern(input, ['estoque', 'disponíveis', 'disponiveis', 'disponível'])) {
      analysis.intent = 'query_stock';
      analysis.confidence = 0.9;
    }
    else if (this.matchPattern(input, ['vendidos', 'vendas', 'vendi'])) {
      analysis.intent = 'query_sold';
      analysis.confidence = 0.9;
    }

    // Consultas financeiras
    else if (this.matchPattern(input, ['lucro', 'ganho', 'lucrei', 'ganhos', 'lucratividade'])) {
      analysis.intent = 'query_profit';
      analysis.confidence = 0.95;
    }
    else if (this.matchPattern(input, ['investimento', 'investido', 'gastei', 'investi', 'capital'])) {
      analysis.intent = 'query_investment';
      analysis.confidence = 0.9;
    }
    else if (this.matchPattern(input, ['faturamento', 'receita', 'vendas totais', 'arrecadei'])) {
      analysis.intent = 'query_revenue';
      analysis.confidence = 0.9;
    }
    else if (this.matchPattern(input, ['gastos', 'despesas', 'custos', 'gastei em manutenção'])) {
      analysis.intent = 'query_expenses';
      analysis.confidence = 0.9;
    }

    // Relatórios
    else if (this.matchPattern(input, ['relatório', 'relatorio', 'resumo', 'visão geral', 'panorama'])) {
      analysis.intent = 'generate_report';
      analysis.confidence = 0.95;
    }

    // Busca de veículos
    else if (this.matchPattern(input, ['buscar', 'encontrar', 'procurar', 'mostrar', 'ver']) &&
             !this.matchPattern(input, ['dashboard', 'painel'])) {
      analysis.intent = 'search_vehicle';
      analysis.confidence = 0.85;
      analysis.parameters.searchTerm = this.extractSearchTerm(input);
    }

    // Comparações e análises
    else if (this.matchPattern(input, ['melhor', 'pior', 'mais lucrativo', 'menos lucrativo'])) {
      analysis.intent = 'analyze_performance';
      analysis.confidence = 0.85;
      analysis.parameters.metric = this.extractMetric(input);
    }

    // Previsões
    else if (this.matchPattern(input, ['média', 'previsão', 'estimativa', 'tendência'])) {
      analysis.intent = 'calculate_metrics';
      analysis.confidence = 0.8;
    }

    // Ajuda
    else if (this.matchPattern(input, ['ajuda', 'help', 'comandos', 'o que você faz', 'pode fazer'])) {
      analysis.intent = 'help';
      analysis.confidence = 1.0;
    }

    return analysis;
  }

  // Executa ação baseada na intenção
  async executeAction(analysis, contextData) {
    try {
      switch (analysis.intent) {
        case 'navigate_dashboard':
          return {
            action: 'navigate',
            route: '/',
            response: 'Abrindo o dashboard principal',
            confidence: analysis.confidence
          };

        case 'navigate_vehicles':
          return {
            action: 'navigate',
            route: '/veiculos',
            response: 'Mostrando a lista completa de veículos',
            confidence: analysis.confidence
          };

        case 'navigate_new_vehicle':
          return {
            action: 'navigate',
            route: '/novo-veiculo',
            response: 'Abrindo formulário para cadastrar um novo veículo',
            confidence: analysis.confidence
          };

        case 'query_total_vehicles':
          return await this.getTotalVehicles();

        case 'query_stock':
          return await this.getStockInfo();

        case 'query_sold':
          return await this.getSoldInfo();

        case 'query_profit':
          return await this.getProfitInfo();

        case 'query_investment':
          return await this.getInvestmentInfo();

        case 'query_revenue':
          return await this.getRevenueInfo();

        case 'query_expenses':
          return await this.getExpensesInfo();

        case 'generate_report':
          return await this.generateFullReport();

        case 'search_vehicle':
          return await this.searchVehicle(analysis.parameters.searchTerm);

        case 'analyze_performance':
          return await this.analyzePerformance(analysis.parameters.metric);

        case 'calculate_metrics':
          return await this.calculateMetrics();

        case 'help':
          return this.getHelp();

        default:
          return await this.handleUnknownIntent(analysis);
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      return {
        action: 'error',
        response: 'Desculpe, ocorreu um erro ao processar sua solicitação',
        confidence: 0
      };
    }
  }

  // Métodos auxiliares
  matchPattern(input, keywords) {
    return keywords.some(keyword => input.includes(keyword));
  }

  extractSearchTerm(input) {
    // Remove palavras comuns para extrair o termo de busca
    const commonWords = ['buscar', 'encontrar', 'procurar', 'mostrar', 'ver', 'o', 'a', 'de', 'do', 'da'];
    const words = input.split(' ').filter(word => !commonWords.includes(word));
    return words.join(' ');
  }

  extractMetric(input) {
    if (input.includes('lucrativo') || input.includes('lucro')) return 'profit';
    if (input.includes('caro') || input.includes('investimento')) return 'investment';
    if (input.includes('vendido') || input.includes('venda')) return 'sales';
    return 'general';
  }

  // Consultas ao banco de dados
  async getTotalVehicles() {
    const veiculos = db.prepare('SELECT COUNT(*) as total FROM veiculos').get();
    return {
      action: 'data',
      data: veiculos,
      response: `Você tem ${veiculos.total} veículos cadastrados no sistema`,
      confidence: 0.95
    };
  }

  async getStockInfo() {
    const stock = db.prepare('SELECT COUNT(*) as total FROM veiculos WHERE status = ?').get('estoque');
    const percentage = db.prepare(`
      SELECT ROUND((COUNT(CASE WHEN status = 'estoque' THEN 1 END) * 100.0) / COUNT(*), 1) as pct
      FROM veiculos
    `).get();
    
    return {
      action: 'data',
      data: stock,
      response: `Você tem ${stock.total} veículos em estoque, representando ${percentage.pct}% do total`,
      confidence: 0.95
    };
  }

  async getSoldInfo() {
    const sold = db.prepare('SELECT COUNT(*) as total FROM veiculos WHERE status = ?').get('vendido');
    const percentage = db.prepare(`
      SELECT ROUND((COUNT(CASE WHEN status = 'vendido' THEN 1 END) * 100.0) / COUNT(*), 1) as pct
      FROM veiculos
    `).get();
    
    return {
      action: 'data',
      data: sold,
      response: `Você já vendeu ${sold.total} veículos, representando ${percentage.pct}% do total`,
      confidence: 0.95
    };
  }

  async getProfitInfo() {
    const stats = db.prepare(`
      SELECT 
        COALESCE(SUM(preco_venda), 0) as total_vendas,
        COALESCE(SUM(preco_compra), 0) as total_compras
      FROM veiculos WHERE status = 'vendido'
    `).get();
    
    const gastos = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos').get();
    const lucro = stats.total_vendas - stats.total_compras - gastos.total;
    
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(lucro);

    let analysis = '';
    if (lucro > 0) {
      analysis = 'Excelente! Seu negócio está lucrativo';
    } else if (lucro === 0) {
      analysis = 'Você está no ponto de equilíbrio';
    } else {
      analysis = 'Atenção: seu negócio está com prejuízo';
    }

    return {
      action: 'data',
      data: { lucro, stats, gastos },
      response: `Seu lucro líquido atual é de ${formatted}. ${analysis}`,
      confidence: 0.95
    };
  }

  async getInvestmentInfo() {
    const investment = db.prepare('SELECT COALESCE(SUM(preco_compra), 0) as total FROM veiculos').get();
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(investment.total);

    const count = db.prepare('SELECT COUNT(*) as total FROM veiculos').get();
    const average = investment.total / (count.total || 1);
    const avgFormatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(average);

    return {
      action: 'data',
      data: investment,
      response: `Você investiu um total de ${formatted} em veículos, com uma média de ${avgFormatted} por veículo`,
      confidence: 0.95
    };
  }

  async getRevenueInfo() {
    const revenue = db.prepare('SELECT COALESCE(SUM(preco_venda), 0) as total FROM veiculos WHERE status = ?').get('vendido');
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(revenue.total);

    const sold = db.prepare('SELECT COUNT(*) as total FROM veiculos WHERE status = ?').get('vendido');
    
    return {
      action: 'data',
      data: revenue,
      response: `Sua receita total com vendas é de ${formatted}, proveniente de ${sold.total} veículos vendidos`,
      confidence: 0.95
    };
  }

  async getExpensesInfo() {
    const expenses = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos').get();
    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(expenses.total);

    const byCategory = db.prepare(`
      SELECT categoria, COALESCE(SUM(valor), 0) as total 
      FROM gastos 
      GROUP BY categoria 
      ORDER BY total DESC 
      LIMIT 1
    `).get();

    let categoryInfo = '';
    if (byCategory) {
      const catFormatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(byCategory.total);
      categoryInfo = `. A maior categoria de gastos é ${byCategory.categoria} com ${catFormatted}`;
    }

    return {
      action: 'data',
      data: expenses,
      response: `Você teve um total de ${formatted} em gastos com manutenção e serviços${categoryInfo}`,
      confidence: 0.95
    };
  }

  async generateFullReport() {
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
    const lucro = stats.total_vendas - stats.total_investido - gastos.total;

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

    const response = `Relatório completo: Você tem ${stats.total_veiculos} veículos cadastrados. ` +
      `${stats.em_estoque} estão em estoque e ${stats.vendidos} foram vendidos. ` +
      `Investimento total: ${formatCurrency(stats.total_investido)}. ` +
      `Receita de vendas: ${formatCurrency(stats.total_vendas)}. ` +
      `Gastos: ${formatCurrency(gastos.total)}. ` +
      `Lucro líquido: ${formatCurrency(lucro)}`;

    return {
      action: 'data',
      data: { ...stats, gastos: gastos.total, lucro },
      response,
      confidence: 0.95
    };
  }

  async searchVehicle(searchTerm) {
    if (!searchTerm) {
      return {
        action: 'error',
        response: 'Por favor, especifique qual veículo você quer buscar',
        confidence: 0.5
      };
    }

    const veiculos = db.prepare(`
      SELECT * FROM veiculos 
      WHERE LOWER(marca) LIKE ? OR LOWER(modelo) LIKE ? OR LOWER(placa) LIKE ?
    `).all(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);

    if (veiculos.length === 0) {
      return {
        action: 'data',
        data: [],
        response: `Não encontrei nenhum veículo com o termo "${searchTerm}"`,
        confidence: 0.8
      };
    }

    if (veiculos.length === 1) {
      const v = veiculos[0];
      return {
        action: 'navigate',
        route: `/veiculos/${v.id}`,
        data: v,
        response: `Encontrei o ${v.marca} ${v.modelo}, ${v.ano}. Abrindo detalhes`,
        confidence: 0.9
      };
    }

    return {
      action: 'data',
      data: veiculos,
      response: `Encontrei ${veiculos.length} veículos com o termo "${searchTerm}"`,
      confidence: 0.85
    };
  }

  async analyzePerformance(metric) {
    const veiculos = db.prepare(`
      SELECT v.*, 
        COALESCE(SUM(g.valor), 0) as total_gastos,
        CASE 
          WHEN v.preco_venda IS NOT NULL 
          THEN v.preco_venda - v.preco_compra - COALESCE(SUM(g.valor), 0)
          ELSE NULL 
        END as lucro
      FROM veiculos v
      LEFT JOIN gastos g ON v.id = g.veiculo_id
      WHERE v.status = 'vendido'
      GROUP BY v.id
      ORDER BY lucro DESC
    `).all();

    if (veiculos.length === 0) {
      return {
        action: 'data',
        data: [],
        response: 'Você ainda não tem veículos vendidos para analisar',
        confidence: 0.9
      };
    }

    const melhor = veiculos[0];
    const pior = veiculos[veiculos.length - 1];

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);

    const response = `Análise de performance: O veículo mais lucrativo foi o ${melhor.marca} ${melhor.modelo} ` +
      `com lucro de ${formatCurrency(melhor.lucro)}. ` +
      `O menos lucrativo foi o ${pior.marca} ${pior.modelo} com ${formatCurrency(pior.lucro)}`;

    return {
      action: 'data',
      data: { melhor, pior, todos: veiculos },
      response,
      confidence: 0.9
    };
  }

  async calculateMetrics() {
    const stats = db.prepare(`
      SELECT 
        AVG(preco_compra) as media_compra,
        AVG(CASE WHEN preco_venda IS NOT NULL THEN preco_venda END) as media_venda,
        AVG(CASE WHEN preco_venda IS NOT NULL THEN preco_venda - preco_compra END) as media_lucro_bruto
      FROM veiculos
    `).get();

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);

    const response = `Métricas calculadas: Preço médio de compra: ${formatCurrency(stats.media_compra)}. ` +
      `Preço médio de venda: ${formatCurrency(stats.media_venda)}. ` +
      `Lucro bruto médio por venda: ${formatCurrency(stats.media_lucro_bruto)}`;

    return {
      action: 'data',
      data: stats,
      response,
      confidence: 0.9
    };
  }

  getHelp() {
    const response = 'Sou um agente inteligente que pode ajudá-lo a gerenciar seus veículos. ' +
      'Posso: consultar dados de veículos e lucros, navegar pelo sistema, buscar veículos específicos, ' +
      'gerar relatórios, analisar performance e calcular métricas. ' +
      'Experimente dizer: "quantos veículos tenho", "qual o lucro", "buscar Honda", ou "gerar relatório"';

    return {
      action: 'help',
      response,
      confidence: 1.0
    };
  }

  async handleUnknownIntent(analysis) {
    // Tenta fazer uma busca inteligente baseada no contexto
    const response = 'Desculpe, não entendi completamente sua solicitação. ' +
      'Você pode reformular ou dizer "ajuda" para ver o que posso fazer?';

    return {
      action: 'clarify',
      response,
      confidence: 0.3,
      suggestions: [
        'Mostrar dashboard',
        'Quantos veículos tenho?',
        'Qual o lucro?',
        'Gerar relatório'
      ]
    };
  }

  // Limpa o contexto
  clearContext() {
    this.context.conversationHistory = [];
    this.context.lastQuery = null;
  }
}

// Instância singleton
const agent = new IntelligentAgent();

export default agent;
