import { supabase } from './supabaseClient.js';

class SupabaseDB {
  // ============ VEÍCULOS ============
  
  async createVehicle(data, userId = null) {
    try {
      console.log('🔍 [createVehicle] Dados recebidos:', JSON.stringify(data, null, 2));
      
      const vehicleToInsert = {
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano || null,
        cor: data.cor || null,
        placa: data.placa || null,
        km: data.km || 0,
        preco_compra: data.preco_compra || null,
        preco_venda: data.preco_venda || null,
        status: data.status || 'estoque',
        data_compra: data.data_compra || new Date().toISOString().split('T')[0],
        data_venda: data.data_venda || null,
        observacoes: data.observacoes || null,
        user_id: userId || data.user_id || null
      };
      
      console.log('📤 [createVehicle] Dados que serão inseridos no banco:', JSON.stringify(vehicleToInsert, null, 2));
      
      const { data: vehicle, error } = await supabase
        .from('veiculos')
        .insert([vehicleToInsert])
        .select()
        .single();

      if (error) throw error;
      
      console.log('✅ [createVehicle] Veículo retornado do banco:', JSON.stringify(vehicle, null, 2));
      
      return vehicle;
    } catch (error) {
      console.error('❌ [createVehicle] Erro ao criar veículo:', error);
      throw error;
    }
  }

  async getAllVehicles() {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      throw error;
    }
  }

  async getVehicleById(id) {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      throw error;
    }
  }

  async updateVehicle(id, data) {
    try {
      const { data: vehicle, error } = await supabase
        .from('veiculos')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return vehicle;
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      throw error;
    }
  }

  async deleteVehicle(id) {
    try {
      const { error } = await supabase
        .from('veiculos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erro ao deletar veículo:', error);
      throw error;
    }
  }

  async getVehiclesByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('status', status);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao buscar veículos por status:', error);
      throw error;
    }
  }

  // ============ GASTOS DOS VEÍCULOS ============
  
  async addGasto(gastoData) {
    try {
      console.log('💰 [addGasto] Adicionando gasto:', JSON.stringify(gastoData, null, 2));
      
      const { data: gasto, error } = await supabase
        .from('gastos_veiculos')
        .insert([{
          veiculo_id: gastoData.veiculo_id,
          tipo: gastoData.tipo || 'outro',
          descricao: gastoData.descricao,
          valor: gastoData.valor,
          data_gasto: gastoData.data_gasto || new Date().toISOString().split('T')[0],
          observacoes: gastoData.observacoes || null
        }])
        .select()
        .single();

      if (error) throw error;
      console.log('✅ [addGasto] Gasto adicionado:', gasto);
      return gasto;
    } catch (error) {
      console.error('❌ [addGasto] Erro ao adicionar gasto:', error);
      throw error;
    }
  }

  async getGastosByVeiculo(veiculoId) {
    try {
      const { data, error } = await supabase
        .from('gastos_veiculos')
        .select('*')
        .eq('veiculo_id', veiculoId)
        .order('data_gasto', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar gastos do veículo:', error);
      throw error;
    }
  }

  async getTotalGastosByVeiculo(veiculoId) {
    try {
      const gastos = await this.getGastosByVeiculo(veiculoId);
      return gastos.reduce((total, g) => total + parseFloat(g.valor || 0), 0);
    } catch (error) {
      console.error('Erro ao calcular total de gastos:', error);
      throw error;
    }
  }

  async findVehicleByModeloPlaca(modelo, placa) {
    try {
      console.log(`🔍 Buscando veículo: modelo="${modelo}" placa="${placa}"`);
      
      // Normaliza a placa removendo espaços, hífens e convertendo para maiúsculas
      const placaNormalizada = placa ? placa.replace(/[\s\-]/g, '').toUpperCase() : null;
      const modeloNormalizado = modelo ? modelo.trim() : null;
      
      console.log(`   Normalizado: modelo="${modeloNormalizado}" placa="${placaNormalizada}"`);
      
      // Busca todos os veículos
      const { data: veiculos, error } = await supabase
        .from('veiculos')
        .select('*');
      
      if (error) {
        console.error('Erro ao buscar veículos:', error);
        return null;
      }
      
      // PRIORIDADE 1: PLACA (mais confiável)
      // Se tiver placa, busca APENAS pela placa e ignora o modelo
      if (placaNormalizada) {
        console.log(`🎯 Buscando APENAS pela placa (ignorando modelo): ${placaNormalizada}`);
        
        // Função para calcular similaridade entre placas
        const similaridadePlaca = (placa1, placa2) => {
          const p1 = placa1.toUpperCase();
          const p2 = placa2.toUpperCase();
          
          // Busca exata
          if (p1 === p2) return 100;
          
          // Se uma contém a outra
          if (p1.includes(p2) || p2.includes(p1)) return 90;
          
          // Calcula caracteres em comum na mesma posição
          const minLen = Math.min(p1.length, p2.length);
          let matches = 0;
          for (let i = 0; i < minLen; i++) {
            if (p1[i] === p2[i]) matches++;
          }
          
          // Percentual de similaridade
          const maxLen = Math.max(p1.length, p2.length);
          const similarity = (matches / maxLen) * 100;
          
          return similarity;
        };
        
        // Busca exata primeiro
        let veiculoEncontrado = veiculos.find(v => {
          if (!v.placa) return false;
          const placaBD = v.placa.replace(/[\s\-]/g, '').toUpperCase();
          return placaBD === placaNormalizada;
        });
        
        // Se não encontrou exata, busca por similaridade
        if (!veiculoEncontrado) {
          let melhorMatch = null;
          let melhorScore = 0;
          
          for (const v of veiculos) {
            if (!v.placa) continue;
            const placaBD = v.placa.replace(/[\s\-]/g, '').toUpperCase();
            const score = similaridadePlaca(placaBD, placaNormalizada);
            
            console.log(`   Comparando placa "${placaNormalizada}" com "${placaBD}": ${score.toFixed(0)}%`);
            
            if (score > melhorScore) {
              melhorScore = score;
              melhorMatch = v;
            }
          }
          
          // Aceita se tiver pelo menos 60% de similaridade (bem tolerante)
          if (melhorMatch && melhorScore >= 60) {
            console.log(`✅ Veículo encontrado pela placa (${melhorScore.toFixed(0)}% similar): ${melhorMatch.marca} ${melhorMatch.modelo} - ${melhorMatch.placa}`);
            console.log(`   ℹ️  Placa informada: "${placaNormalizada}" → Placa real: "${melhorMatch.placa}"`);
            return melhorMatch;
          }
        } else {
          console.log(`✅ Veículo encontrado pela placa (exata): ${veiculoEncontrado.marca} ${veiculoEncontrado.modelo} - ${veiculoEncontrado.placa}`);
          return veiculoEncontrado;
        }
        
        console.log(`⚠️  Placa "${placaNormalizada}" não encontrada no banco (nem similar)`);
        // Se tinha placa mas não encontrou, não busca por modelo
        return null;
      }
      
      // 2. Se não encontrou pela placa, busca pelo modelo
      if (modeloNormalizado) {
        // Função para calcular similaridade entre strings
        const similaridade = (str1, str2) => {
          const s1 = str1.toLowerCase();
          const s2 = str2.toLowerCase();
          
          // Busca exata
          if (s1 === s2) return 100;
          
          // Busca com contém
          if (s1.includes(s2) || s2.includes(s1)) return 80;
          
          // Distância de Levenshtein simplificada para nomes parecidos
          // Ex: "Oroch" vs "Orochi" tem apenas 1 caractere de diferença
          const diff = Math.abs(s1.length - s2.length);
          if (diff <= 2) {
            let matches = 0;
            const minLen = Math.min(s1.length, s2.length);
            for (let i = 0; i < minLen; i++) {
              if (s1[i] === s2[i]) matches++;
            }
            const similarity = (matches / Math.max(s1.length, s2.length)) * 100;
            return similarity;
          }
          
          return 0;
        };
        
        let melhorMatch = null;
        let melhorScore = 0;
        
        for (const v of veiculos) {
          if (!v.modelo) continue;
          const score = similaridade(v.modelo, modeloNormalizado);
          console.log(`   Comparando "${modeloNormalizado}" com "${v.modelo}": ${score.toFixed(0)}%`);
          
          if (score > melhorScore) {
            melhorScore = score;
            melhorMatch = v;
          }
        }
        
        // Aceita se tiver pelo menos 70% de similaridade
        if (melhorMatch && melhorScore >= 70) {
          console.log(`✅ Veículo encontrado pelo modelo (${melhorScore.toFixed(0)}% similar): ${melhorMatch.marca} ${melhorMatch.modelo}`);
          return melhorMatch;
        }
      }
      
      console.log('⚠️  Veículo não encontrado com os critérios fornecidos');
      console.log('   Veículos disponíveis:', veiculos.map(v => `${v.marca} ${v.modelo} - ${v.placa || 'sem placa'}`));
      return null;
      
    } catch (error) {
      console.error('❌ Erro ao buscar veículo:', error);
      return null;
    }
  }

  // ============ PREFERÊNCIAS DO USUÁRIO ============
  
  async getPreference(key) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preference_value')
        .eq('preference_key', key)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = not found
        throw error;
      }
      
      return data ? data.preference_value : null;
    } catch (error) {
      console.error('Erro ao buscar preferência:', error);
      return null;
    }
  }

  async setPreference(key, value, userId = null) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({
          preference_key: key,
          preference_value: value,
          user_id: userId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'preference_key'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao salvar preferência:', error);
      throw error;
    }
  }

  async getAllPreferences() {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*');

      if (error) throw error;
      
      // Converte array para objeto chave-valor
      const preferences = {};
      data.forEach(pref => {
        preferences[pref.preference_key] = pref.preference_value;
      });
      
      return preferences;
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
      return {};
    }
  }

  // ============ ESTATÍSTICAS ============
  
  async getStats() {
    try {
      const { data: veiculos, error } = await supabase
        .from('veiculos')
        .select('*');

      if (error) throw error;

      // Busca todos os gastos
      const { data: gastos, error: gastosError } = await supabase
        .from('gastos_veiculos')
        .select('valor');

      if (gastosError) {
        console.error('Erro ao buscar gastos:', gastosError);
      }

      const totalGastos = gastos ? gastos.reduce((sum, g) => sum + parseFloat(g.valor || 0), 0) : 0;

      const veiculosVendidos = veiculos.filter(v => v.status === 'vendido');
      const totalInvestidoVendidos = veiculosVendidos.reduce((sum, v) => sum + parseFloat(v.preco_compra || 0), 0);
      const totalVendas = veiculosVendidos.reduce((sum, v) => sum + parseFloat(v.preco_venda || 0), 0);
      
      const stats = {
        total_veiculos: veiculos.length,
        em_estoque: veiculos.filter(v => v.status === 'estoque').length,
        vendidos: veiculosVendidos.length,
        total_investido: veiculos.reduce((sum, v) => sum + parseFloat(v.preco_compra || 0), 0),
        total_vendas: totalVendas,
        total_gastos: totalGastos,
        lucro_liquido: totalVendas - totalInvestidoVendidos - totalGastos
      };

      return stats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // ============ LOGS DO AGENTE ============
  
  async createAgentLog(logData, userId = null) {
    try {
      const logToInsert = {
        session_id: logData.session_id || 'default',
        command: logData.command,
        action: logData.action,
        ai_used: logData.ai_used,
        success: logData.success !== false,
        data: logData.data ? JSON.stringify(logData.data) : null,
        response: logData.response || null,
        confidence: logData.confidence || null,
        vehicle_id: logData.vehicle_id || null,
        user_id: userId || logData.user_id || null
      };
      
      console.log('📝 Salvando log:', logToInsert);
      
      const { data: log, error } = await supabase
        .from('agent_logs')
        .insert([logToInsert])
        .select()
        .single();

      if (error) throw error;
      return log;
    } catch (error) {
      console.error('Erro ao criar log do agente:', error);
      throw error;
    }
  }

  async getAgentLogs(sessionId = null) {
    try {
      let query = supabase
        .from('agent_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (sessionId) {
        query = query.eq('session_id', sessionId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Parse JSON data field
      const logs = data.map(log => ({
        ...log,
        data: log.data ? JSON.parse(log.data) : null
      }));
      
      return logs;
    } catch (error) {
      console.error('Erro ao buscar logs do agente:', error);
      throw error;
    }
  }

  async getAllSessions() {
    try {
      const { data, error } = await supabase
        .from('agent_logs')
        .select('session_id, timestamp')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Agrupa por session_id
      const sessions = {};
      data.forEach(log => {
        if (!sessions[log.session_id]) {
          sessions[log.session_id] = log.timestamp;
        }
      });

      return Object.entries(sessions).map(([session_id, timestamp]) => ({
        session_id,
        timestamp
      }));
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }
  }
}

export default new SupabaseDB();
