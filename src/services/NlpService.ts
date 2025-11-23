import { Message, PerformanceMetrics } from '../types';

// Lightweight NLP utilities without external deps.
// Uses simple token vectors and cosine similarity to approximate semantic overlap,
// repetition, and coherence trends over time.

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function vectorize(texts: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const t of texts) {
    counts.set(t, (counts.get(t) || 0) + 1);
  }
  return counts;
}

function cosineSim(a: Map<string, number>, b: Map<string, number>): number {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;
  a.forEach((va, k) => {
    aMag += va * va;
    const vb = b.get(k) || 0;
    dot += va * vb;
  });
  b.forEach(vb => { bMag += vb * vb; });
  if (aMag === 0 || bMag === 0) return 0;
  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}

export interface NlpAnalysis {
  originality: number; // 0..1 (1 = highly original vs recent bots)
  coherence: number;   // 0..1 (1 = builds logically over time)
  repetition: number;  // 0..1 (1 = heavy repetition)
}

class NlpService {
  analyze(messages: Message[], currentUserText: string): NlpAnalysis {
    const lastBots = messages.filter(m => m.type === 'bot').slice(-3);
    const lastUser = [...messages].reverse().find(m => m.type === 'user');

    const curVec = vectorize(tokenize(currentUserText));
    const botSims = lastBots.map(b => cosineSim(curVec, vectorize(tokenize(b.content))));
    const maxBotSim = botSims.length ? Math.max(...botSims) : 0;

    const originality = 1 - Math.min(1, maxBotSim); // higher sim => lower originality

    const lastUserSim = lastUser ? cosineSim(curVec, vectorize(tokenize(lastUser.content))) : 0.5;
    // Coherence rewards moderate similarity (building) and penalizes very low/high
    const coherence = 1 - Math.abs(lastUserSim - 0.6); // peak near 0.6

    const repetition = Math.max(0, lastUserSim - 0.7); // high sim indicates repetition

    return { originality, coherence: Math.max(0, Math.min(1, coherence)), repetition: Math.max(0, Math.min(1, repetition)) };
  }

  applyToMetrics(base: PerformanceMetrics, analysis: NlpAnalysis): PerformanceMetrics {
    const updated = { ...base };
    // Map signals to metrics gently
    updated.originality = Math.max(0, Math.min(100, updated.originality + (analysis.originality - 0.5) * 10));
    updated.reasoning = Math.max(0, Math.min(100, updated.reasoning + (analysis.coherence - 0.5) * 8));
    if (analysis.repetition > 0.2) {
      updated.fluency = Math.max(0, updated.fluency - analysis.repetition * 5);
    }
    return updated;
  }
}

export const nlpService = new NlpService();


