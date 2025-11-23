import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Users } from 'lucide-react';
import { Topic, PerformanceReport } from '../types';
import { TopicSelector } from '../components/Discussion/TopicSelector';
import { ChatInterface } from '../components/Discussion/ChatInterface';
import { VoiceControls } from '../components/Discussion/VoiceControls';
import { PerformanceMetrics } from '../components/Discussion/PerformanceMetrics';
import { BotParticipants } from '../components/Discussion/BotParticipants';
import { CameraPanel } from '../components/Discussion/CameraPanel';
import { useWebSocket } from '../hooks/useWebSocket';
import { useVoice } from '../hooks/useVoice';
import { discussionService } from '../services/DiscussionService';
import { reportService } from '../services/ReportService';
import { nlpService } from '../services/NlpService';
import { sequenceModelService, createDefaultEncoder } from '../services/SequenceModelService';
import { attentionService } from '../services/AttentionService';

interface DiscussionPageProps {
  onBack: () => void;
  onReportGenerated: (report: PerformanceReport) => void;
}

export const DiscussionPage: React.FC<DiscussionPageProps> = ({ onBack, onReportGenerated }) => {
  const [currentTopic, setCurrentTopic] = useState<Topic | null>(null);
  const [discussionStartTime, setDiscussionStartTime] = useState<Date | null>(null);
  const [discussionDuration, setDiscussionDuration] = useState(0);
  const [activeBotId, setActiveBotId] = useState<string | null>(null);
  const [isDiscussionActive, setIsDiscussionActive] = useState(false);
  const [lastBotResponseTime, setLastBotResponseTime] = useState<Date>(new Date());

  const { messages, metrics, setMetrics, sendMessage, addBotMessage } = useWebSocket() as any;
  const [metricsHistory, setMetricsHistory] = useState<import('../types').RealtimeMetrics[]>([]);
  const { speak, stopSpeaking, stopListening } = useVoice() as any;
  const [modelsReady, setModelsReady] = useState(false);
  const [modelsError, setModelsError] = useState<string | undefined>(undefined);

  // Update discussion timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (discussionStartTime && isDiscussionActive) {
      interval = setInterval(() => {
        setDiscussionDuration(Math.floor((new Date().getTime() - discussionStartTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [discussionStartTime, isDiscussionActive]);

  // Auto-generate bot responses via DiscussionService (backed by Ollama when available)
  useEffect(() => {
    if (!isDiscussionActive || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const timeSinceLastBot = new Date().getTime() - lastBotResponseTime.getTime();

    // Generate bot response after user message or if no bot has responded in a while
    if ((lastMessage.type === 'user' || timeSinceLastBot > 15000) && isDiscussionActive) {
      const timeout = setTimeout(async () => {
        const nextBot = discussionService.getNextBot(activeBotId || undefined);
        const response = await discussionService.generateBotResponse(nextBot.id, lastMessage.content, messages);
        
        setActiveBotId(nextBot.id);
        addBotMessage(nextBot.id, response);
        setLastBotResponseTime(new Date());
        
        // Speak the bot response with a distinct voice per bot
        const voiceIndexMap: Record<string, number> = { alexa: 0, maya: 1, sarah: 2, momo: 3 };
        const voiceIndex = voiceIndexMap[nextBot.id] ?? 0;
        speak(response, 1, 1, voiceIndex).catch(console.error);
        
        setTimeout(() => setActiveBotId(null), 1500);
      }, 800 + Math.random() * 900); // ~0.8–1.7s delay for snappier replies

      return () => clearTimeout(timeout);
    }
  }, [messages, isDiscussionActive, lastBotResponseTime, activeBotId, addBotMessage, speak]);

  // Cleanup on unmount: ensure TTS/STT are stopped
  useEffect(() => {
    return () => {
      try { stopSpeaking(); } catch {}
      try { stopListening(); } catch {}
    };
  }, [stopSpeaking, stopListening]);

  // Ollama availability is checked on-demand by DiscussionService

  const loadModels = async (): Promise<boolean> => {
    setModelsError(undefined);
    let textModelLoaded = false;
    let visionModelLoaded = false;
    
    // Try to load text model (optional - graceful degradation)
    try {
      sequenceModelService.setEncoder(createDefaultEncoder());
      await sequenceModelService.loadModel('/models/text_model/model.json', 'lstm');
      textModelLoaded = true;
      console.log('Text LSTM model loaded successfully');
    } catch (e: any) {
      console.warn('Text model not available, using heuristics only:', e.message);
    }
    
    // Try to load vision model (optional - graceful degradation)
    try {
      const okLM = await attentionService.loadLandmarksModel();
      if (okLM) {
        visionModelLoaded = true;
        console.log('Face landmarks model loaded successfully');
      } else {
        // fall back to local CNN model.json
        const okCNN = await attentionService.loadCnnModel('/models/attention_cnn/model.json');
        if (okCNN) {
          visionModelLoaded = true;
          console.log('Attention CNN model loaded successfully');
        }
      }
    } catch (e: any) {
      console.warn('Vision models not available, using basic heuristics:', e.message);
    }
    
    // Always allow discussion to start, even without models
    setModelsReady(true);
    if (!textModelLoaded && !visionModelLoaded) {
      console.info('Running with heuristic-only analysis (no ML models loaded)');
    }
    return true;
  };

  const handleTopicSelect = async (topic: Topic) => {
    await loadModels(); // Load models but continue regardless

    setCurrentTopic(topic);
    setDiscussionStartTime(new Date());
    setIsDiscussionActive(true);
    
    // Welcome message from Alexa (Moderator)
    setTimeout(() => {
      const welcomeMessage = `Welcome to our discussion on "${topic.title}". I'm Alexa, and I'll be moderating today. This is a ${topic.difficulty} level topic with an estimated duration of ${topic.estimatedDuration} minutes. Let's begin by sharing our initial thoughts on this topic. Who would like to start?`;
      addBotMessage('alexa', welcomeMessage);
      speak(welcomeMessage).catch(console.error);
    }, 1000);
  };

  const handleSendMessage = async (content: string, isVoice = false) => {
    if (!isDiscussionActive) return;

    sendMessage({
      type: 'user_message',
      content,
      isVoice,
      timestamp: new Date()
    });

    // Update performance metrics deterministically with LSTM scoring
    // Base metrics from heuristics + LSTM scores (awaited for immediate UI reflection)
    const realtimeMetrics = await discussionService.updatePerformanceMetrics(content, isVoice, discussionDuration);
    // NLP refinement against context
    const nlp = nlpService.analyze(messages as any, content);
    const updatedMetrics = nlpService.applyToMetrics(realtimeMetrics, nlp);
    // Create full RealtimeMetrics with all required fields
    const historyPoint: import('../types').RealtimeMetrics = {
      ...updatedMetrics,
      timestamp: new Date(),
      messageCount: messages.length + 1,
      totalDuration: discussionDuration
    };
    setMetrics(historyPoint);
    setMetricsHistory(prev => [...prev, historyPoint]);
  };

  const handleVoiceTranscription = (text: string) => {
    if (text.trim()) {
      handleSendMessage(text, true);
    }
  };

  const handleEmotionAnalysis = (analysis: any) => {
    if (analysis.emotions) {
      // Update discussion service with emotion metrics
      discussionService.updateEmotionMetrics(analysis.emotions);
    }
  };

  const handleEndDiscussion = async () => {
    if (!currentTopic || !discussionStartTime) return;

    setIsDiscussionActive(false);
    // Immediately stop any ongoing TTS
    stopSpeaking();
    // And stop any listening session
    stopListening();
    
    // Count user messages
    const userMessageCount = (messages as any).filter((msg: any) => msg.type === 'user').length;
    
    // Generate performance report
    const finalMetrics = discussionService.getCurrentMetrics();
    // Ensure we have at least one progress point
    if (metricsHistory.length === 0) {
      setMetricsHistory([{
        ...finalMetrics,
        timestamp: new Date(),
        messageCount: messages.length,
        totalDuration: discussionDuration
      } as any]);
    }
    
    const report = reportService.generateReport(
      'session_' + Date.now(),
      'user_1',
      currentTopic.title,
      currentTopic.difficulty,
      discussionDuration,
      finalMetrics,
      metricsHistory,
      userMessageCount
    );

    onReportGenerated(report);
    
    // Reset state
    setTimeout(() => {
      setCurrentTopic(null);
      setDiscussionStartTime(null);
      setDiscussionDuration(0);
      setActiveBotId(null);
      discussionService.resetMetrics();
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentTopic) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
          </div>
          
          <TopicSelector onTopicSelect={handleTopicSelect} onCancel={onBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                disabled={isDiscussionActive}
                className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{currentTopic.title}</h1>
                <p className="text-sm text-gray-600">{currentTopic.category} • {currentTopic.difficulty}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                {formatTime(discussionDuration)}
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-1" />
                {messages.length} messages
              </div>
              
              <div className="flex items-center text-sm">
                <div className={`w-2 h-2 rounded-full mr-2 ${modelsReady ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {modelsReady ? 'Models ready' : 'Models required'}
              </div>
              
              {isDiscussionActive && (
                <button
                  onClick={handleEndDiscussion}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  End Discussion
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error banner for models */}
      {!modelsReady && modelsError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
            {modelsError}. Place TFJS models in the public path and retry.
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Chat and Voice */}
          <div className="lg:col-span-2 space-y-6">
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              disabled={!isDiscussionActive}
            />
            
            <VoiceControls
              onTranscription={handleVoiceTranscription}
              disabled={!isDiscussionActive}
            />
          </div>

          {/* Right Column - Metrics and Participants */}
          <div className="lg:col-span-2 space-y-6">
            <CameraPanel 
              disabled={!isDiscussionActive} 
              onAnalysis={handleEmotionAnalysis}
            />
            <PerformanceMetrics
              metrics={metrics as any}
              isLive={isDiscussionActive}
            />
            
            <BotParticipants activeBotId={activeBotId} />
          </div>
        </div>
      </div>
    </div>
  );
};