import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Função auxiliar para obter o token de autenticação
async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
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
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
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
