const { supabase, requireAuth } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  console.log('🗑️ Deletar gasto - ID:', id, 'Method:', req.method);

  // DELETE - Deletar gasto
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (req, res) => {
      const userId = req.user.id;

      try {
        // Verificar se o gasto pertence a um veículo do usuário
        const { data: gasto, error: gastoError } = await supabase
          .from('gastos')
          .select('vehicle_id, veiculos!inner(user_id)')
          .eq('id', id)
          .single();

        if (gastoError || !gasto) {
          return res.status(404).json({ error: 'Gasto não encontrado' });
        }

        // Verificar se o veículo pertence ao usuário
        if (gasto.veiculos.user_id !== userId) {
          return res.status(403).json({ error: 'Sem permissão para deletar este gasto' });
        }

        // Deletar gasto
        const { error: deleteError } = await supabase
          .from('gastos')
          .delete()
          .eq('id', id);

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

  // GET - Buscar gasto específico
  if (req.method === 'GET') {
    return requireAuth(req, res, async (req, res) => {
      const userId = req.user.id;

      try {
        const { data: gasto, error: gastoError } = await supabase
          .from('gastos')
          .select('*, veiculos!inner(user_id)')
          .eq('id', id)
          .single();

        if (gastoError || !gasto) {
          return res.status(404).json({ error: 'Gasto não encontrado' });
        }

        if (gasto.veiculos.user_id !== userId) {
          return res.status(403).json({ error: 'Sem permissão' });
        }

        return res.status(200).json(gasto);
      } catch (error) {
        console.error('Erro ao buscar gasto:', error);
        return res.status(500).json({ error: error.message });
      }
    });
  }

  return res.status(405).json({ error: 'Método não permitido' });
};
