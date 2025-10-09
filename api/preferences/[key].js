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
    const { query } = req;
    const { key } = query;
    const userId = req.user.id;

    try {
      const { data: pref, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .eq('preference_key', key)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return res.status(200).json(pref || { value: null });
    } catch (error) {
      console.error('Erro em /api/preferences/[key]:', error);
      return res.status(500).json({ error: error.message });
    }
  });
};
