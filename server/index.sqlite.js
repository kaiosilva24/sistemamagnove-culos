import express from 'express';
import cors from 'cors';
import db from './database.js';
import hybridAI from './hybridAI.js';
import agentLogger from './agentLogger.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ========== ROTAS DE VEÍCULOS ==========

// Listar todos os veículos
app.get('/api/veiculos', (req, res) => {
  try {
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
      GROUP BY v.id
      ORDER BY v.created_at DESC
    `).all();
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar veículo por ID
app.get('/api/veiculos/:id', (req, res) => {
  try {
    const veiculo = db.prepare(`
      SELECT v.*, 
        COALESCE(SUM(g.valor), 0) as total_gastos,
        CASE 
          WHEN v.preco_venda IS NOT NULL 
          THEN v.preco_venda - v.preco_compra - COALESCE(SUM(g.valor), 0)
          ELSE NULL 
        END as lucro
      FROM veiculos v
      LEFT JOIN gastos g ON v.id = g.veiculo_id
      WHERE v.id = ?
      GROUP BY v.id
    `).get(req.params.id);
    
    if (!veiculo) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar veículo
app.post('/api/veiculos', (req, res) => {
  try {
    const { marca, modelo, ano, placa, cor, km, preco_compra, data_compra, observacoes } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO veiculos (marca, modelo, ano, placa, cor, km, preco_compra, data_compra, observacoes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(marca, modelo, ano, placa, cor, km, preco_compra, data_compra, observacoes);
    
    const veiculo = db.prepare('SELECT * FROM veiculos WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar veículo
app.put('/api/veiculos/:id', (req, res) => {
  try {
    const { marca, modelo, ano, placa, cor, km, preco_compra, data_compra, preco_venda, data_venda, status, observacoes } = req.body;
    
    const stmt = db.prepare(`
      UPDATE veiculos 
      SET marca = ?, modelo = ?, ano = ?, placa = ?, cor = ?, km = ?, 
          preco_compra = ?, data_compra = ?, preco_venda = ?, data_venda = ?, 
          status = ?, observacoes = ?
      WHERE id = ?
    `);
    
    stmt.run(marca, modelo, ano, placa, cor, km, preco_compra, data_compra, preco_venda, data_venda, status, observacoes, req.params.id);
    
    const veiculo = db.prepare(`
      SELECT v.*, 
        COALESCE(SUM(g.valor), 0) as total_gastos,
        CASE 
          WHEN v.preco_venda IS NOT NULL 
          THEN v.preco_venda - v.preco_compra - COALESCE(SUM(g.valor), 0)
          ELSE NULL 
        END as lucro
      FROM veiculos v
      LEFT JOIN gastos g ON v.id = g.veiculo_id
      WHERE v.id = ?
      GROUP BY v.id
    `).get(req.params.id);
    
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar veículo
app.delete('/api/veiculos/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM veiculos WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ message: 'Veículo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ROTAS DE GASTOS ==========

// Listar gastos de um veículo
app.get('/api/veiculos/:id/gastos', (req, res) => {
  try {
    const gastos = db.prepare('SELECT * FROM gastos WHERE veiculo_id = ? ORDER BY data DESC').all(req.params.id);
    res.json(gastos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar gasto
app.post('/api/veiculos/:id/gastos', (req, res) => {
  try {
    const { descricao, categoria, valor, data } = req.body;
    
    const stmt = db.prepare(`
      INSERT INTO gastos (veiculo_id, descricao, categoria, valor, data)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(req.params.id, descricao, categoria, valor, data);
    const gasto = db.prepare('SELECT * FROM gastos WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(gasto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar gasto
app.delete('/api/gastos/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM gastos WHERE id = ?');
    stmt.run(req.params.id);
    res.json({ message: 'Gasto deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ESTATÍSTICAS ==========

app.get('/api/dashboard', (req, res) => {
  try {
    console.log('📊 Buscando dados do dashboard...');
    
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_veiculos,
        SUM(CASE WHEN status = 'estoque' THEN 1 ELSE 0 END) as em_estoque,
        SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendidos,
        COALESCE(SUM(preco_compra), 0) as total_investido,
        COALESCE(SUM(preco_venda), 0) as total_vendas,
        COALESCE(SUM(CASE WHEN preco_venda IS NOT NULL THEN preco_venda - preco_compra ELSE 0 END), 0) as lucro_bruto
      FROM veiculos
    `).get();
    
    console.log('✅ Stats obtidas:', stats);
    
    const totalGastos = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos').get();
    const lucroLiquido = stats.lucro_bruto - totalGastos.total;
    
    const result = {
      ...stats,
      total_gastos: totalGastos.total,
      lucro_liquido: lucroLiquido
    };
    
    console.log('✅ Dashboard:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({ error: error.message });
  }
});

// ========== ROTA DE IA ==========

// Verificar status das IAs disponíveis
app.get('/api/ai/status', (req, res) => {
  try {
    const status = hybridAI.getStatus();
    res.json({
      available: {
        gemini: status.gemini,
        groq: status.groq,
        local: status.local
      },
      recommended: status.gemini ? 'gemini' : (status.groq ? 'groq' : 'local')
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Processar comando com IA
app.post('/api/ai/process', async (req, res) => {
  try {
    console.log('📥 Recebendo comando:', req.body);
    
    const { command, context } = req.body;
    
    if (!command) {
      console.error('❌ Comando vazio recebido');
      return res.status(400).json({ 
        error: 'Comando é obrigatório',
        action: 'error',
        response: 'Nenhum comando foi recebido',
        confidence: 0
      });
    }

    console.log(`🤖 Processando comando:`, command);
    
    // Usa sistema híbrido (tenta Gemini/Groq, fallback para IA Local)
    let result = await hybridAI.processCommand(command, req.body.preferredAI || 'auto');
    
    // Registra o comando no logger
    agentLogger.logAction({
      command: command,
      action: result.action || 'unknown',
      aiUsed: result.processedBy || 'unknown',
      success: result.action !== 'error',
      response: result.response || 'Sem resposta',
      confidence: result.confidence || 0
    });
    
    // Se a ação é criar veículo, executa o cadastro
    if (result.action === 'create_vehicle' && result.data) {
      try {
        const { marca, modelo, ano, placa, cor, km, preco_compra, data_compra, status } = result.data;
        
        const stmt = db.prepare(`
          INSERT INTO veiculos (marca, modelo, ano, placa, cor, km, preco_compra, data_compra, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const insertResult = stmt.run(
          marca || null, 
          modelo || null, 
          ano || null, 
          placa || null, 
          cor || null, 
          km || null, 
          preco_compra || null, 
          data_compra || new Date().toISOString().split('T')[0], 
          status || 'estoque'
        );
        
        const veiculo = db.prepare('SELECT * FROM veiculos WHERE id = ?').get(insertResult.lastInsertRowid);
        
        result.response = `✅ Veículo cadastrado com sucesso!\n\n` +
          `🚗 ${veiculo.marca} ${veiculo.modelo}` +
          (veiculo.ano ? ` ${veiculo.ano}` : '') +
          (veiculo.cor ? ` - ${veiculo.cor}` : '') +
          (veiculo.preco_compra ? `\n💰 Preço: R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(veiculo.preco_compra)}` : '') +
          (veiculo.km ? `\n📏 KM: ${veiculo.km.toLocaleString('pt-BR')}` : '') +
          `\n📋 Status: ${veiculo.status}`;
        
        result.vehicleId = veiculo.id;
        console.log('✅ Veículo cadastrado:', veiculo);
      } catch (error) {
        console.error('❌ Erro ao cadastrar veículo:', error);
        result.action = 'error';
        result.response = `❌ Erro ao cadastrar veículo: ${error.message}`;
        result.confidence = 0;
      }
    }
    
    console.log('✅ Resposta gerada:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao processar comando de IA:', error);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({ 
      error: error.message,
      action: 'error',
      response: 'Desculpe, ocorreu um erro ao processar seu comando',
      confidence: 0
    });
  }
});

// Confirmar ação pendente (compatibilidade)
app.post('/api/ai/confirm', async (req, res) => {
  try {
    res.json({ 
      action: 'success',
      response: 'Ação confirmada'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancelar ação pendente (compatibilidade)
app.post('/api/ai/cancel', (req, res) => {
  try {
    res.json({ 
      action: 'cancelled',
      response: 'Ação cancelada'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Limpar contexto da conversa (compatibilidade)
app.post('/api/ai/clear-context', (req, res) => {
  try {
    res.json({ message: 'Contexto limpo com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ROTAS DE RELATÓRIOS DO AGENTE ==========

// Obter relatório da sessão atual
app.get('/api/agent/report', (req, res) => {
  try {
    const report = agentLogger.generateReport();
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter relatório em texto
app.get('/api/agent/report/text', (req, res) => {
  try {
    const reportText = agentLogger.generateTextReport();
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.send(reportText);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Baixar relatório como arquivo
app.get('/api/agent/report/download', (req, res) => {
  try {
    const reportText = agentLogger.generateTextReport();
    const fileName = `relatorio_magno_${new Date().toISOString().split('T')[0]}.txt`;
    
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(reportText);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todas as sessões
app.get('/api/agent/sessions', (req, res) => {
  try {
    const sessions = agentLogger.getAllSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter logs de uma sessão específica
app.get('/api/agent/logs/:sessionId', (req, res) => {
  try {
    const logs = agentLogger.getSessionLogs(req.params.sessionId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Iniciar nova sessão
app.post('/api/agent/new-session', (req, res) => {
  try {
    agentLogger.clearSession();
    res.json({ 
      message: 'Nova sessão iniciada',
      sessionId: agentLogger.sessionId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`🧠 Sistema Híbrido de IA ativado!`);
  const status = hybridAI.getStatus();
  console.log(`   ${status.gemini ? '✅ Gemini AI (Extração precisa)' : '❌ Gemini AI (não configurado)'}`);
  console.log(`   ${status.groq ? '✅ Groq AI (Rápido e conversacional)' : '❌ Groq AI (não configurado)'}`);
  console.log(`   ✅ IA Local (Sempre disponível como fallback)`);
});
