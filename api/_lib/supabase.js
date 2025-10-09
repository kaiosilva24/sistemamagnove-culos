// Cliente Supabase para API serverless
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL ou SUPABASE_KEY não configuradas');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Função para verificar autenticação do usuário
async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    return null;
  }
}

// Middleware para requisições autenticadas
async function requireAuth(req, res, handler) {
  const user = await getUserFromRequest(req);
  
  if (!user) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  
  req.user = user;
  return handler(req, res);
}

module.exports = { supabase, getUserFromRequest, requireAuth };
