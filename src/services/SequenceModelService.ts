import * as tf from '@tensorflow/tfjs';

export interface SequenceScores {
  confidence: number; // 0..100
  fluency: number;    // 0..100
}

export type SequenceEncoder = (utterances: string[]) => tf.Tensor; // shape: [1, T, F]

class SequenceModelService {
  private model: tf.LayersModel | null = null;
  private encoder: SequenceEncoder | null = null;
  private maxTimeSteps: number = 64;
  private modelType: 'rnn' | 'lstm' | 'cnn' | 'unknown' = 'unknown';
  private useModel: any | null = null;

  setEncoder(encoder: SequenceEncoder, maxTimeSteps = 64) {
    this.encoder = encoder;
    this.maxTimeSteps = maxTimeSteps;
  }

  async loadModel(modelUrl: string, modelType: 'rnn' | 'lstm' | 'cnn' | 'unknown' = 'unknown') {
    this.model = await tf.loadLayersModel(modelUrl);
    this.modelType = modelType;
  }

  // Load Universal Sentence Encoder at runtime (no model.json needed)
  async loadUSE(): Promise<boolean> {
    try {
      const modName = '@tensorflow-models/universal-sentence-encoder';
      // @ts-ignore
      const use = await import(/* @vite-ignore */ modName);
      this.useModel = await (use as any).load();
      return true;
    } catch {
      this.useModel = null;
      return false;
    }
  }

  isReady(): boolean {
    return !!this.model && !!this.encoder;
  }

  private clamp01(x: number) {
    return Math.max(0, Math.min(1, x));
  }

  // Run inference: expects encoder to provide [1, T, F] with T<=maxTimeSteps
  async score(utterances: string[]): Promise<SequenceScores | null> {
    // Path 1: custom model.json with encoder
    if (this.model && this.encoder) {
      const encoded = this.encoder(utterances);
      const shaped = tf.tidy(() => {
        const input = encoded as tf.Tensor3D;
        const [b, t, f] = input.shape;
        if (t === this.maxTimeSteps) return input;
        if (t > this.maxTimeSteps) {
          return input.slice([0, t - this.maxTimeSteps, 0], [b, this.maxTimeSteps, f]);
        }
        const pad = this.maxTimeSteps - t;
        const zeros = tf.zeros([b, pad, f]);
        return tf.concat([zeros, input], 1);
      });

      const out = this.model.predict(shaped) as tf.Tensor | tf.Tensor[];
      const tensor = Array.isArray(out) ? out[0] : out;
      const values = await tensor.data();
      tensor.dispose();
      shaped.dispose();
      encoded.dispose();

      const v0 = values[0] ?? 0.5;
      const v1 = values[1] ?? 0.5;
      const s0 = this.clamp01(Number.isFinite(v0) ? (v0 > 1 || v0 < 0 ? 1 / (1 + Math.exp(-v0)) : v0) : 0.5);
      const s1 = this.clamp01(Number.isFinite(v1) ? (v1 > 1 || v1 < 0 ? 1 / (1 + Math.exp(-v1)) : v1) : 0.5);
      return { confidence: s0 * 100, fluency: s1 * 100 };
    }

    // Path 2: USE embeddings mapped via light heuristics
    if (this.useModel) {
      const sentences = utterances.slice(-4);
      const emb = await this.useModel.embed(sentences);
      const vals = await emb.array();
      emb.dispose();
      const norms = vals.map((v: number[]) => Math.sqrt(v.reduce((s, x) => s + x * x, 0)));
      const avgNorm = norms.reduce((a: number, b: number) => a + b, 0) / Math.max(1, norms.length);
      const cos = (a: number[], b: number[]) => {
        const dot = a.reduce((s, x, i) => s + x * b[i], 0);
        const na = Math.sqrt(a.reduce((s, x) => s + x * x, 0));
        const nb = Math.sqrt(b.reduce((s, x) => s + x * x, 0));
        return na && nb ? dot / (na * nb) : 0;
      };
      let sim = 0.5;
      if (vals.length >= 2) sim = (cos(vals[vals.length - 1], vals[vals.length - 2]) + 1) / 2;
      const confidence = this.clamp01(0.4 + 0.6 * (avgNorm / 20)) * 100;
      const fluency = this.clamp01(0.4 + 0.6 * sim) * 100;
      return { confidence, fluency };
    }

    return null;
  }
}

export const sequenceModelService = new SequenceModelService();

// Default simple encoder: character-level buckets + basic features
// You can replace with a better tokenization/embedding pipeline to match your trained model.
export function createDefaultEncoder(vocab: string = 'abcdefghijklmnopqrstuvwxyz '): SequenceEncoder {
  const charToIndex = new Map<string, number>();
  [...vocab].forEach((c, i) => charToIndex.set(c, i));
  const vocabSize = vocab.length;
  const maxLen = 200; // per-utterance char limit for lightweight demo

  return (utterances: string[]) => {
    const featuresPerStep = vocabSize + 3; // one-hot + [isPause, isFiller, lengthNorm]
    const steps: number[][] = [];
    for (const utt of utterances.slice(-16)) {
      const text = utt.toLowerCase();
      const len = Math.min(text.length, maxLen);
      const onehot = new Array(vocabSize).fill(0);
      for (let i = 0; i < len; i++) {
        const ch = text[i];
        const idx = charToIndex.get(ch);
        if (idx !== undefined) onehot[idx] += 1;
      }
      // normalize
      for (let i = 0; i < vocabSize; i++) onehot[i] = onehot[i] / Math.max(1, len);
      const isPause = /\.\.\.|\s{2,}/.test(text) ? 1 : 0;
      const hasFiller = /(uh|um|like|you know|actually|so\s|i guess|maybe)/.test(text) ? 1 : 0;
      const lengthNorm = Math.min(1, len / 120);
      steps.push([...onehot, isPause, hasFiller, lengthNorm]);
    }
    if (steps.length === 0) steps.push(new Array(featuresPerStep).fill(0));
    const t = tf.tensor3d([steps], [1, steps.length, featuresPerStep]);
    return t;
  };
}



