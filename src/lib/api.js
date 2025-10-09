import { supabase } from './supabase';

// No Vercel, usa rotas relativas. Em dev local, usa localhost
const API_URL = import.meta.env.VITE_API_URL || (
  typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
    ? '/api'
    : 'http://localhost:3000/api'
);

// Função auxiliar para obter o token de autenticação
async function getAuthToken() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Erro ao obter sessão:', error);
      return null;
    }
    
    if (!session) {
      console.warn('⚠️ Nenhuma sessão encontrada');
      return null;
    }
    
    console.log('✅ Token obtido:', session.access_token?.substring(0, 20) + '...');
    return session.access_token;
  } catch (error) {
    console.error('❌ Exceção ao obter token:', error);
    return null;
  }
}

// Função auxiliar para fazer requisições autenticadas
async function authenticatedFetch(url, options = {}) {
  const token = await getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('🔑 Enviando requisição autenticada para:', url);
  } else {
    console.warn('⚠️ Requisição SEM token para:', url);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    console.error('❌ Erro na requisição:', response.status, url);
    const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(error.error || `Erro na requisição: ${response.status}`);
  }

  return response.json();
}

// API de Veículos
export const veiculosAPI = {
  async getAll() {
    return authenticatedFetch(`${API_URL}/veiculos`);
  },

  async getById(id) {
    return authenticatedFetch(`${API_URL}/veiculos/${id}`);
  },

  async create(data) {
    return authenticatedFetch(`${API_URL}/veiculos`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id, data) {
    return authenticatedFetch(`${API_URL}/veiculos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async delete(id) {
    return authenticatedFetch(`${API_URL}/veiculos/${id}`, {
      method: 'DELETE',
    });
  },

  async getGastos(id) {
    return authenticatedFetch(`${API_URL}/veiculos/${id}/gastos`);
  },

  async addGasto(id, gasto) {
    return authenticatedFetch(`${API_URL}/veiculos/${id}/gastos`, {
      method: 'POST',
      body: JSON.stringify(gasto),
    });
  },
};

// API de Dashboard
export const dashboardAPI = {
  async getStats() {
    return authenticatedFetch(`${API_URL}/dashboard`);
  },
};

// API de IA
export const aiAPI = {
  async getStatus() {
    return authenticatedFetch(`${API_URL}/ai/status`);
  },

  async processCommand(command, sessionId, preferredAI = 'auto') {
    return authenticatedFetch(`${API_URL}/ai/process`, {
      method: 'POST',
      body: JSON.stringify({ command, sessionId, preferredAI }),
    });
  },
};

// API de Preferências
export const preferencesAPI = {
  async get(key) {
    return authenticatedFetch(`${API_URL}/preferences/${key}`);
  },

  async set(key, value) {
    return authenticatedFetch(`${API_URL}/preferences`, {
      method: 'POST',
      body: JSON.stringify({ key, value }),
    });
  },

  async getAll() {
    return authenticatedFetch(`${API_URL}/preferences`);
  },
};

// API de Relatórios do Agente
export const agentAPI = {
  async getReport() {
    return authenticatedFetch(`${API_URL}/agent/report`);
  },

  async getSessions() {
    return authenticatedFetch(`${API_URL}/agent/sessions`);
  },

  async getLogs(sessionId) {
    return authenticatedFetch(`${API_URL}/agent/logs/${sessionId}`);
  },
};

export default {
  veiculos: veiculosAPI,
  dashboard: dashboardAPI,
  ai: aiAPI,
  preferences: preferencesAPI,
  agent: agentAPI,
};
