import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY devem estar configuradas no .env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
