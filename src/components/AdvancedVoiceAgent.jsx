import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, Brain, CheckCircle, XCircle } from 'lucide-react';
import { useAdvancedVoice } from '../hooks/useAdvancedVoice';

const AdvancedVoiceAgent = () => {
  const navigate = useNavigate();
  const {
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
  } = useAdvancedVoice();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastCommand, setLastCommand] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [intentDetected, setIntentDetected] = useState('');
  const [continuousMode, setContinuousMode] = useState(false);
  const [actionHistory, setActionHistory] = useState([]);
  const synth = useRef(window.speechSynthesis);

  useEffect(() => {
    if (transcript && transcript !== lastCommand && !isSpeaking) {
      setLastCommand(transcript);
      processAdvancedCommand(transcript);
      resetTranscript();
    }
  }, [transcript, isSpeaking]);

  const speak = (text) => {
    if (!voiceEnabled || !text) return;

    const wasListening = isListening;
    if (wasListening) {
      stopListening();
    }

    synth.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (wasListening || continuousMode) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (wasListening || continuousMode) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    synth.current.speak(utterance);
  };

  const processAdvancedCommand = async (command) => {
    const cmd = command.toLowerCase().trim();
    console.log('🎤 Comando avançado:', cmd);

    // Se está aguardando confirmação
    if (awaitingConfirmation) {
      if (cmd.includes('ok') || cmd.includes('confirmar') || cmd.includes('sim')) {
        await executeConfirmedAction();
        return;
      } else if (cmd.includes('cancelar') || cmd.includes('não') || cmd.includes('nao')) {
        cancelAction();
        return;
      }
    }

    setIsProcessing(true);
    setIntentDetected('Analisando...');

    try {
      // Modo contínuo
      if (cmd.includes('modo contínuo') || cmd.includes('modo continuo') || cmd.includes('escuta contínua')) {
        setContinuousMode(true);
        setAgentResponse('Modo contínuo ativado. Estou ouvindo tudo que você fala.');
        speak('Modo contínuo ativado. Agora vou ouvir tudo continuamente. Diga "ok" ao final de cada comando para confirmar');
        addToLog('system', 'Modo contínuo ativado');
        setIsProcessing(false);
        return;
      }

      if (cmd.includes('desativar modo') || cmd.includes('parar escuta')) {
        setContinuousMode(false);
        setAgentResponse('Modo contínuo desativado');
        speak('Modo contínuo desativado');
        addToLog('system', 'Modo contínuo desativado');
        setIsProcessing(false);
        return;
      }

      // Cadastrar veículo
      if (cmd.includes('cadastrar') || cmd.includes('adicionar veículo') || cmd.includes('novo veículo')) {
        await handleVehicleRegistration(cmd);
        return;
      }

      // Adicionar gasto
      if (cmd.includes('adicionar gasto') || cmd.includes('registrar gasto') || cmd.includes('gasto')) {
        await handleExpenseRegistration(cmd);
        return;
      }

      // Gerar relatório
      if (cmd.includes('relatório') || cmd.includes('relatorio') || cmd.includes('resumo do que fiz')) {
        await generateActionReport();
        return;
      }

      // Comandos normais da IA
      await processNormalCommand(cmd);

    } catch (error) {
      console.error('❌ Erro:', error);
      setAgentResponse('Erro ao processar comando: ' + error.message);
      speak('Desculpe, ocorreu um erro');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVehicleRegistration = async (cmd) => {
    const vehicleData = extractVehicleData(cmd);
    console.log('🚗 Dados extraídos:', vehicleData);

    if (Object.keys(vehicleData).length === 0) {
      setAgentResponse('Não entendi os dados do veículo. Por favor, diga: marca, modelo, ano e preço');
      speak('Não consegui identificar os dados do veículo. Diga a marca, modelo, ano e preço');
      setIsProcessing(false);
      return;
    }

    // Coleta dados e aguarda confirmação
    setCollectedData(vehicleData);
    setCurrentIntent('add_vehicle');
    setAwaitingConfirmation(true);

    const confirmText = `Entendi. Cadastrar ${vehicleData.marca || 'veículo'} ${vehicleData.modelo || ''} ` +
      `${vehicleData.ano ? 'ano ' + vehicleData.ano : ''} ` +
      `${vehicleData.preco_compra ? 'por ' + formatCurrency(vehicleData.preco_compra) : ''}. ` +
      `Diga "ok" para confirmar ou "cancelar"`;

    setAgentResponse(confirmText);
    speak(confirmText);
    addToLog('user', cmd);
    addToLog('assistant', confirmText);
    setIsProcessing(false);
  };

  const handleExpenseRegistration = async (cmd) => {
    const expenseData = extractExpenseData(cmd);
    console.log('💰 Gasto extraído:', expenseData);

    if (!expenseData.valor) {
      setAgentResponse('Não entendi o valor do gasto. Por favor, especifique o valor');
      speak('Não consegui identificar o valor do gasto. Diga o valor novamente');
      setIsProcessing(false);
      return;
    }

    // Precisa identificar o veículo
    const veiculoMatch = cmd.match(/(?:veículo|veiculo|carro)\s+(.+?)(?:\s+gasto|$)/i);
    if (!veiculoMatch) {
      setAgentResponse('Qual veículo você quer adicionar esse gasto? Diga marca ou modelo');
      speak('Para qual veículo você quer adicionar esse gasto?');
      setIsProcessing(false);
      return;
    }

    expenseData.veiculo_busca = veiculoMatch[1].trim();

    setCollectedData(expenseData);
    setCurrentIntent('add_expense');
    setAwaitingConfirmation(true);

    const confirmText = `Entendi. Adicionar gasto de ${formatCurrency(expenseData.valor)} ` +
      `${expenseData.descricao ? 'para ' + expenseData.descricao : ''} ` +
      `no veículo ${expenseData.veiculo_busca}. Diga "ok" para confirmar`;

    setAgentResponse(confirmText);
    speak(confirmText);
    addToLog('user', cmd);
    addToLog('assistant', confirmText);
    setIsProcessing(false);
  };

  const executeConfirmedAction = async () => {
    setIsProcessing(true);
    setAwaitingConfirmation(false);

    try {
      if (currentIntent === 'add_vehicle') {
        await addVehicle();
      } else if (currentIntent === 'add_expense') {
        await addExpense();
      }
    } catch (error) {
      console.error('Erro ao executar ação:', error);
      setAgentResponse('Erro ao executar ação: ' + error.message);
      speak('Desculpe, não consegui completar a ação');
    } finally {
      setIsProcessing(false);
    }
  };

  const addVehicle = async () => {
    const data = {
      ...collectedData,
      data_compra: new Date().toISOString().split('T')[0],
      observacoes: 'Cadastrado por comando de voz'
    };

    const response = await fetch('/api/veiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Erro ao cadastrar veículo');

    const veiculo = await response.json();
    
    setActionHistory(prev => [...prev, {
      type: 'vehicle',
      action: 'cadastro',
      data: veiculo,
      timestamp: new Date()
    }]);

    const successText = `Veículo ${veiculo.marca} ${veiculo.modelo} cadastrado com sucesso!`;
    setAgentResponse(successText);
    speak(successText);
    addToLog('system', successText);
    
    clearCollectedData();
  };

  const addExpense = async () => {
    // Busca o veículo primeiro
    const searchResponse = await fetch('/api/veiculos');
    const veiculos = await searchResponse.json();
    
    const veiculo = veiculos.find(v => 
      v.marca.toLowerCase().includes(collectedData.veiculo_busca.toLowerCase()) ||
      v.modelo.toLowerCase().includes(collectedData.veiculo_busca.toLowerCase())
    );

    if (!veiculo) {
      throw new Error('Veículo não encontrado');
    }

    const data = {
      descricao: collectedData.descricao || 'Gasto registrado por voz',
      categoria: collectedData.categoria,
      valor: collectedData.valor,
      data: new Date().toISOString().split('T')[0]
    };

    const response = await fetch(`/api/veiculos/${veiculo.id}/gastos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error('Erro ao adicionar gasto');

    const gasto = await response.json();
    
    setActionHistory(prev => [...prev, {
      type: 'expense',
      action: 'adição',
      data: { ...gasto, veiculo },
      timestamp: new Date()
    }]);

    const successText = `Gasto de ${formatCurrency(gasto.valor)} adicionado ao ${veiculo.marca} ${veiculo.modelo}!`;
    setAgentResponse(successText);
    speak(successText);
    addToLog('system', successText);
    
    clearCollectedData();
  };

  const cancelAction = () => {
    const cancelText = 'Ação cancelada';
    setAgentResponse(cancelText);
    speak(cancelText);
    clearCollectedData();
    setIsProcessing(false);
  };

  const generateActionReport = async () => {
    if (actionHistory.length === 0) {
      setAgentResponse('Você ainda não realizou nenhuma ação nesta sessão');
      speak('Você ainda não realizou nenhuma ação nesta sessão');
      setIsProcessing(false);
      return;
    }

    const vehicles = actionHistory.filter(a => a.type === 'vehicle');
    const expenses = actionHistory.filter(a => a.type === 'expense');
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.data.valor, 0);

    const report = `Relatório da sessão: ` +
      `Você cadastrou ${vehicles.length} veículo${vehicles.length !== 1 ? 's' : ''}. ` +
      `Adicionou ${expenses.length} gasto${expenses.length !== 1 ? 's' : ''} ` +
      `totalizando ${formatCurrency(totalExpenses)}. `;

    setAgentResponse(report);
    speak(report);
    addToLog('system', report);
    setIsProcessing(false);
  };

  const processNormalCommand = async (command) => {
    const response = await fetch('/api/ai/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });

    const result = await response.json();
    setAgentResponse(result.response);
    setConfidence(result.confidence || 0);
    setIntentDetected(result.action || 'unknown');
    speak(result.response);

    if (result.action === 'navigate' && result.route) {
      setTimeout(() => navigate(result.route), 500);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
      setContinuousMode(false);
    } else {
      startListening();
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      synth.current.cancel();
    }
  };

  if (!isSupported) {
    return (
      <div className="fixed bottom-6 right-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg">
        <p className="font-medium">Reconhecimento de voz não suportado</p>
        <p className="text-sm">Use Chrome, Edge ou Safari</p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className={`w-5 h-5 text-white ${continuousMode ? 'animate-pulse' : ''}`} />
              <h3 className="text-white font-bold">
                {continuousMode ? 'Modo Contínuo' : 'Agente IA'}
              </h3>
            </div>
            {confidence > 0 && (
              <div className="text-xs text-white bg-white/20 px-2 py-1 rounded">
                {Math.round(confidence * 100)}%
              </div>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {/* Modo contínuo indicator */}
          {continuousMode && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <p className="text-xs text-purple-600 font-medium flex items-center">
                <span className="animate-pulse mr-2">🎤</span>
                Escuta contínua ativa - Diga "ok" para confirmar comandos
              </p>
            </div>
          )}

          {/* Aguardando confirmação */}
          {awaitingConfirmation && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium mb-2">Aguardando confirmação:</p>
              <div className="flex space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm">Diga "ok" para confirmar</span>
              </div>
              <div className="flex space-x-2 mt-1">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm">Diga "cancelar" para cancelar</span>
              </div>
            </div>
          )}

          {/* Transcript */}
          {(isListening || interimTranscript) && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Você disse:</p>
              <p className="text-sm text-gray-800">
                {interimTranscript || 'Ouvindo...'}
              </p>
            </div>
          )}

          {/* Processing */}
          {isProcessing && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium mb-1">🤖 IA Processando:</p>
              <p className="text-sm text-yellow-800 flex items-center">
                <span className="animate-pulse mr-2">⚙️</span>
                {intentDetected}
              </p>
            </div>
          )}

          {/* Response */}
          {agentResponse && !isProcessing && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Resposta:</p>
              <p className="text-sm text-gray-800">{agentResponse}</p>
            </div>
          )}

          {/* Action history */}
          {actionHistory.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <p className="text-xs text-gray-600 font-medium mb-2">Ações desta sessão:</p>
              {actionHistory.slice(-3).map((action, idx) => (
                <div key={idx} className="text-xs text-gray-700 mb-1">
                  • {action.type === 'vehicle' ? '🚗' : '💰'} {action.action}
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3 pt-2">
            <button
              onClick={toggleListening}
              className={`relative p-4 rounded-full transition-all transform hover:scale-110 ${
                isListening 
                  ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 animate-pulse' 
                  : 'bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/50'
              }`}
              title={isListening ? 'Parar de ouvir' : 'Começar a ouvir'}
            >
              {isListening ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            <button
              onClick={toggleVoice}
              className={`p-3 rounded-full transition-all ${
                voiceEnabled
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
              }`}
              title={voiceEnabled ? 'Desativar respostas de voz' : 'Ativar respostas de voz'}
            >
              {voiceEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {isListening 
                ? continuousMode 
                  ? '🎤 Escuta contínua ativa - Finalize com "ok"'
                  : '🎤 Fale agora...' 
                : 'Clique no microfone para começar'}
            </p>
          </div>
        </div>
      </div>

      {/* Speaking indicator */}
      {isSpeaking && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
          <p className="text-sm font-medium flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Falando...
          </p>
        </div>
      )}
    </div>
  );
};

export default AdvancedVoiceAgent;
