import { GoogleGenerativeAI } from '@google/generative-ai';
import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env
let GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.+)/);
    if (match) {
      GEMINI_API_KEY = match[1].trim();
    }
  }
} catch (error) {
  console.warn('GEMINI_API_KEY não encontrada');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
// Usando gemini-1.5-flash (mais rápido e com limites mais generosos)
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

class SimpleGeminiAgent {
  async processCommand(userCommand) {
    try {
      console.log('🤖 [1] Gemini processando:', userCommand);

      // Busca dados atuais do sistema
      console.log('📊 [2] Buscando dados do sistema...');
      const veiculos = db.prepare('SELECT * FROM veiculos').all();
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'estoque' THEN 1 ELSE 0 END) as estoque,
          SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendidos
        FROM veiculos
      `).get();
      console.log('✅ [3] Dados obtidos:', stats);

      const prompt = `Você é um assistente de gestão de veículos.

DADOS ATUAIS DO SISTEMA:
- Total de veículos: ${stats.total}
- Em estoque: ${stats.estoque}
- Vendidos: ${stats.vendidos}

VEÍCULOS CADASTRADOS:
${veiculos.map(v => `- ${v.marca} ${v.modelo} ${v.ano || ''} (${v.status})`).join('\n')}

COMANDO DO USUÁRIO: "${userCommand}"

Analise o comando e responda de forma amigável e útil em português do Brasil.
Se for uma pergunta sobre dados, use as informações acima.
Se for um comando para cadastrar/adicionar/deletar algo, explique que precisa de confirmação.

Seja conversacional e direto.`;

      console.log('📤 [4] Enviando para Gemini API...');
      const result = await model.generateContent(prompt);
      
      console.log('📥 [5] Recebendo resposta...');
      const response = await result.response;
      const text = response.text();

      console.log('✅ [6] Gemini respondeu:', text);

      return {
        action: 'success',
        response: text,
        confidence: 0.9
      };

    } catch (error) {
      console.error('❌ [ERRO] Detalhes completos:');
      console.error('   Mensagem:', error.message);
      
      // Detecta erro de rate limit
      if (error.message && error.message.includes('rate limit')) {
        console.warn('⚠️  Limite de taxa do Gemini atingido. Aguarde alguns minutos.');
        return {
          action: 'rate_limit',
          response: 'O limite da API do Gemini foi atingido. Por favor, aguarde 1-2 minutos e tente novamente. Ou use comandos mais simples enquanto isso.',
          confidence: 0,
          error: 'Rate limit atingido'
        };
      }
      
      // Fallback amigável para outros erros
      return {
        action: 'error',
        response: 'No momento estou com dificuldade para processar. Aguarde um momento e tente novamente.',
        confidence: 0,
        error: error.message
      };
    }
  }
}

const hasApiKey = GEMINI_API_KEY && GEMINI_API_KEY.startsWith('AIza');

if (hasApiKey) {
  console.log('✅ Gemini AI ativado');
} else {
  console.warn('⚠️  Gemini API Key não encontrada');
}

const geminiAgent = new SimpleGeminiAgent();

export { geminiAgent, hasApiKey };
