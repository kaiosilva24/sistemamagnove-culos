// Processar comandos de IA
module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { command, sessionId, preferredAI } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Comando é obrigatório' });
    }

    // Por enquanto, retorna uma resposta simples
    // TODO: Integrar com Gemini/Groq se as chaves estiverem configuradas
    const response = {
      success: true,
      message: `Comando recebido: ${command}`,
      action: 'processed',
      preferredAI: preferredAI || 'local',
      sessionId: sessionId || Date.now().toString()
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Erro em /api/ai/process:', error);
    return res.status(500).json({ error: error.message });
  }
};
