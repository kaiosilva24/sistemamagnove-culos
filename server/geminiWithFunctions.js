import { GoogleGenerativeAI } from '@google/generative-ai';
import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env manualmente
let GEMINI_API_KEY = 'dummy-key';
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) {
      GEMINI_API_KEY = match[1].trim();
      console.log('✅ API Key do Gemini carregada');
    }
  }
} catch (error) {
  console.warn('⚠️  Não foi possível carregar .env:', error.message);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ========== DEFINIÇÃO DAS FUNÇÕES QUE O GEMINI PODE CHAMAR ==========

const functions = {
  // Listar veículos
  listar_veiculos: {
    description: "Lista todos os veículos cadastrados no sistema ou filtra por status",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["estoque", "vendido", "todos"],
          description: "Filtrar por status do veículo"
        }
      }
    }
  },

  // Cadastrar veículo
  cadastrar_veiculo: {
    description: "Cadastra um novo veículo no sistema",
    parameters: {
      type: "object",
      properties: {
        marca: { type: "string", description: "Marca do veículo (ex: Honda, Toyota)" },
        modelo: { type: "string", description: "Modelo do veículo (ex: Civic, Corolla)" },
        ano: { type: "integer", description: "Ano de fabricação" },
        cor: { type: "string", description: "Cor do veículo" },
        placa: { type: "string", description: "Placa do veículo" },
        km: { type: "integer", description: "Quilometragem atual" },
        preco_compra: { type: "number", description: "Preço de compra em reais" },
        observacoes: { type: "string", description: "Observações adicionais" }
      },
      required: ["marca", "modelo", "preco_compra"]
    }
  },

  // Adicionar gasto
  adicionar_gasto: {
    description: "Adiciona um gasto a um veículo específico",
    parameters: {
      type: "object",
      properties: {
        veiculo_identificador: { 
          type: "string", 
          description: "Marca, modelo ou ID do veículo" 
        },
        descricao: { type: "string", description: "Descrição do gasto" },
        categoria: { 
          type: "string", 
          enum: ["manutenção", "peças", "documentação", "estética", "outros"],
          description: "Categoria do gasto"
        },
        valor: { type: "number", description: "Valor do gasto em reais" }
      },
      required: ["veiculo_identificador", "valor"]
    }
  },

  // Marcar como vendido
  marcar_vendido: {
    description: "Marca um veículo como vendido e registra o preço de venda",
    parameters: {
      type: "object",
      properties: {
        veiculo_identificador: { 
          type: "string", 
          description: "Marca, modelo ou ID do veículo" 
        },
        preco_venda: { type: "number", description: "Preço de venda em reais" },
        data_venda: { type: "string", description: "Data da venda (YYYY-MM-DD)" }
      },
      required: ["veiculo_identificador", "preco_venda"]
    }
  },

  // Atualizar veículo
  atualizar_veiculo: {
    description: "Atualiza informações de um veículo",
    parameters: {
      type: "object",
      properties: {
        veiculo_identificador: { 
          type: "string", 
          description: "Marca, modelo ou ID do veículo" 
        },
        campo: { 
          type: "string", 
          description: "Campo a atualizar: km, cor, placa, observacoes" 
        },
        valor: { type: "string", description: "Novo valor" }
      },
      required: ["veiculo_identificador", "campo", "valor"]
    }
  },

  // Consultar lucro
  consultar_lucro: {
    description: "Consulta o lucro líquido do negócio ou de um veículo específico",
    parameters: {
      type: "object",
      properties: {
        veiculo_identificador: { 
          type: "string", 
          description: "Marca, modelo ou ID do veículo (opcional, vazio = total)" 
        }
      }
    }
  },

  // Consultar estatísticas
  consultar_estatisticas: {
    description: "Consulta estatísticas gerais do sistema",
    parameters: {
      type: "object",
      properties: {
        tipo: {
          type: "string",
          enum: ["geral", "financeiro", "vendas", "estoque"],
          description: "Tipo de estatística desejada"
        }
      }
    }
  },

  // Buscar veículo
  buscar_veiculo: {
    description: "Busca veículos por marca, modelo, placa ou características",
    parameters: {
      type: "object",
      properties: {
        termo_busca: { type: "string", description: "Termo para buscar" }
      },
      required: ["termo_busca"]
    }
  },

  // Deletar veículo
  deletar_veiculo: {
    description: "Remove um veículo do sistema (use com cautela)",
    parameters: {
      type: "object",
      properties: {
        veiculo_identificador: { 
          type: "string", 
          description: "Marca, modelo ou ID do veículo" 
        }
      },
      required: ["veiculo_identificador"]
    }
  }
};

// ========== IMPLEMENTAÇÃO DAS FUNÇÕES ==========

class GeminiWithFunctions {
  constructor() {
    this.model = genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });
    this.chat = null;
    this.pendingAction = null;
  }

  // Busca veículo por identificador (ID, marca, modelo, placa)
  findVehicle(identificador) {
    // Tenta primeiro como ID
    if (!isNaN(identificador)) {
      const veiculo = db.prepare('SELECT * FROM veiculos WHERE id = ?').get(identificador);
      if (veiculo) return veiculo;
    }

    // Busca por marca, modelo ou placa
    const veiculos = db.prepare(`
      SELECT * FROM veiculos 
      WHERE LOWER(marca) LIKE ? OR LOWER(modelo) LIKE ? OR LOWER(placa) LIKE ?
      LIMIT 1
    `).all(`%${identificador.toLowerCase()}%`, `%${identificador.toLowerCase()}%`, `%${identificador.toLowerCase()}%`);

    return veiculos[0] || null;
  }

  // Executa função chamada pelo Gemini
  async executeFunction(functionName, args) {
    console.log(`🔧 Executando função: ${functionName}`, args);

    try {
      switch (functionName) {
        case 'listar_veiculos':
          return this.listarVeiculos(args.status || 'todos');

        case 'cadastrar_veiculo':
          return this.cadastrarVeiculo(args);

        case 'adicionar_gasto':
          return this.adicionarGasto(args);

        case 'marcar_vendido':
          return this.marcarVendido(args);

        case 'atualizar_veiculo':
          return this.atualizarVeiculo(args);

        case 'consultar_lucro':
          return this.consultarLucro(args.veiculo_identificador);

        case 'consultar_estatisticas':
          return this.consultarEstatisticas(args.tipo || 'geral');

        case 'buscar_veiculo':
          return this.buscarVeiculo(args.termo_busca);

        case 'deletar_veiculo':
          return this.deletarVeiculo(args.veiculo_identificador);

        default:
          return { erro: 'Função não encontrada' };
      }
    } catch (error) {
      console.error(`Erro ao executar ${functionName}:`, error);
      return { erro: error.message };
    }
  }

  // ========== IMPLEMENTAÇÕES ==========

  listarVeiculos(status) {
    let query = 'SELECT * FROM veiculos';
    let params = [];

    if (status !== 'todos') {
      query += ' WHERE status = ?';
      params.push(status);
    }

    const veiculos = db.prepare(query).all(...params);
    return { veiculos, total: veiculos.length };
  }

  cadastrarVeiculo(dados) {
    const stmt = db.prepare(`
      INSERT INTO veiculos (marca, modelo, ano, cor, placa, km, preco_compra, data_compra, observacoes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'estoque')
    `);

    const result = stmt.run(
      dados.marca,
      dados.modelo,
      dados.ano || null,
      dados.cor || null,
      dados.placa || null,
      dados.km || null,
      dados.preco_compra,
      new Date().toISOString().split('T')[0],
      dados.observacoes || 'Cadastrado via IA'
    );

    return {
      sucesso: true,
      veiculo_id: result.lastInsertRowid,
      mensagem: `Veículo ${dados.marca} ${dados.modelo} cadastrado com ID ${result.lastInsertRowid}`
    };
  }

  adicionarGasto(dados) {
    const veiculo = this.findVehicle(dados.veiculo_identificador);
    
    if (!veiculo) {
      return { erro: `Veículo "${dados.veiculo_identificador}" não encontrado` };
    }

    const stmt = db.prepare(`
      INSERT INTO gastos (veiculo_id, descricao, categoria, valor, data)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      veiculo.id,
      dados.descricao || 'Gasto registrado via IA',
      dados.categoria || 'outros',
      dados.valor,
      new Date().toISOString().split('T')[0]
    );

    return {
      sucesso: true,
      gasto_id: result.lastInsertRowid,
      veiculo: `${veiculo.marca} ${veiculo.modelo}`,
      mensagem: `Gasto de R$ ${dados.valor.toFixed(2)} adicionado ao ${veiculo.marca} ${veiculo.modelo}`
    };
  }

  marcarVendido(dados) {
    const veiculo = this.findVehicle(dados.veiculo_identificador);
    
    if (!veiculo) {
      return { erro: `Veículo "${dados.veiculo_identificador}" não encontrado` };
    }

    const stmt = db.prepare(`
      UPDATE veiculos 
      SET status = 'vendido', preco_venda = ?, data_venda = ?
      WHERE id = ?
    `);

    stmt.run(
      dados.preco_venda,
      dados.data_venda || new Date().toISOString().split('T')[0],
      veiculo.id
    );

    const lucro = dados.preco_venda - veiculo.preco_compra;

    return {
      sucesso: true,
      veiculo: `${veiculo.marca} ${veiculo.modelo}`,
      preco_venda: dados.preco_venda,
      preco_compra: veiculo.preco_compra,
      lucro_bruto: lucro,
      mensagem: `${veiculo.marca} ${veiculo.modelo} marcado como vendido por R$ ${dados.preco_venda.toFixed(2)} (lucro bruto: R$ ${lucro.toFixed(2)})`
    };
  }

  atualizarVeiculo(dados) {
    const veiculo = this.findVehicle(dados.veiculo_identificador);
    
    if (!veiculo) {
      return { erro: `Veículo "${dados.veiculo_identificador}" não encontrado` };
    }

    const camposValidos = ['km', 'cor', 'placa', 'observacoes'];
    if (!camposValidos.includes(dados.campo)) {
      return { erro: `Campo "${dados.campo}" não pode ser atualizado` };
    }

    const stmt = db.prepare(`UPDATE veiculos SET ${dados.campo} = ? WHERE id = ?`);
    stmt.run(dados.valor, veiculo.id);

    return {
      sucesso: true,
      veiculo: `${veiculo.marca} ${veiculo.modelo}`,
      campo_atualizado: dados.campo,
      novo_valor: dados.valor,
      mensagem: `${dados.campo} do ${veiculo.marca} ${veiculo.modelo} atualizado para: ${dados.valor}`
    };
  }

  consultarLucro(identificador) {
    if (!identificador) {
      // Lucro total
      const stats = db.prepare(`
        SELECT 
          COALESCE(SUM(preco_venda), 0) as vendas,
          COALESCE(SUM(CASE WHEN status = 'vendido' THEN preco_compra ELSE 0 END), 0) as compras_vendidos
        FROM veiculos WHERE status = 'vendido'
      `).get();

      const gastos = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos').get();
      const lucro = stats.vendas - stats.compras_vendidos - gastos.total;

      return {
        lucro_liquido: lucro,
        total_vendas: stats.vendas,
        total_compras: stats.compras_vendidos,
        total_gastos: gastos.total
      };
    } else {
      // Lucro de um veículo específico
      const veiculo = this.findVehicle(identificador);
      if (!veiculo) {
        return { erro: `Veículo "${identificador}" não encontrado` };
      }

      const gastosVeiculo = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos WHERE veiculo_id = ?').get(veiculo.id);
      
      const lucro = veiculo.status === 'vendido' 
        ? veiculo.preco_venda - veiculo.preco_compra - gastosVeiculo.total
        : null;

      return {
        veiculo: `${veiculo.marca} ${veiculo.modelo}`,
        status: veiculo.status,
        preco_compra: veiculo.preco_compra,
        preco_venda: veiculo.preco_venda,
        gastos: gastosVeiculo.total,
        lucro: lucro,
        mensagem: lucro !== null 
          ? `Lucro: R$ ${lucro.toFixed(2)}`
          : 'Veículo ainda não foi vendido'
      };
    }
  }

  consultarEstatisticas(tipo) {
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
      ...stats,
      total_gastos: gastos.total,
      lucro_liquido: stats.total_vendas - stats.total_investido - gastos.total,
      tipo
    };
  }

  buscarVeiculo(termo) {
    const veiculos = db.prepare(`
      SELECT * FROM veiculos 
      WHERE LOWER(marca) LIKE ? OR LOWER(modelo) LIKE ? OR LOWER(placa) LIKE ? OR LOWER(cor) LIKE ?
    `).all(`%${termo.toLowerCase()}%`, `%${termo.toLowerCase()}%`, `%${termo.toLowerCase()}%`, `%${termo.toLowerCase()}%`);

    return {
      veiculos,
      total_encontrado: veiculos.length,
      termo_busca: termo
    };
  }

  deletarVeiculo(identificador) {
    const veiculo = this.findVehicle(identificador);
    
    if (!veiculo) {
      return { erro: `Veículo "${identificador}" não encontrado` };
    }

    // Deleta gastos associados
    db.prepare('DELETE FROM gastos WHERE veiculo_id = ?').run(veiculo.id);
    
    // Deleta veículo
    db.prepare('DELETE FROM veiculos WHERE id = ?').run(veiculo.id);

    return {
      sucesso: true,
      veiculo_deletado: `${veiculo.marca} ${veiculo.modelo}`,
      mensagem: `${veiculo.marca} ${veiculo.modelo} foi removido do sistema`
    };
  }

  // ========== PROCESSAMENTO COM FUNCTION CALLING ==========

  async processCommand(userCommand) {
    try {
      console.log('🤖 Gemini (Function Calling) processando:', userCommand);

      // Cria um novo chat se não existir
      if (!this.chat) {
        this.chat = this.model.startChat({
          history: [],
        });
      }

      // Monta o prompt com as funções disponíveis
      const prompt = `Você é um assistente inteligente de um sistema de gestão de veículos.

FUNÇÕES DISPONÍVEIS:
${Object.entries(functions).map(([nome, def]) => 
  `- ${nome}: ${def.description}`
).join('\n')}

O usuário disse: "${userCommand}"

Analise o comando e:
1. Se for uma ação (cadastrar, adicionar, atualizar, deletar), retorne JSON:
   {"function": "nome_da_funcao", "arguments": {...}, "needs_confirmation": true}

2. Se for uma consulta simples, retorne JSON:
   {"function": "nome_da_funcao", "arguments": {...}, "needs_confirmation": false}

3. Se não souber, retorne JSON:
   {"clarify": true, "question": "pergunta para esclarecer"}

Sempre responda em JSON válido.`;

      const result = await this.chat.sendMessage(prompt);
      const response = await result.response;
      let text = response.text();

      // Remove markdown
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      console.log('📥 Gemini respondeu:', text);

      const aiDecision = JSON.parse(text);

      // Se precisa esclarecimento
      if (aiDecision.clarify) {
        return {
          action: 'clarify',
          response: aiDecision.question,
          confidence: 0.5
        };
      }

      // Se precisa confirmação
      if (aiDecision.needs_confirmation) {
        this.pendingAction = aiDecision;
        return {
          action: 'pending',
          response: `Entendi que você quer ${aiDecision.function.replace(/_/g, ' ')}. Confirma? Diga "ok" ou "confirmar"`,
          confidence: 0.9,
          needs_confirmation: true,
          pending_function: aiDecision.function,
          pending_arguments: aiDecision.arguments
        };
      }

      // Executa função
      const functionResult = await this.executeFunction(aiDecision.function, aiDecision.arguments);

      // Gemini gera resposta amigável baseada no resultado
      const responsePrompt = `Resultado da função ${aiDecision.function}: ${JSON.stringify(functionResult)}

Gere uma resposta amigável em português para o usuário explicando o resultado.`;

      const responseResult = await this.chat.sendMessage(responsePrompt);
      const friendlyResponse = await responseResult.response;

      return {
        action: 'success',
        response: friendlyResponse.text(),
        confidence: 0.95,
        data: functionResult
      };

    } catch (error) {
      console.error('❌ Erro Gemini Function Calling:', error);
      return {
        action: 'error',
        response: 'Desculpe, tive um problema. Pode reformular?',
        confidence: 0,
        error: error.message
      };
    }
  }

  // Confirma ação pendente
  async confirmPending() {
    if (!this.pendingAction) {
      return {
        action: 'error',
        response: 'Não há ação pendente para confirmar'
      };
    }

    const result = await this.executeFunction(
      this.pendingAction.function,
      this.pendingAction.arguments
    );

    this.pendingAction = null;

    return {
      action: 'success',
      response: result.mensagem || 'Ação executada com sucesso!',
      confidence: 1.0,
      data: result
    };
  }

  // Cancela ação pendente
  cancelPending() {
    this.pendingAction = null;
    return {
      action: 'cancelled',
      response: 'Ação cancelada',
      confidence: 1.0
    };
  }
}

// Verifica se tem API key
const hasApiKey = GEMINI_API_KEY && GEMINI_API_KEY !== 'dummy-key';

if (hasApiKey) {
  console.log('🤖 Gemini Function Calling habilitado!');
} else {
  console.warn('⚠️  GEMINI_API_KEY não configurada. Usando modo local.');
}

const geminiAgent = new GeminiWithFunctions();

export { geminiAgent, hasApiKey, functions };
