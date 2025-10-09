import { groqAgent } from './groqService.js';
import smartLocalAI from './smartLocalAI.js';
import dotenv from 'dotenv';

dotenv.config();

class HybridAI {
  constructor() {
    // Simplificado: apenas verifica se existe e não é vazio
    this.hasGemini = !!(process.env.GEMINI_API_KEY && 
                        process.env.GEMINI_API_KEY.length > 20);
    
    this.hasGroq = !!(process.env.GROQ_API_KEY && 
                      process.env.GROQ_API_KEY.length > 20);
    
    console.log('🧠 Sistema Híbrido de IA iniciado:');
    console.log(`   GEMINI_API_KEY presente: ${!!process.env.GEMINI_API_KEY}, length: ${process.env.GEMINI_API_KEY?.length || 0}`);
    console.log(`   GROQ_API_KEY presente: ${!!process.env.GROQ_API_KEY}, starts with gsk_: ${process.env.GROQ_API_KEY?.startsWith('gsk_')}`);
    console.log(`   ${this.hasGemini ? '⚠️ ' : '❌'} Gemini AI ${this.hasGemini ? '(chave presente mas pode estar inválida)' : '(não configurado)'}`);
    console.log(`   ${this.hasGroq ? '✅' : '❌'} Groq AI ${this.hasGroq ? '(ativo e funcional)' : '(não configurado)'}`);
    console.log(`   ✅ IA Local (sempre disponível)`);
  }

  async processCommand(command, preferredAI = 'auto') {
    console.log(`🎯 Processando comando: "${command}"`);
    console.log(`   Modo selecionado: ${preferredAI}`);

    const cmd = command.toLowerCase();
    
    // Detecta se é comando de adicionar gastos
    const isGasto = cmd.match(/gast(o|ei|ou)|despesa|pagou|pag(o|uei)|comprou|compra|serviço|peça|documentação/i);
    
    if (isGasto) {
      console.log('💰 ✅ GASTO DETECTADO - Processando com IA externa');
      return await this.processGastoCommand(command);
    }
    
    // Detecta se é comando de cadastro
    const isCadastro = cmd.match(/cadastr|adicionar veículo|adiciona veículo|registrar|registra|novo veículo|nova|criar veículo|cria|marca.*modelo/i);
    
    // === CADASTROS: Sempre usa Gemini/Groq (IA Externa) ===
    if (isCadastro) {
      console.log('🚗 ✅ CADASTRO DETECTADO - Usando apenas Gemini/Groq (sem IA Local)');
      
      const errors = [];
      
      // 1. Tenta Groq PRIMEIRO (mais estável e rápido)
      if (this.hasGroq) {
        console.log('⚡ Tentando Groq AI (prioridade)...');
        try {
          const result = await this.processWithGroq(command);
          console.log('📊 Resultado do Groq:', JSON.stringify(result, null, 2));
          
          if (result && result.action === 'create_vehicle') {
            console.log('✅ Sucesso com Groq AI!');
            return { ...result, processedBy: 'groq' };
          } else {
            const errorMsg = result?.response || 'Groq não retornou ação de cadastro';
            console.warn('⚠️  Groq retornou resultado inválido:', errorMsg);
            errors.push(`Groq: ${errorMsg}`);
          }
        } catch (error) {
          console.error('❌ Groq falhou com exceção:');
          console.error('   Mensagem:', error.message);
          console.error('   Stack:', error.stack);
          errors.push(`Groq: ${error.message}`);
        }
      } else {
        console.log('⚠️  Groq não configurado');
        errors.push('Groq: não configurado');
      }

      // 2. Tenta Gemini como fallback
      if (this.hasGemini) {
        console.log('🌟 Tentando Gemini AI (fallback)...');
        try {
          const result = await this.processWithGemini(command);
          console.log('📊 Resultado do Gemini:', JSON.stringify(result, null, 2));
          
          if (result && result.action === 'create_vehicle') {
            console.log('✅ Sucesso com Gemini AI!');
            return { ...result, processedBy: 'gemini' };
          } else {
            const errorMsg = result?.response || 'Gemini não retornou ação de cadastro';
            console.warn('⚠️  Gemini retornou resultado inválido:', errorMsg);
            errors.push(`Gemini: ${errorMsg}`);
          }
        } catch (error) {
          console.error('❌ Gemini falhou com exceção:');
          console.error('   Mensagem:', error.message);
          console.error('   Stack:', error.stack);
          errors.push(`Gemini: ${error.message}`);
        }
      } else {
        console.log('⚠️  Gemini não configurado');
        errors.push('Gemini: não configurado');
      }
      
      // Se chegou aqui, nenhuma IA externa funcionou
      console.error('❌ Todas as IAs falharam:', errors);
      return {
        action: 'error',
        response: `❌ Erro: Não foi possível processar o cadastro.\n\nDetalhes:\n${errors.join('\n')}`,
        confidence: 0,
        processedBy: 'none',
        errors: errors
      };
    }

    // === CONSULTAS: Usa IA Local (rápido e eficiente) ===
    console.log('📊 Comando de consulta - usando IA Local');
    const localResult = smartLocalAI.processCommand(command);
    return { ...localResult, processedBy: 'local' };
  }

  async processWithGemini(command) {
    try {
      console.log('🌟 Usando Gemini AI para processar:', command);
      
      // Importa diretamente o SDK do Gemini para evitar dependências problemáticas
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `Você é um assistente especializado em extrair informações de veículos.

Analise o seguinte comando em português e extraia os dados do veículo:
"${command}"

Retorne APENAS um objeto JSON válido (sem markdown, sem explicações) com esta estrutura:
{
  "marca": "string ou null",
  "modelo": "string ou null",
  "ano": number ou null,
  "cor": "string ou null",
  "placa": "string ou null",
  "km": number ou null,
  "preco_compra": number ou null
}

REGRAS IMPORTANTES:
1. Marcas comuns: Honda, Toyota, Fiat, Volkswagen, VW, Chevrolet, Ford, Hyundai, Nissan, Renault
2. Converta valores monetários: "50 mil" = 50000, "80k" = 80000, "R$ 45.000" = 45000, "valor 60000" = 60000
3. Converta quilometragem: "100 mil km" = 100000, "80k km" = 80000, "quilometragem 80000" = 80000
4. Anos válidos: 1980-2025 (apenas 4 dígitos)
5. Cores: preto, branco, branca, prata, cinza, vermelho, azul, verde, amarelo, etc.
6. Placa: formato brasileiro (ABC1234 ou ABC-1234 ou NLD4460)
7. Preço pode ser mencionado como: "valor", "preço", "por", "R$", "reais"
8. Se não encontrar um dado, use null

EXEMPLOS:
- "cadastrar honda civic 2020 preto 50 mil" → {"marca":"Honda","modelo":"Civic","ano":2020,"cor":"preto","preco_compra":50000}
- "fiat uno 2015 branco 100 mil km por 30000" → {"marca":"Fiat","modelo":"Uno","ano":2015,"cor":"branco","km":100000,"preco_compra":30000}
- "honda civic 2020 valor 60000 quilometragem 80000 placa NLD4460 cor branca" → {"marca":"Honda","modelo":"Civic","ano":2020,"preco_compra":60000,"km":80000,"placa":"NLD4460","cor":"branca"}

Retorne APENAS o JSON, sem texto adicional.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();

      console.log('📥 Resposta bruta do Gemini:', text);

      // Remove markdown e limpa o texto
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Remove possíveis textos antes/depois do JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      const vehicleData = JSON.parse(text);

      console.log('✅ Dados extraídos pelo Gemini:', vehicleData);

      if (vehicleData.marca && vehicleData.modelo) {
        return {
          action: 'create_vehicle',
          data: {
            ...vehicleData,
            status: 'estoque',
            data_compra: new Date().toISOString().split('T')[0]
          },
          response: `Entendido! Processando...`,
          confidence: 0.95
        };
      }

      return {
        action: 'error',
        response: 'Não consegui identificar a marca e modelo do veículo. Tente: "Cadastrar Honda Civic 2020 ok"',
        confidence: 0.3
      };

    } catch (error) {
      console.error('❌ Erro no Gemini:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  async processWithGroq(command) {
    try {
      console.log('⚡ Usando Groq AI para processar:', command);
      
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const prompt = `Você é um assistente especializado em extrair informações de veículos.

Analise o seguinte comando em português e extraia os dados do veículo:
"${command}"

Retorne APENAS um objeto JSON válido (sem markdown, sem explicações) com esta estrutura:
{
  "marca": "string ou null",
  "modelo": "string ou null",
  "ano": number ou null,
  "cor": "string ou null",
  "placa": "string ou null",
  "km": number ou null,
  "preco_compra": number ou null
}

REGRAS IMPORTANTES:
1. Marcas comuns: Honda, Toyota, Fiat, Volkswagen, VW, Chevrolet, Ford, Hyundai, Nissan, Renault
2. Converta valores monetários: "50 mil" = 50000, "80k" = 80000, "R$ 45.000" = 45000, "valor 60000" = 60000
3. Converta quilometragem: "100 mil km" = 100000, "80k km" = 80000, "quilometragem 80000" = 80000
4. Anos válidos: 1980-2025 (apenas 4 dígitos)
5. Cores: preto, branco, branca, prata, cinza, vermelho, azul, verde, amarelo, etc.
6. Placa: formato brasileiro (ABC1234 ou ABC-1234 ou NLD4460)
7. Preço pode ser mencionado como: "valor", "preço", "por", "R$", "reais"
8. Se não encontrar um dado, use null

EXEMPLOS:
- "cadastrar honda civic 2020 preto 50 mil km" → {"marca":"Honda","modelo":"Civic","ano":2020,"cor":"preto","km":50000}
- "fiat uno 2015 branco 100 mil km por 30000" → {"marca":"Fiat","modelo":"Uno","ano":2015,"cor":"branco","km":100000,"preco_compra":30000}
- "honda civic 2020 valor 60000 quilometragem 80000 placa NLD4460 cor branca" → {"marca":"Honda","modelo":"Civic","ano":2020,"preco_compra":60000,"km":80000,"placa":"NLD4460","cor":"branca"}

Retorne APENAS o JSON, sem texto adicional.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um extrator de dados. Retorne APENAS JSON puro, sem markdown ou explicações.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 300,
      });

      let text = completion.choices[0]?.message?.content || '{}';
      
      console.log('📥 Resposta bruta do Groq:', text);
      
      // Remove markdown se houver
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Remove possíveis textos antes/depois do JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        text = jsonMatch[0];
      }

      const vehicleData = JSON.parse(text);
      
      console.log('✅ Dados extraídos pelo Groq:', vehicleData);

      if (vehicleData.marca && vehicleData.modelo) {
        return {
          action: 'create_vehicle',
          data: {
            ...vehicleData,
            status: 'estoque',
            data_compra: new Date().toISOString().split('T')[0]
          },
          response: `Entendido! Processando...`,
          confidence: 0.92
        };
      }

      return {
        action: 'error',
        response: 'Não consegui identificar a marca e modelo do veículo.',
        confidence: 0.3
      };

    } catch (error) {
      console.error('❌ Erro no Groq:', error.message);
      console.error('Stack:', error.stack);
      throw error;
    }
  }

  async processWithGroqDirect(command) {
    try {
      const prompt = `Extraia informações de veículo deste comando: "${command}"

Retorne JSON puro (sem markdown):
{
  "marca": "string",
  "modelo": "string", 
  "ano": number,
  "cor": "string",
  "km": number,
  "preco_compra": number
}

Regras:
- "50 mil" = 50000
- "100k km" = 100000
- Apenas JSON puro`;

      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um extrator de dados. Retorne APENAS JSON puro, sem markdown ou explicações.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 300,
      });

      let text = completion.choices[0]?.message?.content || '{}';
      
      // Remove markdown se houver
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

      const vehicleData = JSON.parse(text);

      if (vehicleData.marca && vehicleData.modelo) {
        return {
          action: 'create_vehicle',
          data: {
            ...vehicleData,
            status: 'estoque',
            data_compra: new Date().toISOString().split('T')[0]
          },
          response: `Entendido! Processando...`,
          confidence: 0.92
        };
      }

      return {
        action: 'error',
        response: 'Não consegui identificar marca e modelo.',
        confidence: 0.3
      };

    } catch (error) {
      console.error('❌ Erro no Groq:', error);
      throw error;
    }
  }

  async processGastoCommand(command) {
    try {
      console.log('💰 Processando comando de gasto:', command);
      
      if (!this.hasGroq) {
        return {
          action: 'error',
          response: '❌ Groq AI não está configurado para processar gastos.',
          confidence: 0
        };
      }
      
      const Groq = (await import('groq-sdk')).default;
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      const prompt = `Você é um assistente especializado em extrair informações de gastos de veículos.

Analise o seguinte comando e extraia as informações:
"${command}"

Retorne APENAS um objeto JSON válido (sem markdown) com esta estrutura:
{
  "modelo": "string ou null",
  "placa": "string ou null",
  "gastos": [
    {
      "tipo": "peça|serviço|documentação|manutenção|outro",
      "descricao": "string",
      "valor": number
    }
  ]
}

REGRAS:
1. Tipos válidos: "peça", "serviço", "documentação", "manutenção", "outro"
2. Extraia TODOS os gastos mencionados no comando
3. Valores: "80 reais" = 80, "R$ 200" = 200
4. Se mencionar modelo (ex: "Civic", "Gol"), extraia
5. Se mencionar placa (ex: "ABC1234"), extraia

EXEMPLOS:
- "gol placa abc1234 gastei 80 reais em peça e 200 em serviço" → {"modelo":"Gol","placa":"ABC1234","gastos":[{"tipo":"peça","descricao":"peça","valor":80},{"tipo":"serviço","descricao":"serviço","valor":200}]}
- "civic gastei 150 em documentação" → {"modelo":"Civic","placa":null,"gastos":[{"tipo":"documentação","descricao":"documentação","valor":150}]}

Retorne APENAS o JSON.`;

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'Você é um extrator de dados. Retorne APENAS JSON puro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        max_tokens: 500,
      });

      let text = completion.choices[0]?.message?.content || '{}';
      console.log('📥 Resposta bruta do Groq:', text);
      
      // Remove markdown
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) text = jsonMatch[0];

      const data = JSON.parse(text);
      console.log('✅ Dados extraídos:', JSON.stringify(data, null, 2));

      if (!data.gastos || data.gastos.length === 0) {
        return {
          action: 'error',
          response: 'Não consegui identificar gastos no comando. Tente: "Gol placa ABC1234 gastei 80 reais em peça"',
          confidence: 0.3
        };
      }

      return {
        action: 'add_gastos',
        data: data,
        response: `Entendido! Processando...`,
        confidence: 0.9,
        processedBy: 'groq'
      };

    } catch (error) {
      console.error('❌ Erro ao processar gasto:', error);
      return {
        action: 'error',
        response: 'Erro ao processar comando de gasto: ' + error.message,
        confidence: 0
      };
    }
  }

  getStatus() {
    return {
      gemini: this.hasGemini,
      groq: this.hasGroq,
      local: true
    };
  }
}

const hybridAI = new HybridAI();

export default hybridAI;
