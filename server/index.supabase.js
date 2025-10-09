import express from 'express';
import cors from 'cors';
import supabaseDB from './supabaseDB.js';
import hybridAI from './hybridAI.js';
import { authenticateUser, optionalAuth } from './authMiddleware.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ========== ROTAS DE VEÍCULOS ==========

// Listar todos os veículos
app.get('/api/veiculos', authenticateUser, async (req, res) => {
  try {
    const veiculos = await supabaseDB.getAllVehicles();
    res.json(veiculos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Buscar veículo por ID
app.get('/api/veiculos/:id', authenticateUser, async (req, res) => {
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
app.post('/api/veiculos', authenticateUser, async (req, res) => {
  try {
    const veiculo = await supabaseDB.createVehicle(req.body, req.user.id);
    res.status(201).json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atualizar veículo
app.put('/api/veiculos/:id', authenticateUser, async (req, res) => {
  try {
    const veiculo = await supabaseDB.updateVehicle(req.params.id, req.body);
    res.json(veiculo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Deletar veículo
app.delete('/api/veiculos/:id', authenticateUser, async (req, res) => {
  try {
    await supabaseDB.deleteVehicle(req.params.id);
    res.json({ message: 'Veículo deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter gastos do veículo
app.get('/api/veiculos/:id/gastos', authenticateUser, async (req, res) => {
  try {
    const gastos = await supabaseDB.getGastosByVeiculo(req.params.id);
    const total = await supabaseDB.getTotalGastosByVeiculo(req.params.id);
    res.json({ gastos, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Adicionar gasto a um veículo
app.post('/api/veiculos/:id/gastos', authenticateUser, async (req, res) => {
  try {
    const gastoData = {
      veiculo_id: req.params.id,
      ...req.body
    };
    const gasto = await supabaseDB.addGasto(gastoData);
    res.status(201).json(gasto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PREFERÊNCIAS DO USUÁRIO ==========

// Obter preferência específica
app.get('/api/preferences/:key', async (req, res) => {
  try {
    const value = await supabaseDB.getPreference(req.params.key);
    res.json({ key: req.params.key, value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Salvar preferência
app.post('/api/preferences', authenticateUser, async (req, res) => {
  try {
    const { key, value } = req.body;
    const preference = await supabaseDB.setPreference(key, value, req.user.id);
    res.json(preference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obter todas as preferências
app.get('/api/preferences', async (req, res) => {
  try {
    const preferences = await supabaseDB.getAllPreferences();
    res.json(preferences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ESTATÍSTICAS ==========

app.get('/api/dashboard', authenticateUser, async (req, res) => {
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
app.post('/api/ai/process', authenticateUser, async (req, res) => {
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
    }, req.user.id);
    
    // Se a ação é criar veículo, executa o cadastro
    if (result.action === 'create_vehicle' && result.data) {
      try {
        console.log('📝 Dados ANTES de salvar no banco:', JSON.stringify(result.data, null, 2));
        
        const veiculo = await supabaseDB.createVehicle(result.data, req.user.id);
        
        console.log('💾 Dados DEPOIS de salvar (retornados do banco):', JSON.stringify(veiculo, null, 2));
        
        result.response = `Veículo cadastrado com sucesso!`;
        
        result.vehicleId = veiculo.id;
        console.log('✅ Veículo cadastrado:', veiculo);
      } catch (error) {
        console.error('❌ Erro ao cadastrar veículo:', error);
        result.action = 'error';
        result.response = `Erro ao cadastrar veículo: ${error.message}`;
        result.confidence = 0;
      }
    }
    
    // Se a ação é adicionar gastos, processa
    if (result.action === 'add_gastos' && result.data) {
      try {
        console.log('💰 Processando gastos:', JSON.stringify(result.data, null, 2));
        
        // Busca o veículo pelo modelo ou placa
        const veiculo = await supabaseDB.findVehicleByModeloPlaca(
          result.data.modelo, 
          result.data.placa
        );
        
        if (!veiculo) {
          // Lista veículos disponíveis para ajudar o usuário
          const todosVeiculos = await supabaseDB.getAllVehicles();
          const listaVeiculos = todosVeiculos.map(v => 
            `${v.marca} ${v.modelo}${v.placa ? ` (${v.placa})` : ' (sem placa)'}`
          ).join(', ');
          
          result.action = 'error';
          result.response = `Veículo não encontrado. ` +
            `${result.data.modelo ? `Modelo buscado: ${result.data.modelo}. ` : ''}` +
            `${result.data.placa ? `Placa buscada: ${result.data.placa}. ` : ''}` +
            `Veículos disponíveis: ${listaVeiculos}. ` +
            `Dica: Use a placa completa ou o nome exato do modelo.`;
          result.confidence = 0;
        } else {
          // Adiciona cada gasto
          const gastosAdicionados = [];
          let totalGastos = 0;
          
          for (const gasto of result.data.gastos) {
            const gastoData = {
              veiculo_id: veiculo.id,
              tipo: gasto.tipo,
              descricao: gasto.descricao,
              valor: gasto.valor
            };
            
            const gastoSalvo = await supabaseDB.addGasto(gastoData);
            gastosAdicionados.push(gastoSalvo);
            totalGastos += parseFloat(gasto.valor);
          }
          
          result.response = `Gastos adicionados com sucesso!`;
          
          result.vehicleId = veiculo.id;
          result.gastosIds = gastosAdicionados.map(g => g.id);
          console.log('✅ Gastos adicionados:', gastosAdicionados);
          
          // Salva log da ação
          await supabaseDB.createAgentLog({
            action: 'add_gastos',
            command: command,
            vehicle_id: veiculo.id,
            data: result.data,
            success: true,
            ai_used: result.processedBy || 'hybrid'
          }, req.user.id);
        }
      } catch (error) {
        console.error('❌ Erro ao adicionar gastos:', error);
        result.action = 'error';
        result.response = `Erro ao adicionar gastos: ${error.message}`;
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
    res.json({ logs });
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
