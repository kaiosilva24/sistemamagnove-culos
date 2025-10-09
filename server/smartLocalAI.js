import db from './database.js';

class SmartLocalAI {
  processCommand(command) {
    const cmd = command.toLowerCase().trim();
    console.log('🧠 IA Local Inteligente processando:', cmd);
    console.log('   📝 Comando original:', command);

    // Busca dados do sistema
    const stats = this.getStats();
    const veiculos = db.prepare('SELECT * FROM veiculos').all();

    // Detecção de intenção por palavras-chave
    
    // === CONSULTAS DE QUANTIDADE ===
    if (cmd.match(/quantos? (veículos?|carros?|automóveis?)/i) || cmd.match(/total de (veículos?|carros?)/i)) {
      if (cmd.includes('estoque')) {
        return this.success(`Você tem ${stats.estoque} veículos em estoque no momento.`);
      }
      if (cmd.includes('vendido')) {
        return this.success(`Foram vendidos ${stats.vendidos} veículos até agora.`);
      }
      return this.success(`Você tem ${stats.total} veículos cadastrados no total. ${stats.estoque} em estoque e ${stats.vendidos} já vendidos.`);
    }

    // === LUCRO ===
    if (cmd.match(/lucro|lucrativ|profit|ganhei|ganho/i)) {
      const lucro = stats.total_vendas - stats.total_investido - stats.total_gastos;
      return this.success(
        `Seu lucro líquido é de R$ ${this.formatMoney(lucro)}.\n` +
        `Vendas: R$ ${this.formatMoney(stats.total_vendas)}\n` +
        `Investimento: R$ ${this.formatMoney(stats.total_investido)}\n` +
        `Gastos: R$ ${this.formatMoney(stats.total_gastos)}`
      );
    }

    // === VENDAS ===
    if (cmd.match(/vend(as|i|eu|ido)/i)) {
      return this.success(
        `Você vendeu ${stats.vendidos} veículos, totalizando R$ ${this.formatMoney(stats.total_vendas)}.`
      );
    }

    // === ESTOQUE ===
    if (cmd.match(/estoque|disponível|disponivel|tem pra vender/i)) {
      if (stats.estoque === 0) {
        return this.success('Você não tem veículos em estoque no momento.');
      }
      const emEstoque = veiculos.filter(v => v.status === 'estoque');
      const lista = emEstoque.map(v => `${v.marca} ${v.modelo} ${v.ano || ''} - R$ ${this.formatMoney(v.preco_compra)}`).join('\n');
      return this.success(
        `Você tem ${stats.estoque} veículos em estoque:\n${lista}`
      );
    }

    // === GASTOS ===
    if (cmd.match(/gast(o|ei|os)|despesa|custo/i)) {
      return this.success(
        `Total de gastos: R$ ${this.formatMoney(stats.total_gastos)}`
      );
    }

    // === INVESTIMENTO ===
    if (cmd.match(/invest(i|ido)|total compra|gastei comprando/i)) {
      return this.success(
        `Total investido em compras: R$ ${this.formatMoney(stats.total_investido)}`
      );
    }

    // === CADASTRAR VEÍCULO === (PRIORIDADE ALTA - Antes de buscar)
    // Detecta várias formas: "cadastrar", "cadastra", "o cadastro é", "adicionar", etc.
    if (cmd.match(/cadastr(ar|a|o|e|ro)|adicionar|adiciona|registrar|registra|novo|nova|criar|cria|o cadastro|esse veículo|novo veículo/i)) {
      console.log('   ✅ Detectado comando de CADASTRO!');
      const vehicleData = this.extractVehicleData(command);
      console.log('   📊 Dados extraídos:', vehicleData);
      
      // Se conseguiu extrair dados suficientes, cria o veículo
      if (vehicleData.marca && vehicleData.modelo) {
        console.log('   ✅ Marca e modelo encontrados! Retornando create_vehicle');
        return {
          action: 'create_vehicle',
          data: vehicleData,
          response: `Cadastrando veículo: ${vehicleData.marca} ${vehicleData.modelo}...`,
          confidence: 0.9
        };
      }
      
      console.log('   ❌ Marca ou modelo não encontrados');
      // Senão, pede mais informações
      return this.success(
        `Para cadastrar um veículo, preciso de pelo menos a marca e modelo.\n\n` +
        `Exemplo: "Cadastrar Honda Civic 2020 preto por 50000 ok"\n` +
        `Ou: "Adicionar Fiat Uno 2015 branco comprei por 30000 ok"`
      );
    }

    // === BUSCAR VEÍCULO ESPECÍFICO ===
    // Verifica explicitamente se é uma busca (não um cadastro)
    const isBusca = cmd.match(/mostrar|buscar|procurar|encontrar|listar|ver/i);
    const marcas = ['honda', 'toyota', 'fiat', 'volkswagen', 'chevrolet', 'ford', 'hyundai', 'nissan'];
    const marcaEncontrada = marcas.find(m => cmd.includes(m));
    
    if (marcaEncontrada && isBusca) {
      const veiculosMarca = veiculos.filter(v => 
        v.marca.toLowerCase().includes(marcaEncontrada) ||
        v.modelo.toLowerCase().includes(marcaEncontrada)
      );
      
      if (veiculosMarca.length === 0) {
        return this.success(`Não encontrei nenhum ${marcaEncontrada} cadastrado.`);
      }
      
      const lista = veiculosMarca.map(v => 
        `${v.marca} ${v.modelo} ${v.ano || ''} (${v.status}) - Compra: R$ ${this.formatMoney(v.preco_compra)}${v.preco_venda ? `, Venda: R$ ${this.formatMoney(v.preco_venda)}` : ''}`
      ).join('\n');
      
      return this.success(
        `Encontrei ${veiculosMarca.length} veículo(s):\n${lista}`
      );
    }

    // === ESTATÍSTICAS GERAIS ===
    if (cmd.match(/estatística|dashboard|resumo|panorama|visão geral/i)) {
      return this.success(
        `📊 Estatísticas Gerais:\n` +
        `Total de veículos: ${stats.total}\n` +
        `Em estoque: ${stats.estoque}\n` +
        `Vendidos: ${stats.vendidos}\n` +
        `Total investido: R$ ${this.formatMoney(stats.total_investido)}\n` +
        `Total vendas: R$ ${this.formatMoney(stats.total_vendas)}\n` +
        `Total gastos: R$ ${this.formatMoney(stats.total_gastos)}\n` +
        `Lucro líquido: R$ ${this.formatMoney(stats.total_vendas - stats.total_investido - stats.total_gastos)}`
      );
    }

    // === LISTAR TODOS ===
    if (cmd.match(/listar|mostrar|ver (todos|veículos)/i)) {
      if (veiculos.length === 0) {
        return this.success('Nenhum veículo cadastrado ainda.');
      }
      const lista = veiculos.map(v => 
        `${v.marca} ${v.modelo} ${v.ano || ''} (${v.status})`
      ).join('\n');
      return this.success(`Veículos cadastrados:\n${lista}`);
    }

    // === SAUDAÇÕES ===
    if (cmd.match(/^(oi|olá|ola|hey|e aí|e ai|bom dia|boa tarde|boa noite)/i)) {
      return this.success(
        `Olá! Sou o MAGNO, seu assistente de gestão de veículos. Como posso ajudar?\n\n` +
        `Você pode me perguntar sobre:\n` +
        `- Quantos veículos você tem\n` +
        `- Seu lucro atual\n` +
        `- Veículos em estoque\n` +
        `- Estatísticas gerais`
      );
    }

    // === AJUDA ===
    if (cmd.match(/ajuda|help|o que você faz|comandos/i)) {
      return this.success(
        `📋 Comandos disponíveis:\n\n` +
        `➕ Cadastro:\n` +
        `- "Cadastrar Honda Civic 2020 preto por 50000 ok"\n` +
        `- "Adicionar Fiat Uno 2015 branco 35000 ok"\n` +
        `- "Registrar Toyota Corolla 2022 prata 80 mil ok"\n\n` +
        `📊 Consultas:\n` +
        `- "Quantos veículos tenho?"\n` +
        `- "Qual o lucro?"\n` +
        `- "Mostrar estoque"\n` +
        `- "Total de vendas"\n` +
        `- "Estatísticas gerais"\n\n` +
        `🔍 Busca:\n` +
        `- "Mostrar Honda"\n` +
        `- "Listar todos os veículos"\n\n` +
        `💰 Financeiro:\n` +
        `- "Quanto gastei?"\n` +
        `- "Quanto investi?"\n` +
        `- "Qual o lucro líquido?"`
      );
    }

    // === NAVEGAÇÃO ===
    if (cmd.match(/ir para|abrir|navegar|página/i)) {
      if (cmd.includes('veículo') || cmd.includes('veiculo')) {
        return {
          action: 'navigate',
          route: '/veiculos',
          response: 'Abrindo página de veículos...',
          confidence: 0.9
        };
      }
      if (cmd.includes('dashboard') || cmd.includes('início') || cmd.includes('inicio')) {
        return {
          action: 'navigate',
          route: '/',
          response: 'Abrindo dashboard...',
          confidence: 0.9
        };
      }
      if (cmd.includes('cadastr') || cmd.includes('novo')) {
        return {
          action: 'navigate',
          route: '/novo-veiculo',
          response: 'Abrindo formulário de cadastro...',
          confidence: 0.9
        };
      }
    }

    // === FALLBACK INTELIGENTE ===
    return this.success(
      `Entendi que você disse: "${command}"\n\n` +
      `Não tenho certeza do que você precisa. Tente:\n` +
      `- "Quantos veículos tenho?"\n` +
      `- "Qual o lucro?"\n` +
      `- "Mostrar estoque"\n` +
      `- "Ajuda" para ver todos os comandos`
    );
  }

  extractVehicleData(command) {
    const cmd = command.toLowerCase();
    const data = {
      status: 'estoque',
      data_compra: new Date().toISOString().split('T')[0]
    };

    // Lista de marcas conhecidas
    const marcas = [
      'honda', 'toyota', 'fiat', 'volkswagen', 'vw', 'chevrolet', 'ford', 
      'hyundai', 'nissan', 'renault', 'peugeot', 'citroen', 'jeep', 'bmw', 
      'mercedes', 'audi', 'kia', 'mitsubishi', 'suzuki', 'mazda', 'volvo'
    ];

    // Extrair marca - Suporta "marca Volkswagen" ou "Volkswagen"
    const marcaMatch = cmd.match(/(?:marca\s+)?(\w+)/i);
    for (const marca of marcas) {
      if (cmd.includes(marca)) {
        data.marca = marca.charAt(0).toUpperCase() + marca.slice(1);
        if (marca === 'vw') data.marca = 'Volkswagen';
        break;
      }
    }

    // Extrair modelo - Suporta vários formatos
    if (data.marca) {
      // Tenta: "modelo Gol" ou "Volkswagen Gol"
      let modeloMatch = cmd.match(/modelo\s+(\w+)/i);
      if (modeloMatch) {
        data.modelo = modeloMatch[1].charAt(0).toUpperCase() + modeloMatch[1].slice(1);
      } else {
        // Tenta pegar palavra depois da marca
        const regex = new RegExp(data.marca.toLowerCase() + '\\s+(\\w+)', 'i');
        const match = cmd.match(regex);
        if (match) {
          data.modelo = match[1].charAt(0).toUpperCase() + match[1].slice(1);
        }
      }
    }

    // Extrair ano (4 dígitos entre 1900-2099)
    const anoMatch = cmd.match(/\b(19|20)\d{2}\b/);
    if (anoMatch) {
      data.ano = parseInt(anoMatch[0]);
    }

    // Extrair placa (formato ABC-1234 ou ABC1234)
    const placaMatch = cmd.match(/\b[a-z]{3}-?\d{4}\b/i);
    if (placaMatch) {
      data.placa = placaMatch[0].toUpperCase().replace('-', '');
    }

    // Extrair cor
    const cores = ['preto', 'branco', 'prata', 'cinza', 'vermelho', 'azul', 'verde', 'amarelo', 'dourado', 'marrom'];
    for (const cor of cores) {
      if (cmd.includes(cor)) {
        data.cor = cor.charAt(0).toUpperCase() + cor.slice(1);
        break;
      }
    }

    // Extrair quilometragem (km) - Suporta "10.000 km" ou "quilometragem 10.000"
    const kmMatch = cmd.match(/(?:quilometragem|km)\s*([\d.]+)\s*(?:km)?/i);
    if (kmMatch) {
      data.km = parseInt(kmMatch[1].replace(/\./g, ''));
    } else {
      // Tenta formato simples "10000 km"
      const kmSimple = cmd.match(/(\d+)\s*k(?:m|ilômetros?|ilometros?)/i);
      if (kmSimple) {
        data.km = parseInt(kmSimple[1]);
      }
    }

    // Extrair preço (valores como 50000, 50.000, 50 mil, R$ 60.000, etc)
    const precoMatch = cmd.match(/(?:por|preço|preco|valor|comprei|paguei|custou)\s*(?:de|por|em|a)?\s*(?:r\$)?\s*([\d.]+)\s*(mil|k)?/i);
    if (precoMatch) {
      // Remove pontos de milhar
      let preco = parseFloat(precoMatch[1].replace(/\./g, ''));
      if (precoMatch[2] && (precoMatch[2].toLowerCase() === 'mil' || precoMatch[2].toLowerCase() === 'k')) {
        preco = preco * 1000;
      }
      data.preco_compra = preco;
    } else {
      // Tenta pegar apenas número grande (acima de 1000) sem ponto
      const numMatch = cmd.match(/\b(\d{5,})\b/);
      if (numMatch) {
        data.preco_compra = parseFloat(numMatch[1]);
      }
    }

    return data;
  }

  getStats() {
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
    
    return {
      ...stats,
      total_gastos: gastos.total
    };
  }

  formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value || 0);
  }

  success(message) {
    return {
      action: 'success',
      response: message,
      confidence: 0.95
    };
  }
}

const smartLocalAI = new SmartLocalAI();

export default smartLocalAI;
