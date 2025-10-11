const { supabase, requireAuth } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  return requireAuth(req, res, async (req, res) => {
    const userId = req.user.id;

    try {
      // Buscar todos os veículos
      const { data: veiculos, error: veiculosError } = await supabase
        .from('veiculos')
        .select('*')
        .eq('user_id', userId);

      if (veiculosError) throw veiculosError;

      // Buscar todos os gastos - só se houver veículos
      let gastos = [];
      if (veiculos && veiculos.length > 0) {
        const veiculoIds = veiculos.map(v => v.id);
        const { data: gastosData, error: gastosError } = await supabase
          .from('gastos')
          .select('valor, vehicle_id')
          .in('vehicle_id', veiculoIds);

        if (gastosError) {
          console.error('Erro ao buscar gastos:', gastosError);
          throw gastosError;
        }
        
        gastos = gastosData || [];
      }

      // Calcular estatísticas
      const total = veiculos.length;
      const estoque = veiculos.filter(v => v.status === 'estoque').length;
      const vendidos = veiculos.filter(v => v.status === 'vendido').length;
      
      const totalInvestido = veiculos.reduce((sum, v) => sum + (parseFloat(v.preco_compra) || 0), 0);
      const totalVendas = veiculos
        .filter(v => v.status === 'vendido')
        .reduce((sum, v) => sum + (parseFloat(v.preco_venda) || 0), 0);
      
      // Calcular total de gastos com log detalhado
      const totalGastos = gastos.reduce((sum, g) => {
        const valor = parseFloat(g.valor) || 0;
        return sum + valor;
      }, 0);
      
      const lucroLiquido = totalVendas - totalInvestido - totalGastos;

      // Log para debug
      console.log('📊 Dashboard Stats:', {
        veiculos: veiculos.length,
        gastos: gastos.length,
        totalGastos: totalGastos,
        gastosIndividuais: gastos.map(g => ({ vehicle_id: g.vehicle_id, valor: g.valor }))
      });

      const stats = {
        total_veiculos: total,
        em_estoque: estoque,
        vendidos: vendidos,
        total_investido: totalInvestido,
        total_vendas: totalVendas,
        total_gastos: totalGastos,
        lucro_liquido: lucroLiquido,
        veiculos,
        debug_gastos_count: gastos.length
      };

      return res.status(200).json(stats);
    } catch (error) {
      console.error('Erro em /api/dashboard:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};
