import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY devem estar configurados no .env');
  process.exit(1);
}

export const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase conectado:', supabaseUrl);
