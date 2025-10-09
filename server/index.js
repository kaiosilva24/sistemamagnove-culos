import express from 'express';
import cors from 'cors';
import supabaseDB from './supabaseDB.js';
import hybridAI from './hybridAI.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ========== ROTAS DE VEÍCULOS ==========

// Listar todos os veículos
app.get('/api/veiculos', async (req, res) => {
  try {
    const veiculos = await supabaseDB.getAllVehicles();
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar veículo por ID
app.get('/api/veiculos/:id', async (req, res) => {
  try {
    const veiculo = await supabaseDB.getVehicleById(req.params.id);
    
    if (!veiculo) {
      return res.status(404).json({ error: 'Veículo não encontrado' });
    }
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar veículo
app.post('/api/veiculos', async (req, res) => {
  try {
    const veiculo = await supabaseDB.createVehicle(req.body);
    res.status(201).json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar veículo
app.put('/api/veiculos/:id', async (req, res) => {
  try {
    const veiculo = await supabaseDB.updateVehicle(req.params.id, req.body);
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar veículo
app.delete('/api/veiculos/:id', async (req, res) => {
  try {
    await supabaseDB.deleteVehicle(req.params.id);
    res.json({ message: 'Veículo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ESTATÍSTICAS ==========

app.get('/api/dashboard', async (req, res) => {
  try {
    console.log('📊 Buscando dados do dashboard...');
    const stats = await supabaseDB.getStats();
    console.log('✅ Dashboard:', stats);
    res.json(stats);
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
    
    const { command } = req.body;
    
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
    
    // Registra o comando no Supabase
    await supabaseDB.createAgentLog({
      session_id: req.body.sessionId || 'default',
      command: command,
      action: result.action || 'unknown',
      ai_used: result.processedBy || 'unknown',
      success: result.action !== 'error',
      response: result.response || 'Sem resposta',
      confidence: result.confidence || 0
    });
    
    // Se a ação é criar veículo, executa o cadastro
    if (result.action === 'create_vehicle' && result.data) {
      try {
        const veiculo = await supabaseDB.createVehicle(result.data);
        
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

// ========== ROTAS DE RELATÓRIOS DO AGENTE ==========

// Obter logs da sessão atual
app.get('/api/agent/report', async (req, res) => {
  try {
    const logs = await supabaseDB.getAgentLogs();
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar todas as sessões
app.get('/api/agent/sessions', async (req, res) => {
  try {
    const sessions = await supabaseDB.getAllSessions();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter logs de uma sessão específica
app.get('/api/agent/logs/:sessionId', async (req, res) => {
  try {
    const logs = await supabaseDB.getAgentLogs(req.params.sessionId);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`☁️  Usando Supabase (PostgreSQL na nuvem)`);
  console.log(`🧠 Sistema Híbrido de IA ativado!`);
  const status = hybridAI.getStatus();
  console.log(`   ${status.gemini ? '✅ Gemini AI (Extração precisa)' : '❌ Gemini AI (não configurado)'}`);
  console.log(`   ${status.groq ? '✅ Groq AI (Rápido e conversacional)' : '❌ Groq AI (não configurado)'}`);
  console.log(`   ✅ IA Local (Sempre disponível como fallback)`);
});
