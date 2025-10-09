import { supabase, requireAuth } from './_lib/supabase.js';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
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
          // Buscar todas as preferências do usuário
          const { data: prefs, error: getError } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', userId);

          if (getError) throw getError;
          return res.status(200).json(prefs || []);

        case 'POST':
          // Salvar/Atualizar preferência
          const { key, value } = req.body;
          
          if (!key) {
            return res.status(400).json({ error: 'Key é obrigatória' });
          }

          // Usar upsert para inserir ou atualizar
          const { data: pref, error: postError } = await supabase
            .from('user_preferences')
            .upsert(
              { user_id: userId, preference_key: key, preference_value: value },
              { onConflict: 'user_id,preference_key' }
            )
            .select()
            .single();

          if (postError) throw postError;
          return res.status(200).json(pref);

        default:
          return res.status(405).json({ error: 'Método não permitido' });
      }
    } catch (error) {
      console.error('Erro em /api/preferences:', error);
      return res.status(500).json({ error: error.message });
    }
  });
}
