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

      // Buscar todos os gastos
      const { data: gastos, error: gastosError } = await supabase
        .from('gastos')
        .select('valor, vehicle_id')
        .in('vehicle_id', veiculos.map(v => v.id));

      if (gastosError) throw gastosError;

      // Calcular estatísticas
      const total = veiculos.length;
      const estoque = veiculos.filter(v => v.status === 'estoque').length;
      const vendidos = veiculos.filter(v => v.status === 'vendido').length;
      
      const totalInvestido = veiculos.reduce((sum, v) => sum + (parseFloat(v.preco_compra) || 0), 0);
      const totalVendas = veiculos
        .filter(v => v.status === 'vendido')
        .reduce((sum, v) => sum + (parseFloat(v.preco_venda) || 0), 0);
      
      const totalGastos = gastos.reduce((sum, g) => sum + (parseFloat(g.valor) || 0), 0);
      const lucroLiquido = totalVendas - totalInvestido - totalGastos;

      const stats = {
        total,
        estoque,
        vendidos,
        totalInvestido,
        totalVendas,
        totalGastos,
        lucroLiquido,
        veiculos
      };

      return res.status(200).json(stats);
    } catch (error) {
      console.error('Erro em /api/dashboard:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};
