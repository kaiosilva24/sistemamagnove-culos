// API serverless principal para Vercel
// Este arquivo redireciona para as rotas específicas
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'API MAGNO rodando no Vercel',
    version: '2.0',
    endpoints: [
      '/api/health',
      '/api/veiculos',
      '/api/dashboard',
      '/api/ai/status',
      '/api/ai/process',
      '/api/preferences'
    ]
  });
}
