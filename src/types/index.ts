export interface User {
  id: string;
  name: string;
  email?: string;
}

export interface Bot {
  id: string;
  name: string;
  role: string;
  personality: string;
  avatar: string;
  color: string;
  description: string;
  responseStyle: string;
}

export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'bot';
  botId?: string;
  isVoice?: boolean;
  duration?: number;
}

export interface Discussion {
  id: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  startTime: Date;
  endTime?: Date;
  participants: string[];
  messages: Message[];
  status: 'waiting' | 'active' | 'completed';
}

export interface PerformanceMetrics {
  confidence: number;
  fluency: number;
  originality: number;
  teamwork: number;
  reasoning: number;
  wordsPerMinute: number;
  fillerWords: number;
  pausePattern: number;
  sentiment: number;
  participation: number;
  // Emotion-based metrics
  emotionalEngagement: number;
  dominantEmotion: string;
  emotionConfidence: number;
}

export interface RealtimeMetrics extends PerformanceMetrics {
  timestamp: Date;
  messageCount: number;
  totalDuration: number;
}

export interface PerformanceReport {
  sessionId: string;
  userId: string;
  topic: string;
  difficulty: string;
  duration: number;
  finalMetrics: PerformanceMetrics;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  overallScore: number;
  detailedAnalysis: {
    confidence: AnalysisDetail;
    fluency: AnalysisDetail;
    originality: AnalysisDetail;
    teamwork: AnalysisDetail;
    reasoning: AnalysisDetail;
  };
  progressOverTime: RealtimeMetrics[];
  generatedAt: Date;
}

export interface AnalysisDetail {
  score: number;
  feedback: string;
  examples: string[];
  improvements: string[];
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  keywords: string[];
  estimatedDuration: number;
  objectives: string[];
}

export interface VoiceSettings {
  enabled: boolean;
  speechRecognitionEnabled: boolean;
  textToSpeechEnabled: boolean;
  voiceSpeed: number;
  language: string;
}

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  fontSize: 'small' | 'medium' | 'large';
  keyboardNavigation: boolean;
}