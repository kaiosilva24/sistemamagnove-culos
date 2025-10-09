const { supabase, requireAuth } = require('../../../_lib/supabase');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id, gastoId } = req.query;
  console.log('🗑️ Rota gasto - Vehicle ID:', id, 'Gasto ID:', gastoId, 'Method:', req.method);

  // DELETE - Deletar gasto
  if (req.method === 'DELETE') {
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

        // Deletar gasto
        const { error: deleteError } = await supabase
          .from('gastos')
          .delete()
          .eq('id', gastoId)
          .eq('vehicle_id', id);

        if (deleteError) {
          throw deleteError;
        }

        return res.status(200).json({ success: true, message: 'Gasto deletado com sucesso' });
      } catch (error) {
        console.error('Erro ao deletar gasto:', error);
        return res.status(500).json({ error: error.message });
      }
    });
  }

  return res.status(405).json({ error: 'Método não permitido' });
};
