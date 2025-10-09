import db from './database.js';

class AgentLogger {
  constructor() {
    this.initDatabase();
    this.sessionId = this.generateSessionId();
    console.log('📝 Agent Logger iniciado - Session:', this.sessionId);
  }

  initDatabase() {
    // Cria tabela de logs se não existir
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS agent_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        command TEXT NOT NULL,
        action TEXT NOT NULL,
        ai_used TEXT NOT NULL,
        success BOOLEAN DEFAULT 1,
        data TEXT,
        response TEXT,
        confidence REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    db.exec(createTableSQL);
    console.log('✅ Tabela agent_logs criada/verificada');
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  logAction(logData) {
    try {
      const {
        command,
        action,
        aiUsed,
        success = true,
        data = null,
        response,
        confidence = 0
      } = logData;

      const stmt = db.prepare(`
        INSERT INTO agent_logs (
          session_id, command, action, ai_used, success, data, response, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        this.sessionId,
        command,
        action,
        aiUsed,
        success ? 1 : 0,
        data ? JSON.stringify(data) : null,
        response,
        confidence
      );

      console.log(`📝 Log registrado: ${action} - ${aiUsed}`);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('❌ Erro ao registrar log:', error);
      return null;
    }
  }

  getSessionLogs(sessionId = null) {
    const sid = sessionId || this.sessionId;
    const logs = db.prepare(`
      SELECT * FROM agent_logs 
      WHERE session_id = ? 
      ORDER BY timestamp ASC
    `).all(sid);

    return logs;
  }

  getAllSessions() {
    const sessions = db.prepare(`
      SELECT 
        session_id,
        MIN(timestamp) as start_time,
        MAX(timestamp) as end_time,
        COUNT(*) as total_actions,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_actions
      FROM agent_logs
      GROUP BY session_id
      ORDER BY start_time DESC
    `).all();

    return sessions;
  }

  generateReport(sessionId = null) {
    const sid = sessionId || this.sessionId;
    const logs = this.getSessionLogs(sid);

    if (logs.length === 0) {
      return {
        sessionId: sid,
        message: 'Nenhuma ação registrada nesta sessão',
        summary: null
      };
    }

    // Análise dos logs
    const summary = {
      sessionId: sid,
      startTime: logs[0].timestamp,
      endTime: logs[logs.length - 1].timestamp,
      totalActions: logs.length,
      successfulActions: logs.filter(l => l.success).length,
      failedActions: logs.filter(l => !l.success).length,
      aiUsage: this.analyzeAIUsage(logs),
      actionsByType: this.analyzeActionTypes(logs),
      vehiclesCreated: this.countVehiclesCreated(logs),
      commands: logs.map(log => ({
        timestamp: log.timestamp,
        command: log.command,
        action: log.action,
        aiUsed: log.ai_used,
        success: !!log.success,
        response: log.response
      }))
    };

    return summary;
  }

  analyzeAIUsage(logs) {
    const aiCount = {};
    logs.forEach(log => {
      aiCount[log.ai_used] = (aiCount[log.ai_used] || 0) + 1;
    });
    return aiCount;
  }

  analyzeActionTypes(logs) {
    const actionCount = {};
    logs.forEach(log => {
      actionCount[log.action] = (actionCount[log.action] || 0) + 1;
    });
    return actionCount;
  }

  countVehiclesCreated(logs) {
    return logs.filter(log => log.action === 'create_vehicle' && log.success).length;
  }

  generateTextReport(sessionId = null) {
    const report = this.generateReport(sessionId);
    
    if (!report.summary) {
      return report.message;
    }

    const s = report.summary;
    
    let text = `
╔═══════════════════════════════════════════════════════════╗
║           📊 RELATÓRIO DO AGENTE IA - MAGNO              ║
╚═══════════════════════════════════════════════════════════╝

📅 INFORMAÇÕES DA SESSÃO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session ID: ${s.sessionId}
Início: ${new Date(s.startTime).toLocaleString('pt-BR')}
Fim: ${new Date(s.endTime).toLocaleString('pt-BR')}
Duração: ${this.calculateDuration(s.startTime, s.endTime)}

📈 ESTATÍSTICAS GERAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total de ações: ${s.totalActions}
✅ Ações bem-sucedidas: ${s.successfulActions}
❌ Ações falhadas: ${s.failedActions}
Taxa de sucesso: ${((s.successfulActions / s.totalActions) * 100).toFixed(1)}%

🚗 VEÍCULOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Veículos cadastrados: ${s.vehiclesCreated}

🤖 USO DE IA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(s.aiUsage).map(([ai, count]) => 
  `${ai === 'gemini' ? '🌟' : ai === 'groq' ? '⚡' : '🔧'} ${ai.toUpperCase()}: ${count} comando(s)`
).join('\n')}

📋 TIPOS DE AÇÕES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${Object.entries(s.actionsByType).map(([action, count]) => 
  `${this.getActionEmoji(action)} ${this.translateAction(action)}: ${count}x`
).join('\n')}

📝 HISTÓRICO DE COMANDOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${s.commands.map((cmd, i) => 
  `${i + 1}. [${new Date(cmd.timestamp).toLocaleTimeString('pt-BR')}] ${cmd.success ? '✅' : '❌'}
   Comando: "${cmd.command}"
   Ação: ${this.translateAction(cmd.action)} (${cmd.aiUsed})
   Resposta: ${cmd.response.substring(0, 80)}${cmd.response.length > 80 ? '...' : ''}`
).join('\n\n')}

╚═══════════════════════════════════════════════════════════╝
Relatório gerado em: ${new Date().toLocaleString('pt-BR')}
`;

    return text;
  }

  calculateDuration(start, end) {
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
  }

  getActionEmoji(action) {
    const emojis = {
      'create_vehicle': '➕',
      'success': '✅',
      'navigate': '🧭',
      'query': '🔍',
      'error': '❌'
    };
    return emojis[action] || '📋';
  }

  translateAction(action) {
    const translations = {
      'create_vehicle': 'Cadastrar veículo',
      'success': 'Consulta',
      'navigate': 'Navegação',
      'query': 'Busca',
      'error': 'Erro'
    };
    return translations[action] || action;
  }

  clearSession() {
    this.sessionId = this.generateSessionId();
    console.log('🔄 Nova sessão iniciada:', this.sessionId);
  }

  deleteOldLogs(daysToKeep = 30) {
    const stmt = db.prepare(`
      DELETE FROM agent_logs 
      WHERE timestamp < datetime('now', '-' || ? || ' days')
    `);
    
    const result = stmt.run(daysToKeep);
    console.log(`🗑️ ${result.changes} logs antigos deletados`);
    return result.changes;
  }
}

const agentLogger = new AgentLogger();

export default agentLogger;
