import Groq from 'groq-sdk';
import db from './database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega API Key
let GROQ_API_KEY = process.env.GROQ_API_KEY || '';
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GROQ_API_KEY=(.+)/);
    if (match) {
      GROQ_API_KEY = match[1].trim();
    }
  }
} catch (error) {
  console.warn('GROQ_API_KEY não encontrada');
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

class GroqAgent {
  async processCommand(userCommand) {
    try {
      console.log('⚡ [1] Groq processando:', userCommand);

      // Busca dados atuais do sistema
      console.log('📊 [2] Buscando dados do sistema...');
      const veiculos = db.prepare('SELECT * FROM veiculos').all();
      const stats = db.prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'estoque' THEN 1 ELSE 0 END) as estoque,
          SUM(CASE WHEN status = 'vendido' THEN 1 ELSE 0 END) as vendidos,
          COALESCE(SUM(preco_compra), 0) as total_investido,
          COALESCE(SUM(CASE WHEN status = 'vendido' THEN preco_venda ELSE 0 END), 0) as total_vendas
        FROM veiculos
      `).get();
      
      const gastos = db.prepare('SELECT COALESCE(SUM(valor), 0) as total FROM gastos').get();
      const lucro = stats.total_vendas - stats.total_investido - gastos.total;
      
      console.log('✅ [3] Dados obtidos:', stats);

      const systemPrompt = `Você é MAGNO, um assistente inteligente de gestão de veículos.

DADOS ATUAIS DO SISTEMA:
- Total de veículos: ${stats.total}
- Em estoque: ${stats.estoque}
- Vendidos: ${stats.vendidos}
- Total investido: R$ ${stats.total_investido.toLocaleString('pt-BR')}
- Total vendas: R$ ${stats.total_vendas.toLocaleString('pt-BR')}
- Total gastos: R$ ${gastos.total.toLocaleString('pt-BR')}
- Lucro líquido: R$ ${lucro.toLocaleString('pt-BR')}

VEÍCULOS CADASTRADOS:
${veiculos.length > 0 ? veiculos.map(v => 
  `- ${v.marca} ${v.modelo} ${v.ano || ''} (${v.status}) - Compra: R$ ${v.preco_compra}${v.status === 'vendido' && v.preco_venda ? `, Venda: R$ ${v.preco_venda}` : ''}`
).join('\n') : 'Nenhum veículo cadastrado ainda.'}

REGRAS:
1. Responda SEMPRE em português do Brasil
2. Seja conversacional, amigável e direto
3. Use os dados acima para responder perguntas
4. Para comandos de ação (cadastrar, adicionar, deletar), explique que precisa de confirmação
5. Seja conciso mas informativo
6. Use emojis quando apropriado para deixar mais amigável
7. Se não souber algo, seja honesto`;

      console.log('📤 [4] Enviando para Groq API...');
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userCommand
          }
        ],
        model: 'llama-3.3-70b-versatile', // Modelo mais recente e poderoso
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
      });

      console.log('📥 [5] Recebendo resposta...');
      const responseText = completion.choices[0]?.message?.content || 'Desculpe, não consegui processar.';

      console.log('✅ [6] Groq respondeu:', responseText);

      // Detecta se é um comando de ação
      const isActionCommand = userCommand.toLowerCase().match(
        /(cadastr|adicionar|registrar|delet|remov|vend|marc|atuali|mud)/
      );

      return {
        action: isActionCommand ? 'pending' : 'success',
        response: responseText,
        confidence: 0.95,
        needs_confirmation: !!isActionCommand
      };

    } catch (error) {
      console.error('❌ [ERRO Groq] Detalhes:');
      console.error('   Mensagem:', error.message);
      
      // Detecta diferentes tipos de erro
      if (error.message && error.message.includes('rate limit')) {
        console.warn('⚠️  Limite de taxa do Groq atingido.');
        return {
          action: 'rate_limit',
          response: 'Estou processando muitas requisições. Aguarde alguns segundos e tente novamente.',
          confidence: 0,
          error: 'Rate limit'
        };
      }
      
      if (error.message && error.message.includes('API key')) {
        console.error('❌ Problema com API Key do Groq');
        return {
          action: 'error',
          response: 'Há um problema com a configuração da API. Verifique a chave.',
          confidence: 0,
          error: 'API Key inválida'
        };
      }
      
      return {
        action: 'error',
        response: 'Tive um problema técnico. Por favor, tente novamente.',
        confidence: 0,
        error: error.message
      };
    }
  }
}

const hasApiKey = GROQ_API_KEY && GROQ_API_KEY.startsWith('gsk_');

if (hasApiKey) {
  console.log('⚡ Groq AI ativado (Llama 3.1 70B - Super Rápido!)');
} else {
  console.warn('⚠️  Groq API Key não encontrada');
}

const groqAgent = new GroqAgent();

export { groqAgent, hasApiKey };
