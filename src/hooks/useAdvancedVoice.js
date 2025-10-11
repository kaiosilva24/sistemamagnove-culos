import { useState, useRef, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';

export const useAdvancedVoice = () => {
  const [collectedData, setCollectedData] = useState({});
  const [currentIntent, setCurrentIntent] = useState(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [conversationLog, setConversationLog] = useState([]);
  
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognition();

  // Adiciona ao log de conversação
  const addToLog = useCallback((type, message) => {
    setConversationLog(prev => [...prev, { type, message, timestamp: new Date() }]);
  }, []);

  // Extrai dados do comando de voz
  const extractVehicleData = (text) => {
    const data = {};
    
    // Marca
    const marcaMatch = text.match(/(?:marca\s+)([a-záéíóúâêôãõç\s]+?)(?:\s+modelo|$)/i);
    if (marcaMatch) data.marca = marcaMatch[1].trim();
    
    // Modelo
    const modeloMatch = text.match(/(?:modelo\s+)([a-záéíóúâêôãõç0-9\s]+?)(?:\s+ano|,|$)/i);
    if (modeloMatch) data.modelo = modeloMatch[1].trim();
    
    // Ano
    const anoMatch = text.match(/(?:ano\s+)?(\d{4})/);
    if (anoMatch) data.ano = parseInt(anoMatch[1]);
    
    // Cor
    const corMatch = text.match(/(?:cor\s+)([a-záéíóúâêôãõç]+)/i);
    if (corMatch) data.cor = corMatch[1].trim();
    
    // Placa
    const placaMatch = text.match(/(?:placa\s+)?([a-z]{3}\d[a-z0-9]\d{2})/i);
    if (placaMatch) data.placa = placaMatch[1].toUpperCase();
    
    // Quilometragem
    const kmMatch = text.match(/(\d+)\s*(?:km|quilômetros|mil)/i);
    if (kmMatch) data.km = parseInt(kmMatch[1]);
    
    // Preço
    const precoMatch = text.match(/(?:preço|valor|por)\s*(?:de)?\s*(?:r\$)?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i);
    if (precoMatch) {
      const valor = precoMatch[1].replace(/\./g, '').replace(',', '.');
      data.preco_compra = parseFloat(valor);
    }
    
    return data;
  };

  // Extrai dados de gastos
  const extractExpenseData = (text) => {
    const data = {};
    
    // Tipo (anteriormente "categoria")
    if (text.includes('manutenção') || text.includes('manutencao') || text.includes('conserto')) {
      data.tipo = 'Manutenção';
    } else if (text.includes('peça') || text.includes('peca') || text.includes('peças')) {
      data.tipo = 'Peça';
    } else if (text.includes('documentação') || text.includes('documentacao') || text.includes('documento')) {
      data.tipo = 'Documentação';
    } else if (text.includes('pintura') || text.includes('funilaria')) {
      data.tipo = 'Estética';
    } else {
      data.tipo = 'Outros';
    }
    
    // Descrição (pega o que vem antes do valor)
    const descMatch = text.match(/(?:adicionar gasto|gasto de|gasto com)\s+(.+?)(?:\s+(?:de|por|valor)\s+r\$|\s+\d+)/i);
    if (descMatch) data.descricao = descMatch[1].trim();
    
    // Valor
    const valorMatch = text.match(/(?:valor|de|por)\s*(?:r\$)?\s*(\d+(?:\.\d{3})*(?:,\d{2})?)/i);
    if (valorMatch) {
      const valor = valorMatch[1].replace(/\./g, '').replace(',', '.');
      data.valor = parseFloat(valor);
    }
    
    return data;
  };

  // Limpa dados coletados
  const clearCollectedData = useCallback(() => {
    setCollectedData({});
    setCurrentIntent(null);
    setAwaitingConfirmation(false);
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    collectedData,
    setCollectedData,
    currentIntent,
    setCurrentIntent,
    awaitingConfirmation,
    setAwaitingConfirmation,
    conversationLog,
    addToLog,
    extractVehicleData,
    extractExpenseData,
    clearCollectedData
  };
};
