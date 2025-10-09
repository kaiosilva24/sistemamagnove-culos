const { supabase, requireAuth } = require('../_lib/supabase');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return requireAuth(req, res, async (req, res) => {
    const { method, query } = req;
    const { id } = query;
    const userId = req.user.id;

    try {
      switch (method) {
        case 'GET':
          // Buscar veículo por ID
          const { data: veiculo, error: getError } = await supabase
            .from('veiculos')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

          if (getError) throw getError;
          if (!veiculo) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
          }
          return res.status(200).json(veiculo);

        case 'PUT':
          // Atualizar veículo
          const { data: veiculoAtualizado, error: putError } = await supabase
            .from('veiculos')
            .update(req.body)
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

          if (putError) throw putError;
          return res.status(200).json(veiculoAtualizado);

        case 'DELETE':
          // Deletar veículo
          const { error: deleteError } = await supabase
            .from('veiculos')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

          if (deleteError) throw deleteError;
          return res.status(200).json({ message: 'Veículo deletado com sucesso' });

        default:
          return res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro em /api/veiculos/[id]:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};
