const { supabase, requireAuth } = require('../../_lib/supabase');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  // GET - Buscar gastos de um veículo
  if (req.method === 'GET') {
    return requireAuth(req, res, async (req, res) => {
      const userId = req.user.id;

      try {
        // Verificar se o veículo pertence ao usuário
        const { data: veiculo, error: veiculoError } = await supabase
          .from('veiculos')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (veiculoError || !veiculo) {
          return res.status(404).json({ error: 'Veículo não encontrado' });
        }

        // Buscar gastos do veículo
        const { data: gastos, error: gastosError } = await supabase
          .from('gastos')
          .select('*')
          .eq('vehicle_id', id)
          .order('data', { ascending: false });

        if (gastosError) {
          throw gastosError;
        }

        // Calcular total
        const total = gastos.reduce((sum, g) => sum + parseFloat(g.valor || 0), 0);

        return res.status(200).json({
          gastos: gastos || [],
          total: total
        });
      } catch (error) {
        console.error('Erro ao buscar gastos:', error);
        return res.status(500).json({ error: error.message });
      }
    });
  }

  // POST - Adicionar gasto
  if (req.method === 'POST') {
    return requireAuth(req, res, async (req, res) => {
      const userId = req.user.id;
      const { tipo, valor, descricao, data } = req.body;

      try {
        // Verificar se o veículo pertence ao usuário
        const { data: veiculo, error: veiculoError } = await supabase
          .from('veiculos')
          .select('id')
          .eq('id', id)
          .eq('user_id', userId)
          .single();

        if (veiculoError || !veiculo) {
          return res.status(404).json({ error: 'Veículo não encontrado' });
        }

        // Inserir gasto
        const { data: gasto, error: gastoError } = await supabase
          .from('gastos')
          .insert([{
            vehicle_id: id,
            tipo: tipo,
            valor: valor,
            descricao: descricao || '',
            data: data || new Date().toISOString().split('T')[0]
          }])
          .select()
          .single();

        if (gastoError) {
          throw gastoError;
        }

        return res.status(201).json(gasto);
      } catch (error) {
        console.error('Erro ao adicionar gasto:', error);
        return res.status(500).json({ error: error.message });
      }
    });
  }

  return res.status(405).json({ error: 'Método não permitido' });
};
