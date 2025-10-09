// Processar comandos de IA
const { supabase, getUserFromRequest } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { command, sessionId, preferredAI } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Comando é obrigatório' });
    }

    console.log('🎤 Processando comando:', command);

    // Obter usuário autenticado ANTES de processar
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: 'Não autorizado' });
    }

    // Detectar tipo de comando
    const isGastoCommand = /adicionar\s+gasto|gasto\s+de|gasto\s+no/i.test(command);
    const isVeiculoCommand = /adicionar\s+veículo|veículo\s+marca|cadastrar\s+veículo/i.test(command) || 
                             /marca\s+\w+\s+modelo/i.test(command);

    // ==================== PROCESSAR GASTOS ====================
    if (isGastoCommand) {
      console.log('💰 Comando de gasto detectado');

      // Extrair informações do gasto
      const valorMatch = command.match(/(?:gasto\s+de|valor\s+de|valor)\s+(?:r\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/i) ||
                         command.match(/(\d+(?:\.\d{3})*(?:,\d{2})?)\s+(?:reais|real)/i);
      const tipoMatch = command.match(/em\s+(\w+)/i) || command.match(/tipo\s+(\w+)/i);
      const placaMatch = command.match(/placa\s+([\w\d]+)/i) || 
                         command.match(/veículo\s+(?:\w+\s+)?placa\s+([\w\d]+)/i);
      const modeloMatch = command.match(/veículo\s+(\w+)(?:\s+placa)?/i);
      const descricaoMatch = command.match(/(?:descrição|obs|observação):\s*([^,\.]+)/i);

      if (!valorMatch) {
        return res.status(200).json({
          success: false,
          action: 'error',
          response: 'Não consegui identificar o valor do gasto. Fale: "Adicionar gasto de [VALOR] em [TIPO] no veículo placa [PLACA]"',
          confidence: 0.3
        });
      }

      // Buscar veículo
      let veiculo = null;
      if (placaMatch) {
        const { data } = await supabase
          .from('veiculos')
          .select('*')
          .eq('user_id', user.id)
          .ilike('placa', `%${placaMatch[1]}%`)
          .single();
        veiculo = data;
      } else if (modeloMatch) {
        const { data } = await supabase
          .from('veiculos')
          .select('*')
          .eq('user_id', user.id)
          .ilike('modelo', `%${modeloMatch[1]}%`)
          .limit(1)
          .single();
        veiculo = data;
      }

      if (!veiculo) {
        return res.status(200).json({
          success: false,
          action: 'error',
          response: 'Não encontrei o veículo. Por favor, mencione a placa ou modelo.',
          confidence: 0.4
        });
      }

      // Preparar dados do gasto
      const gastoData = {
        vehicle_id: veiculo.id,
        tipo: tipoMatch ? tipoMatch[1] : 'Diversos',
        valor: parseFloat(valorMatch[1].replace(/\./g, '').replace(',', '.')),
        descricao: descricaoMatch ? descricaoMatch[1] : `Gasto registrado por voz`,
        data: new Date().toISOString().split('T')[0]
      };

      console.log('💾 Salvando gasto:', gastoData);

      // Salvar gasto
      const { data: gasto, error: gastoError } = await supabase
        .from('gastos')
        .insert([gastoData])
        .select()
        .single();

      if (gastoError) {
        console.error('❌ Erro ao salvar gasto:', gastoError);
        throw gastoError;
      }

      console.log('✅ Gasto salvo:', gasto);

      // Salvar log
      await supabase.from('agent_logs').insert([{
        user_id: user.id,
        session_id: sessionId || Date.now().toString(),
        command: command,
        response: `Gasto de R$ ${gastoData.valor.toFixed(2)} em ${gastoData.tipo} registrado no veículo ${veiculo.modelo}`,
        ai_used: 'local',
        confidence: 0.95
      }]);

      return res.status(200).json({
        success: true,
        action: 'add_gastos',
        gastoId: gasto.id,
        aiUsed: 'local',
        processedBy: 'local',
        response: `Gasto de R$ ${gastoData.valor.toFixed(2)} em ${gastoData.tipo} registrado no veículo ${veiculo.modelo} com sucesso!`,
        confidence: 0.95,
        sessionId: sessionId || Date.now().toString(),
        data: {
          gasto: gasto,
          vehicle: veiculo
        }
      });
    }

    // ==================== PROCESSAR VEÍCULOS ====================
    // Extrair informações do comando com regex
    const marcaMatch = command.match(/marca\s+(\w+)/i);
    const modeloMatch = command.match(/modelo\s+(\w+)/i);
    const anoMatch = command.match(/ano\s+(\d{4})/i);
    const valorMatch = command.match(/valor\s+(?:r\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/i) || 
                       command.match(/(\d+(?:\.\d{3})*(?:,\d{2})?)/);
    const placaMatch = command.match(/placa\s+([\w\d]+)/i);
    const kmMatch = command.match(/(?:km|quilometragem)\s+(\d+(?:\.\d{3})*)/i);
    const corMatch = command.match(/cor\s+(\w+)/i);

    // Verificar se temos os dados mínimos para veículo
    if (!marcaMatch || !modeloMatch) {
      return res.status(200).json({
        success: false,
        action: 'error',
        response: 'Não consegui identificar marca e modelo. Por favor, fale: "Adicionar veículo marca [MARCA] modelo [MODELO] ano [ANO] valor [VALOR]"',
        confidence: 0.3
      });
    }

    // Preparar dados do veículo
    const veiculoData = {
      user_id: user.id,
      marca: marcaMatch[1],
      modelo: modeloMatch[1],
      ano: anoMatch ? parseInt(anoMatch[1]) : new Date().getFullYear(),
      preco_compra: valorMatch ? parseFloat(valorMatch[1].replace(/\./g, '').replace(',', '.')) : 0,
      data_compra: new Date().toISOString().split('T')[0],
      placa: placaMatch ? placaMatch[1].toUpperCase() : null,
      km: kmMatch ? parseInt(kmMatch[1].replace(/\./g, '')) : null,
      cor: corMatch ? corMatch[1] : null,
      status: 'estoque',
      observacoes: 'Cadastrado por comando de voz'
    };

    console.log('💾 Salvando veículo:', veiculoData);

    // Salvar no banco
    const { data: veiculo, error } = await supabase
      .from('veiculos')
      .insert([veiculoData])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao salvar:', error);
      throw error;
    }

    console.log('✅ Veículo salvo:', veiculo);

    // Salvar log da ação
    await supabase.from('agent_logs').insert([{
      user_id: user.id,
      session_id: sessionId || Date.now().toString(),
      command: command,
      response: `Veículo ${veiculoData.marca} ${veiculoData.modelo} ${veiculoData.ano} cadastrado com sucesso!`,
      ai_used: 'local',
      confidence: 0.95
    }]);

    return res.status(200).json({
      success: true,
      action: 'create_vehicle',
      vehicleId: veiculo.id,
      aiUsed: 'local',
      processedBy: 'local',
      response: `Veículo ${veiculoData.marca} ${veiculoData.modelo} ${veiculoData.ano} cadastrado com sucesso!`,
      confidence: 0.95,
      sessionId: sessionId || Date.now().toString(),
      data: {
        vehicle: veiculo
      }
    });
  } catch (error) {
    console.error('❌ Erro em /api/ai/process:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message,
      response: 'Erro ao processar comando: ' + error.message
    });
  }
};
