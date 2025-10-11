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
    // PRIORIDADE 1: Detectar GASTO (tem que vir ANTES de veículo!)
    // Se tem "placa" + alguma palavra de gasto/peça, É GASTO
    const temPlaca = /(?:na|a)?\s*placa/i.test(command);
    const temGasto = /câmbio|cambio|motor|roda|pneu|óleo|filtro|pastilha|disco|amortecedor|suspensão|embreagem|bateria|farol|correia|turbina|vela|transmissão|documentação|ipva|seguro|r\$\s*\d+|\d+\s*em\s+/i.test(command);
    const isGastoExplicito = /adicionar\s+gasto|gasto\s+(de|na|no|em|da|do)|gastei|gastos?\s+(na|no|a|ao)\s+placa|larga.*gasto|coloca.*gasto/i.test(command);
    
    const isGastoCommand = isGastoExplicito || (temPlaca && temGasto);
    
    // PRIORIDADE 2: Detectar CADASTRO de veículo (apenas se NÃO for gasto)
    const isCadastroCommand = !isGastoCommand && (
      /cadastr(ar|a|o)|adicionar\s+(novo\s+)?ve[ií]culo|novo\s+ve[ií]culo|registrar\s+ve[ií]culo|criar\s+ve[ií]culo/i.test(command) ||
      /\b(marca|modelo)\s+\w+/i.test(command)
    );
    
    const isVeiculoCommand = isCadastroCommand;
    
    // Debug da detecção
    console.log('🔍 Detecção de comando:', {
      temPlaca,
      temGasto,
      isGastoExplicito,
      isGastoCommand,
      isVeiculoCommand
    });

    // ==================== PROCESSAR GASTOS ====================
    if (isGastoCommand) {
      console.log('💰 Comando de gasto detectado');

      // Buscar placa primeiro (aceita espaços: "abcd 1010")
      // ESTRATÉGIA: Capturar até encontrar palavra que indica início de gastos (r$, correia, motor, etc)
      // Aceita placas com espaços: "abcd 10 10", "abc 1234", etc
      let placaMatch = command.match(/(?:placa|na placa|a placa)\s+([\w\d\s\-]+?)(?=\s+(?:correia|motor|roda|pneu|óleo|filtro|pastilha|disco|amortecedor|suspensão|cambio|câmbio|embreagem|bateria|farol|lanterna|retrovisor|para-choque|capô|porta|vidro|pintura|lataria|funilaria|ar\s+condicionado|radiador|bomba|vela|corrente|correia\s+dentada|kit\s+embreagem|troca\s+de\s+óleo|alinhamento|balanceamento|geometria|revisão|manutenção|serviço|reparo|conserto|r\$))/iu);
      
      // Fallback 1: Se não encontrar palavras-chave, pega até encontrar LETRA + R$ ou LETRA + NÚMERO alto (indicando valor)
      if (!placaMatch) {
        placaMatch = command.match(/(?:placa|na placa|a placa)\s+([\w\d\s\-]+?)(?=\s+[\p{L}]+\s+r?\$?\s*\d{2,})/iu);
      }
      
      // Fallback 2: pega tudo até o final do comando (caso não tenha gastos)
      if (!placaMatch) {
        placaMatch = command.match(/(?:placa|na placa|a placa)\s+([\w\d\s\-]+?)$/i);
      }
      
      const modeloMatch = command.match(/veículo\s+(\w+)(?:\s+placa)?/i);
      
      console.log('🔍 Regex de placa encontrou:', placaMatch ? placaMatch[1] : 'NADA');

      // Buscar veículo
      let veiculo = null;
      if (placaMatch) {
        // Normalizar placa: remover espaços e converter para uppercase
        const placaNormalizada = placaMatch[1].replace(/\s+/g, '').toUpperCase();
        console.log('🔍 Buscando placa normalizada:', placaNormalizada);
        
        // Buscar todos os veículos do usuário
        const { data: veiculos } = await supabase
          .from('veiculos')
          .select('*')
          .eq('user_id', user.id);
        
        // Encontrar veículo com placa similar (pelo menos 60% de match)
        veiculo = veiculos?.find(v => {
          if (!v.placa) return false;
          const placaDB = v.placa.replace(/\s+/g, '').toUpperCase();
          
          // Similaridade simples: contar caracteres iguais
          const minLen = Math.min(placaNormalizada.length, placaDB.length);
          const maxLen = Math.max(placaNormalizada.length, placaDB.length);
          
          let matches = 0;
          for (let i = 0; i < minLen; i++) {
            if (placaNormalizada[i] === placaDB[i]) matches++;
          }
          
          const similarity = matches / maxLen;
          console.log(`   Comparando "${placaNormalizada}" com "${placaDB}": ${(similarity * 100).toFixed(0)}%`);
          
          return similarity >= 0.6; // 60% de similaridade
        });
        
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

      // NOVO: Extrair MÚLTIPLOS gastos do comando de forma GENÉRICA
      // Aceita QUALQUER tipo de gasto, não apenas uma lista pré-definida
      const gastos = [];
      
      // Remover a parte da placa do comando para não interferir na extração de gastos
      let comandoSemPlaca = command;
      if (placaMatch) {
        // Remove "placa XXXX" completamente do comando
        // Escape special regex chars e permite espaços/hífens flexíveis
        const placaEscapada = placaMatch[1].replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[\s-]+/g, '[\\s-]+');
        const placaRegex = new RegExp(`(?:(?:na|a)\\s+)?placa\\s+${placaEscapada}(?:\\s+|$)`, 'i');
        comandoSemPlaca = command.replace(placaRegex, '').trim();
        console.log('📝 Comando sem placa:', comandoSemPlaca);
      }
      
      // Palavras que NÃO são tipos de gastos (palavras de comando)
      const palavrasIgnoradas = ['adicionar', 'gasto', 'gastos', 'placa', 'veiculo', 'veículo', 
                                  'do', 'da', 'de', 'no', 'na', 'para', 'em', 'ok', 'ao', 'com', 'a', 'r'];
      
      // Padrão 1: [TIPO] r$ [VALOR] (ex: "câmbio r$ 200", "transmissão r$ 1500")
      // Usa Unicode \p{L} para capturar qualquer letra (incluindo acentuadas)
      const pattern1 = /([\p{L}\s]+?)\s+r\$\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/giu;
      let match;
      while ((match = pattern1.exec(comandoSemPlaca)) !== null) {
        const tipo = match[1].trim().toLowerCase();
        if (!palavrasIgnoradas.includes(tipo)) {
          gastos.push({
            tipo: match[1].trim(),
            valor: parseFloat(match[2].replace(/\./g, '').replace(',', '.'))
          });
        }
      }

      // Padrão 2: [TIPO] [VALOR] SEM r$ (ex: "motor 200 câmbio 300 correia dentada 80")
      // Captura palavras (incluindo multi-word) seguidas de número
      const pattern2 = /([\p{L}\s]+?)\s+(\d{2,})/giu;
      while ((match = pattern2.exec(comandoSemPlaca)) !== null) {
        const tipo = match[1].trim().toLowerCase();
        const valor = parseInt(match[2]);
        
        // Ignorar palavras de comando e valores muito grandes
        if (!palavrasIgnoradas.includes(tipo) && valor >= 10 && valor <= 99999) {
          // Evitar duplicatas
          const jaExiste = gastos.some(g => g.tipo.toLowerCase() === tipo);
          if (!jaExiste) {
            gastos.push({
              tipo: match[1].trim(),
              valor: parseFloat(match[2])
            });
          }
        }
      }

      // Padrão 3: [VALOR] em [TIPO] (ex: "200 em câmbio", "500 na turbina")
      const pattern3 = /(\d+)\s+(?:em|para|no|na)\s+([\p{L}\s]+?)(?=\s+\d|\s+r\$|$)/giu;
      while ((match = pattern3.exec(comandoSemPlaca)) !== null) {
        const tipo = match[2].trim().toLowerCase();
        if (!palavrasIgnoradas.includes(tipo)) {
          // Evitar duplicatas
          const jaExiste = gastos.some(g => g.tipo.toLowerCase() === tipo);
          if (!jaExiste) {
            gastos.push({
              tipo: match[2].trim(),
              valor: parseFloat(match[1])
            });
          }
        }
      }

      if (gastos.length === 0) {
        return res.status(200).json({
          success: false,
          action: 'error',
          response: 'Não consegui identificar os gastos. Fale: "Adicionar gasto placa [PLACA] [TIPO] r$ [VALOR]" ou "placa [PLACA] câmbio r$ 200 documentação r$ 1000"',
          confidence: 0.3
        });
      }

      console.log('💾 Salvando', gastos.length, 'gasto(s):', gastos);

      // Salvar todos os gastos
      const gastosData = gastos.map(g => ({
        vehicle_id: veiculo.id,
        tipo: g.tipo.charAt(0).toUpperCase() + g.tipo.slice(1),
        valor: g.valor,
        descricao: `${g.tipo.charAt(0).toUpperCase() + g.tipo.slice(1)} - R$ ${g.valor.toFixed(2).replace('.', ',')} (registrado por voz)`,
        data: new Date().toISOString().split('T')[0]
      }));

      const { data: gastosSalvos, error: gastoError } = await supabase
        .from('gastos')
        .insert(gastosData)
        .select();

      if (gastoError) {
        console.error('❌ Erro ao salvar gastos:', gastoError);
        throw gastoError;
      }

      console.log('✅', gastosSalvos.length, 'gasto(s) salvo(s)');

      // Calcular total
      const totalGastos = gastos.reduce((sum, g) => sum + g.valor, 0);
      const listaGastos = gastos.map(g => `${g.tipo} (R$ ${g.valor.toFixed(2)})`).join(', ');

      // Salvar log
      await supabase.from('agent_logs').insert([{
        user_id: user.id,
        session_id: sessionId || Date.now().toString(),
        command: command,
        action: 'add_gastos',
        vehicle_id: veiculo.id,
        data: {
          placa: veiculo.placa,
          modelo: veiculo.modelo,
          gastos: gastos
        },
        response: `${gastos.length} gasto(s) registrado(s): ${listaGastos}. Total: R$ ${totalGastos.toFixed(2)}`,
        ai_used: 'local',
        confidence: 0.95,
        success: true
      }]);

      return res.status(200).json({
        success: true,
        action: 'add_gastos',
        gastoIds: gastosSalvos.map(g => g.id),
        aiUsed: 'local',
        processedBy: 'local',
        response: `${gastos.length} gasto(s) registrado(s) no veículo ${veiculo.modelo}: ${listaGastos}. Total: R$ ${totalGastos.toFixed(2)}`,
        confidence: 0.95,
        sessionId: sessionId || Date.now().toString(),
        data: {
          gastos: gastosSalvos,
          vehicle: veiculo,
          total: totalGastos
        }
      });
    }

    // ==================== PROCESSAR VEÍCULOS ====================
    // Extrair informações do comando com regex (aceita variações: "marca X", "da marca X")
    const marcaMatch = command.match(/(?:da\s+)?marca\s+(\w+)/i);
    const modeloMatch = command.match(/(?:do\s+)?modelo\s+([\w\s]+?)(?:\s+ano|\s+placa|\s+valor|\s+km|\s+quilometragem|\s+cor|$)/i);
    const anoMatch = command.match(/ano\s+(\d{4})/i);
    const valorMatch = command.match(/valor\s+(?:r\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/i) || 
                       command.match(/(?:por|de)\s+(?:r\$\s*)?(\d+(?:\.\d{3})*(?:,\d{2})?)/i);
    // Placa: aceita "ABC1234", "ABC-1234", "ABC 1234", "ABCD 2030"
    const placaMatch = command.match(/placa\s+([\w\d\-\s]+?)(?:\s+km|\s+quilometragem|\s+valor|\s+cor|\s+ano|$)/i);
    // KM: aceita "20.000", "20000", "20 .000" (pontos, espaços)
    const kmMatch = command.match(/(?:km|quilometragem|quilômetros?)\s+([\d\.\s]+)/i);
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
      modelo: modeloMatch[1].trim(),
      ano: anoMatch ? parseInt(anoMatch[1]) : new Date().getFullYear(),
      preco_compra: valorMatch ? parseFloat(valorMatch[1].replace(/\./g, '').replace(',', '.')) : 0,
      data_compra: new Date().toISOString().split('T')[0],
      placa: placaMatch ? placaMatch[1].replace(/\s+/g, '').toUpperCase() : null,
      km: kmMatch ? parseInt(kmMatch[1].replace(/[\.\s]/g, '')) : null,
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
      action: 'create_vehicle',
      response: `Veículo ${veiculoData.marca} ${veiculoData.modelo} ${veiculoData.ano} cadastrado com sucesso!`,
      ai_used: 'local',
      confidence: 0.95,
      success: true
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
