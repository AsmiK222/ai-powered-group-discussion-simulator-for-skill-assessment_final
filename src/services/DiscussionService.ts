import { Bot, Message, PerformanceMetrics, RealtimeMetrics } from '../types';
import { ollamaService } from './OllamaService';
import { sequenceModelService, createDefaultEncoder } from './SequenceModelService';
import { BOTS } from '../data/bots';

class DiscussionService {
  private botResponses: Map<string, string[]> = new Map();
  // Accumulators for dynamic metrics over the session
  private totalWordsSpoken: number = 0;
  private currentMetrics: PerformanceMetrics = {
    confidence: 75,
    fluency: 70,
    originality: 65,
    teamwork: 80,
    reasoning: 72,
    wordsPerMinute: 0,
    fillerWords: 0,
    pausePattern: 8,
    sentiment: 75,
    participation: 85,
    emotionalEngagement: 70,
    dominantEmotion: 'neutral',
    emotionConfidence: 0.5
  };

  constructor() {
    this.initializeBotResponses();
    // Initialize default encoder (can be replaced later by caller) and attempt lazy model load if provided at runtime
    sequenceModelService.setEncoder(createDefaultEncoder());
  }

  private initializeBotResponses() {
    // Alexa - Knowledge Coach (user-led, encouraging)
    this.botResponses.set('alexa', [
      "I hear your direction. What part of your idea do you want to build next?",
      "Nice start. In one line, what’s the core point you want to lead with?",
      "Good progress—pick one example from your experience and say it in a sentence.",
      "You’re driving this. What outcome are you aiming for in your own words?"
    ]);

    // Maya - Communication Mentor (supportive prompts, short)
    this.botResponses.set('maya', [
      "Great—say your next thought in one clear line, then one example.",
      "Take the lead. What’s the simplest way to express your main idea now?",
      "You’ve got this. What’s one reason that backs your view?",
      "Nice. Want to try a short wrap in your own words?"
    ]);

    // Sarah - Leadership & Teamwork Guide (facilitative, user-first)
    this.botResponses.set('sarah', [
      "You’re setting the direction. Which angle do you want to explore next?",
      "Good momentum—choose one idea to develop and say it briefly.",
      "Let’s keep it your voice. What’s your next step in one sentence?",
      "Strong clarity. How would you summarize your stance in a line?"
    ]);

    // Momo - Panel Evaluator (reframed to motivational coaching)
    this.botResponses.set('momo', [
      "You’re doing well—what’s one concrete example you want to add?",
      "Nice clarity. Can you state your key message in 8–10 words?",
      "Good direction. What’s one piece of evidence you’d use to support it?",
      "Strong pace—lead us with your next insight in a sentence."
    ]);
  }

  async generateBotResponse(botId: string, userMessage: string, context: Message[]): Promise<string> {
    const responses = this.botResponses.get(botId) || [];
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      .replace('{student}', 'you');

    // Try Ollama first; fall back to local canned response on failure
    try {
      const model = botId === 'alexa' ? 'gemma' : botId === 'maya' ? 'mistral' : botId === 'sarah' ? 'llama3' : 'phi3';
      const systemPrompt = `You are ${botId}. Your only goal is to help the user lead the discussion.
Rules:
1) Focus entirely on the user's thoughts; do not debate other bots or introduce your own agenda.
2) Be brief (1–2 sentences). Encourage, reflect, and ask one open question that hands control back to the user.
3) Avoid long explanations, lists, or solutions; prompt the user to think and speak in their own words.
4) Use supportive, motivating tone; reference the user's last message.
Role context: ${BOTS.find(b=>b.id===botId)?.role}. Style: ${BOTS.find(b=>b.id===botId)?.responseStyle}.`;
      const history = context.map(m => `${m.type === 'user' ? 'User' : (BOTS.find(b=>b.id===m.botId!)?.name || 'Bot')}: ${m.content}`).join('\n');
      const prompt = `${systemPrompt}\n\nRecent messages:\n${history}\n\nLatest user message: ${userMessage}\n\nYour response:`;
      const reply = await ollamaService.generate(model, prompt);
      if (reply && reply.trim().length > 0) {
        // Strip markdown asterisks, bot name prefixes, and excessive whitespace
        let cleaned = reply
          .replace(/\*/g, '')
          .replace(/\{student\}/g, 'you')
          .replace(/\s+\n/g, '\n')
          .trim();
        
        // Remove bot name prefixes like "Sarah:", "Alexa:", "Maya:", "Momo:"
        cleaned = cleaned.replace(/^(Sarah|Alexa|Maya|Momo):\s*/i, '');
        
        return cleaned;
      }
    } catch (err) {
      // Swallow and fall back
      console.warn('Ollama generation failed, falling back to canned response', err);
    }
    
    // Add some contextual variation based on the bot's role
    const bot = BOTS.find(b => b.id === botId);
    if (!bot) return randomResponse;

    // Simulate more personalized responses based on context
    const messageCount = context.length;
    
    if (bot.id === 'alexa' && messageCount > 10) {
      return "We've covered a lot of ground! Let's try to synthesize our key insights and see where we stand.";
    }
    
    if (bot.id === 'momo' && userMessage.length > 100) {
      return "That was a well-structured argument with clear reasoning. The depth of analysis shows strong critical thinking skills.";
    }

    return randomResponse;
  }

  async updatePerformanceMetrics(message: string, isVoice: boolean, duration?: number): Promise<RealtimeMetrics> {
    // Simulate performance analysis
    const words = message.trim().length === 0 ? 0 : message.trim().split(/\s+/).length;
    const fillerMatches = message.match(/\b(uh+|um+|erm+|like|you know|actually|basically|literally|sort of|kind of|I mean)\b/gi);
    const fillerCount = fillerMatches ? fillerMatches.length : 0;
    const hasFillers = fillerCount > 0;
    const isConfident = message.length > 50 && !hasFillers;
    
    // Update metrics based on message analysis
    if (isConfident) this.currentMetrics.confidence += 2;
    if (words > 20) this.currentMetrics.fluency += 1;
    if (message.includes('because') || message.includes('therefore')) this.currentMetrics.reasoning += 1;
    if (fillerCount > 0) this.currentMetrics.fillerWords += fillerCount;
    
    // Accumulate total words and compute WPM when duration is available
    this.totalWordsSpoken += words;
    const totalSeconds = typeof duration === 'number' ? duration : 0;
    if (totalSeconds > 0) {
      const wpm = (this.totalWordsSpoken / totalSeconds) * 60;
      // Clamp to a reasonable human range to avoid UI spikes
      this.currentMetrics.wordsPerMinute = Math.max(30, Math.min(230, Math.round(wpm)));
    }
    
    // Reduce randomness amplitude to make changes reflect input more
    this.currentMetrics.confidence = Math.min(100, Math.max(0, this.currentMetrics.confidence + (Math.random() - 0.5) * 1));
    this.currentMetrics.fluency = Math.min(100, Math.max(0, this.currentMetrics.fluency + (Math.random() - 0.5) * 1));
    this.currentMetrics.originality = Math.min(100, Math.max(0, this.currentMetrics.originality + (Math.random() - 0.5) * 1.5));
    this.currentMetrics.teamwork = Math.min(100, Math.max(0, this.currentMetrics.teamwork + (Math.random() - 0.5) * 1));
    this.currentMetrics.reasoning = Math.min(100, Math.max(0, this.currentMetrics.reasoning + (Math.random() - 0.5) * 1));

    // If sequence model is ready, await its scores for immediate UI reflection
    if (sequenceModelService.isReady()) {
      try {
        const scores = await sequenceModelService.score([message]);
        if (scores) {
          // Blend with small alpha to keep UI stable
          const alpha = 0.35;
          this.currentMetrics.confidence = Math.min(100, Math.max(0, (1 - alpha) * this.currentMetrics.confidence + alpha * scores.confidence));
          this.currentMetrics.fluency = Math.min(100, Math.max(0, (1 - alpha) * this.currentMetrics.fluency + alpha * scores.fluency));
        }
      } catch (e) {
        // Ignore model errors in UI
        console.warn('Sequence model scoring failed:', e);
      }
    }

    const metrics: RealtimeMetrics = {
      ...this.currentMetrics,
      timestamp: new Date(),
      messageCount: 0,
      totalDuration: duration || 0
    };

    return metrics;
  }

  getCurrentMetrics(): PerformanceMetrics {
    return { ...this.currentMetrics };
  }

  resetMetrics(): void {
    this.currentMetrics = {
      confidence: 75,
      fluency: 70,
      originality: 65,
      teamwork: 80,
      reasoning: 72,
      wordsPerMinute: 0,
      fillerWords: 0,
      pausePattern: 8,
      sentiment: 75,
      participation: 85,
      emotionalEngagement: 70,
      dominantEmotion: 'neutral',
      emotionConfidence: 0.5
    };
    this.totalWordsSpoken = 0;
  }

  updateEmotionMetrics(emotionAnalysis: any): void {
    if (emotionAnalysis && emotionAnalysis.hasFace) {
      // Update emotional engagement based on emotion analysis
      this.currentMetrics.emotionalEngagement = Math.min(100, Math.max(0, 
        this.currentMetrics.emotionalEngagement + (emotionAnalysis.engagement - 0.5) * 20
      ));
      
      // Update dominant emotion and confidence
      this.currentMetrics.dominantEmotion = emotionAnalysis.dominantEmotion;
      this.currentMetrics.emotionConfidence = emotionAnalysis.confidence;
      
      // Adjust confidence based on emotional state
      const emotionMultiplier = this.getEmotionConfidenceMultiplier(emotionAnalysis.dominantEmotion);
      this.currentMetrics.confidence = Math.min(100, Math.max(0, 
        this.currentMetrics.confidence * emotionMultiplier
      ));
    }
  }

  private getEmotionConfidenceMultiplier(emotion: string): number {
    const multipliers = {
      happy: 1.1,      // Happy emotions boost confidence
      surprised: 1.05, // Surprise can indicate engagement
      neutral: 1.0,    // Neutral maintains current level
      nervous: 0.9,    // Nervousness reduces confidence
      sad: 0.85,       // Sadness reduces confidence
      angry: 0.95      // Anger slightly reduces confidence
    };
    return multipliers[emotion as keyof typeof multipliers] || 1.0;
  }


  // Simulate turn management
  getNextBot(lastBotId?: string): Bot {
    const availableBots = BOTS.filter(bot => bot.id !== lastBotId);
    return availableBots[Math.floor(Math.random() * availableBots.length)];
  }

  // Analyze user message for improvement suggestions
  analyzeMessage(message: string): string[] {
    const suggestions: string[] = [];
    
    if (message.length < 20) {
      suggestions.push("Try to elaborate more on your points for better clarity");
    }
    
    if (/\b(uh|um|like|you know)\b/gi.test(message)) {
      suggestions.push("Reduce filler words to improve fluency");
    }
    
    if (!message.includes('because') && !message.includes('since') && !message.includes('therefore')) {
      suggestions.push("Support your points with reasoning or evidence");
    }
    
    if (message === message.toUpperCase()) {
      suggestions.push("Use appropriate tone and avoid all caps");
    }
    
    return suggestions;
  }
}

export const discussionService = new DiscussionService();