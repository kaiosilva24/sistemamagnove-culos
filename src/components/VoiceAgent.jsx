import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Volume2, VolumeX, Brain, FileText } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { aiAPI } from '../lib/api';

const VoiceAgent = () => {
  const navigate = useNavigate();
  const { 
    isListening, 
    transcript, 
    interimTranscript,
    isSupported, 
    startListening, 
    stopListening,
    resetTranscript 
  } = useSpeechRecognition();

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [lastCommand, setLastCommand] = useState('');
  const [agentResponse, setAgentResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [intentDetected, setIntentDetected] = useState('');
  const [selectedAI, setSelectedAI] = useState('auto');
  const [availableAIs, setAvailableAIs] = useState({ gemini: false, groq: false, local: true });
  const [showAISelector, setShowAISelector] = useState(false);
  const [accumulatedText, setAccumulatedText] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportData, setReportData] = useState(null);
  const synth = useRef(window.speechSynthesis);

  // Busca status das IAs disponíveis E carrega preferência salva
  useEffect(() => {
    // Busca status das IAs COM AUTENTICAÇÃO
    aiAPI.getStatus()
      .then(data => {
        console.log('📊 Status completo da API:', JSON.stringify(data, null, 2));
        console.log('   Gemini:', data.available?.gemini);
        console.log('   Groq:', data.available?.groq);
        console.log('   Local:', data.available?.local);
        setAvailableAIs(data.available);
      })
      .catch(err => console.error('Erro ao buscar status de IAs:', err));

    // Carrega preferência de IA salva (pode dar 401 se não estiver logado, é normal)
    fetch('/api/preferences/preferred_ai')
      .then(res => res.json())
      .then(data => {
        if (data.value) {
          console.log('✅ Preferência de IA carregada:', data.value);
          setSelectedAI(data.value);
        }
      })
      .catch(err => console.log('⚠️ Preferência não carregada (normal se não estiver logado)'));
  }, []);

  // Salva preferência quando muda
  useEffect(() => {
    if (selectedAI !== 'auto') {
      fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'preferred_ai', value: selectedAI })
      })
        .then(() => console.log('💾 Preferência de IA salva:', selectedAI))
        .catch(err => console.error('Erro ao salvar preferência:', err));
    }
  }, [selectedAI]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAISelector && !event.target.closest('.ai-selector-container')) {
        setShowAISelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAISelector]);

  useEffect(() => {
    // Acumula o texto conforme vai falando
    if (transcript && !isSpeaking) {
      // Combina texto acumulado com novo texto
      const fullText = accumulatedText ? `${accumulatedText} ${transcript}` : transcript;
      setAccumulatedText(fullText);
      
      const cmd = fullText.toLowerCase().trim();
      
      // Verifica se termina com "ok"
      if (cmd.endsWith('ok') || cmd.endsWith('okay') || cmd.endsWith('ok.')) {
        setLastCommand(fullText);
        // Remove o "ok" do final antes de processar
        const cleanCommand = fullText.replace(/\s*(ok|okay)\.?$/i, '').trim();
        processCommand(cleanCommand);
        setAccumulatedText('');
        resetTranscript();
      } else {
        // Limpa o transcript mas mantém o acumulado
        resetTranscript();
      }
    }
  }, [transcript, isSpeaking]);

  const speak = (text) => {
    if (!voiceEnabled || !text) return;

    // CORREÇÃO DO BUG: Para o microfone antes de falar para evitar feedback
    const wasListening = isListening;
    if (wasListening) {
      stopListening();
    }

    // Cancela qualquer fala em andamento
    synth.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      // CORREÇÃO: Reativa o microfone após falar (se estava ativo)
      if (wasListening) {
        setTimeout(() => {
          startListening();
        }, 500); // Delay de 500ms para evitar captar o final da fala
      }
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
      // Reativa microfone em caso de erro também
      if (wasListening) {
        setTimeout(() => {
          startListening();
        }, 500);
      }
    };

    synth.current.speak(utterance);
  };

  const processCommand = async (command) => {
    setIsProcessing(true);
    setIntentDetected('Analisando...');
    console.log('🎤 Comando recebido:', command);

    try {
      // Envia para o agente de IA processar COM AUTENTICAÇÃO
      console.log('📡 Enviando comando com autenticação...');
      
      const result = await aiAPI.processCommand(command, Date.now().toString(), selectedAI);
      console.log('🤖 Resposta da IA:', result);
      console.log('   📋 Ação:', result.action);
      console.log('   🧠 IA usada:', result.processedBy);
      console.log('   💬 Resposta:', result.response);
      console.log('   🎯 Confiança:', result.confidence);
      
      if (result.vehicleId) {
        console.log('   ✅ Veículo cadastrado! ID:', result.vehicleId);
      }

      // Verifica se a resposta tem o formato correto
      if (!result || !result.response) {
        console.error('❌ Resposta inválida da IA:', result);
        throw new Error('Resposta da IA está incompleta');
      }

      // Atualiza estados com informações da IA
      setAgentResponse(result.response);
      setConfidence(result.confidence || 0);
      setIntentDetected(result.action || 'unknown');
      
      // Fala a resposta
      speak(result.response);

      // Executa ação se necessário
      if (result.action === 'navigate' && result.route) {
        console.log('🧭 Navegando para:', result.route);
        setTimeout(() => {
          navigate(result.route);
        }, 500);
      }

      // Se foi criado um veículo com sucesso, recarrega a página atual
      if (result.action === 'create_vehicle' && result.vehicleId) {
        console.log('✅ Veículo criado, ID:', result.vehicleId);
        setTimeout(() => {
          // Recarrega os dados da página atual
          window.location.reload();
        }, 2000);
      }

    } catch (error) {
      console.error('❌ Erro detalhado:', error);
      console.error('Stack:', error.stack);
      
      let errorMessage = 'Erro ao processar comando';
      let spokenMessage = 'Desculpe, ocorreu um erro ao processar seu comando';
      
      // Mensagens específicas por tipo de erro
      if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Erro: Backend não está respondendo';
        spokenMessage = 'Não consegui conectar ao servidor. Verifique se o backend está rodando';
        console.error('💡 Dica: Execute "npm run dev" para iniciar o servidor');
      } else if (error.message.includes('404')) {
        errorMessage = 'Erro: Rota da API não encontrada';
        spokenMessage = 'A rota da API não foi encontrada';
        console.error('💡 Dica: Verifique se o servidor foi reiniciado após adicionar a rota');
      } else if (error.message.includes('500')) {
        errorMessage = 'Erro: Falha no servidor';
        spokenMessage = 'Ocorreu um erro no servidor';
        console.error('💡 Dica: Verifique os logs do servidor para mais detalhes');
      }
      
      setAgentResponse(errorMessage + ': ' + error.message);
      setConfidence(0);
      setIntentDetected('error');
      speak(spokenMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      setAccumulatedText(''); // Limpa ao iniciar nova gravação
      startListening();
      // CORREÇÃO DO BUG: Removido "Estou te ouvindo" para evitar feedback de áudio
      // O feedback visual é suficiente (botão vermelho + texto "Ouvindo...")
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (voiceEnabled) {
      synth.current.cancel();
    }
  };

  const openReport = async () => {
    try {
      const response = await fetch('/api/agent/report');
      const data = await response.json();
      console.log('📊 Dados do relatório:', data);
      console.log('📊 Primeiro log:', data.logs?.[0]);
      setReportData(data);
      setShowReportModal(true);
      speak('Relatório carregado!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      speak('Erro ao gerar relatório');
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
      {/* Versão Minimizada - Bolinha */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center group relative"
          title="Expandir Agente IA"
        >
          <Brain className="w-8 h-8 text-white animate-pulse" />
        </button>
      ) : (
        /* Painel Completo - Expandido */
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-500 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-white animate-pulse" />
                <h3 className="text-white font-bold">Agente IA</h3>
              </div>
              <div className="flex items-center space-x-2">
                {/* Botão Minimizar */}
                <button
                  onClick={() => setIsMinimized(true)}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                  title="Minimizar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              {/* Seletor de IA */}
              <div className="relative ai-selector-container">
                <button
                  onClick={() => setShowAISelector(!showAISelector)}
                  className="text-xs text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors flex items-center space-x-1"
                  title="Selecionar IA"
                >
                  <span className="font-medium">
                    {selectedAI === 'auto' ? '🤖 Auto' : 
                     selectedAI === 'gemini' ? '🌟 Gemini' : 
                     selectedAI === 'groq' ? '⚡ Groq' : 
                     '🔧 Local'}
                  </span>
                  <svg className={`w-3 h-3 transition-transform ${showAISelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown */}
                {showAISelector && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    <div className="py-1">
                      <button
                        onClick={() => { setSelectedAI('auto'); setShowAISelector(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${
                          selectedAI === 'auto' ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="mr-2">🤖</span>
                          <span className="font-medium">Automático</span>
                        </span>
                        {selectedAI === 'auto' && <span className="text-blue-600">✓</span>}
                      </button>
                      
                      <button
                        onClick={() => { setSelectedAI('gemini'); setShowAISelector(false); }}
                        disabled={!availableAIs.gemini}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 flex items-center justify-between ${
                          selectedAI === 'gemini' ? 'bg-green-100 text-green-700' : 
                          availableAIs.gemini ? 'text-gray-700' : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={availableAIs.gemini ? 'Gemini AI - Preciso' : 'Gemini não configurado'}
                      >
                        <span className="flex items-center">
                          <span className="mr-2">🌟</span>
                          <span className="font-medium">Gemini</span>
                          {!availableAIs.gemini && <span className="ml-2 text-xs">(off)</span>}
                        </span>
                        {selectedAI === 'gemini' && <span className="text-green-600">✓</span>}
                      </button>
                      
                      <button
                        onClick={() => { setSelectedAI('groq'); setShowAISelector(false); }}
                        disabled={!availableAIs.groq}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-purple-50 flex items-center justify-between ${
                          selectedAI === 'groq' ? 'bg-purple-100 text-purple-700' : 
                          availableAIs.groq ? 'text-gray-700' : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={availableAIs.groq ? 'Groq AI - Rápido' : 'Groq não configurado'}
                      >
                        <span className="flex items-center">
                          <span className="mr-2">⚡</span>
                          <span className="font-medium">Groq</span>
                          {!availableAIs.groq && <span className="ml-2 text-xs">(off)</span>}
                        </span>
                        {selectedAI === 'groq' && <span className="text-purple-600">✓</span>}
                      </button>
                      
                      <button
                        onClick={() => { setSelectedAI('local'); setShowAISelector(false); }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                          selectedAI === 'local' ? 'bg-gray-100 text-gray-700' : 'text-gray-700'
                        }`}
                      >
                        <span className="flex items-center">
                          <span className="mr-2">🔧</span>
                          <span className="font-medium">IA Local</span>
                        </span>
                        {selectedAI === 'local' && <span className="text-gray-600">✓</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {confidence > 0 && (
                <div className="text-xs text-white bg-white/20 px-2 py-1 rounded">
                  {Math.round(confidence * 100)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="p-4 space-y-3">
          {/* Transcript */}
          {(isListening || accumulatedText || interimTranscript) && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-600 font-medium mb-1">Você disse:</p>
              <p className="text-sm text-gray-800 min-h-[20px]">
                {accumulatedText || interimTranscript || 'Ouvindo...'}
              </p>
              {(accumulatedText || interimTranscript) && !(accumulatedText || interimTranscript).toLowerCase().trim().endsWith('ok') && (
                <p className="text-xs text-orange-600 mt-2 font-medium animate-pulse">
                  💡 Diga "ok" para confirmar e executar o comando
                </p>
              )}
              {(accumulatedText || interimTranscript).toLowerCase().trim().endsWith('ok') && (
                <p className="text-xs text-green-600 mt-2 font-medium">
                  ✅ Processando comando...
                </p>
              )}
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <p className="text-xs text-yellow-600 font-medium mb-1">🤖 IA Processando:</p>
              <p className="text-sm text-yellow-800 flex items-center">
                <span className="animate-pulse mr-2">⚙️</span>
                {intentDetected}
              </p>
            </div>
          )}

          {/* Agent response */}
          {agentResponse && !isProcessing && (
            <div className="bg-green-50 rounded-lg p-3 border border-green-200">
              <p className="text-xs text-green-600 font-medium mb-1">Resposta:</p>
              <p className="text-sm text-gray-800">{agentResponse}</p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center space-x-3">
            {/* Botão de microfone */}
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

            {/* Botão de áudio */}
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

            {/* Botão de relatório */}
            <button
              onClick={openReport}
              className="p-3 rounded-full transition-all bg-purple-500 hover:bg-purple-600 text-white"
              title="Ver relatório de ações"
            >
              <FileText className="w-5 h-5" />
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              {isListening 
                ? '🎤 Fale seu comando e termine com "ok"' 
                : 'Clique no microfone para começar'}
            </p>
            {isListening && (
              <p className="text-xs text-gray-500 text-center mt-1">
                Ex: "Cadastrar Honda Civic 2020 preto 50 mil ok"
              </p>
            )}
          </div>
        </div>
        </div>
      )}

      {/* Indicador de speaking */}
      {isSpeaking && (
        <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
          <p className="text-sm font-medium flex items-center">
            <Volume2 className="w-4 h-4 mr-2" />
            Falando...
          </p>
        </div>
      )}

      {/* Modal de Relatório */}
      {showReportModal && reportData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Relatório de Ações
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {reportData.logs && reportData.logs.length > 0 ? (
                <div className="space-y-4">
                  {reportData.logs.map((log, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'create_vehicle' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'add_gastos' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action === 'create_vehicle' ? '🚗 Cadastro' :
                             log.action === 'add_gastos' ? '💰 Gasto' :
                             log.action}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      
                      {/* Informações do Cadastro de Veículo */}
                      {log.action === 'create_vehicle' && log.data && (
                        <div className="mt-2 space-y-1">
                          <p className="text-sm text-gray-700">
                            <strong>Veículo:</strong> {log.data.marca} {log.data.modelo} {log.data.ano || ''}
                          </p>
                          {log.data.cor && (
                            <p className="text-xs text-gray-600">
                              <strong>Cor:</strong> {log.data.cor}
                            </p>
                          )}
                          {log.data.placa && (
                            <p className="text-xs text-gray-600">
                              <strong>Placa:</strong> {log.data.placa}
                            </p>
                          )}
                          {log.data.preco_compra && (
                            <p className="text-xs text-gray-600">
                              <strong>Preço:</strong> R$ {parseFloat(log.data.preco_compra).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Informações de Gastos */}
                      {log.action === 'add_gastos' && log.data && (
                        <div className="mt-2">
                          {log.data.modelo && (
                            <p className="text-sm text-gray-700 mb-1">
                              <strong>Veículo:</strong> {log.data.modelo} {log.data.placa ? `- ${log.data.placa}` : ''}
                            </p>
                          )}
                          {log.data.gastos && log.data.gastos.length > 0 && (
                            <div className="bg-white rounded p-3 border border-gray-200 mt-2">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Gastos Registrados:</p>
                              <div className="space-y-1">
                                {log.data.gastos.map((gasto, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                    <span className="text-gray-600">
                                      • {gasto.tipo}: {gasto.descricao}
                                    </span>
                                    <span className="font-semibold text-orange-600">
                                      R$ {parseFloat(gasto.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-700">TOTAL:</span>
                                <span className="text-sm font-bold text-orange-600">
                                  R$ {log.data.gastos.reduce((sum, g) => sum + parseFloat(g.valor), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Botão para ver comando */}
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
                          📝 Ver comando original
                        </summary>
                        <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-gray-700">
                          {log.command}
                        </div>
                      </details>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma ação registrada ainda</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {reportData.logs ? reportData.logs.length : 0} ação(ões) registrada(s)
              </p>
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoiceAgent;
