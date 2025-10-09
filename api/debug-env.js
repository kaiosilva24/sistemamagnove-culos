// DEBUG: Ver quais variáveis de ambiente estão disponíveis
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'undefined',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'DEFINIDA ✅' : 'NÃO DEFINIDA ❌',
    SUPABASE_KEY: process.env.SUPABASE_KEY ? 'DEFINIDA ✅' : 'NÃO DEFINIDA ❌',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'DEFINIDA ✅' : 'NÃO DEFINIDA ❌',
    GROQ_API_KEY: process.env.GROQ_API_KEY ? 'DEFINIDA ✅' : 'NÃO DEFINIDA ❌',
    
    // Mostrar todas as chaves de env (sem valores)
    allKeys: Object.keys(process.env).filter(k => 
      k.includes('GEMINI') || k.includes('GROQ') || k.includes('API')
    )
  };
  
  return res.status(200).json(envVars);
};
