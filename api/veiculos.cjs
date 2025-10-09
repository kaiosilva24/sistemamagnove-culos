const { supabase, requireAuth } = require('./_lib/supabase');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return requireAuth(req, res, async (req, res) => {
    const { method } = req;
    const userId = req.user.id;

    try {
      switch (method) {
        case 'GET':
          // Listar todos os veículos do usuário
          const { data: veiculos, error: getError } = await supabase
            .from('veiculos')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

          if (getError) throw getError;
          return res.status(200).json(veiculos);

        case 'POST':
          // Criar novo veículo
          const { data: novoVeiculo, error: postError } = await supabase
            .from('veiculos')
            .insert([{ ...req.body, user_id: userId }])
            .select()
            .single();

          if (postError) throw postError;
          return res.status(201).json(novoVeiculo);

        default:
          return res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro em /api/veiculos:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};
