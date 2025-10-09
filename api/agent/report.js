// Relatório de ações do agente
const { supabase, requireAuth } = require('../_lib/supabase');

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
      // Buscar logs do agente
      const { data: logs, error } = await supabase
        .from('agent_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      return res.status(200).json({
        logs: logs || [],
        total: logs?.length || 0
      });
    } catch (error) {
      console.error('Erro em /api/agent/report:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};
