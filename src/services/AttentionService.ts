// Lightweight attention heuristics with optional TFJS.
// Computes an attention score [0,1] using face detection (if available) and motion.

export interface AttentionResult {
  score: number; // 0..1
  faces: number;
  lookingAtCenter?: boolean;
}

export class AttentionService {
  private faceDetector: any | null = null;
  private tfReady = false;
  private tf: any | null = null;
  private cnnModel: any | null = null; // optional TFJS CNN for attention
  private landmarksModel: any | null = null; // @tensorflow-models/face-landmarks-detection

  async ensureModels(): Promise<void> {
    if (this.faceDetector) return;
    try {
      // Dynamic import TFJS models only when needed
      // Avoid bundler resolution if not installed; try dynamic name
      const tfModule = '@tensorflow/tfjs';
      // @ts-ignore
      const tf = await import(/* @vite-ignore */ tfModule);
      if (tf && (tf as any).ready) await (tf as any).ready();
      this.tf = tf;
      this.tfReady = true;
      // Use the browser FaceDetector API if present as a lighter alternative
      if ('FaceDetector' in window) {
        // @ts-ignore
        this.faceDetector = new (window as any).FaceDetector({ fastMode: true });
        return;
      }
      // Fallback to blazeface if available
      try {
        const blazeModule = '@tensorflow-models/blazeface';
        // @ts-ignore
        const blazeface = await import(/* @vite-ignore */ blazeModule);
        this.faceDetector = await (blazeface as any).load();
      } catch {
        this.faceDetector = null;
      }
    } catch {
      // TFJS not available; operate with heuristics only
      this.tfReady = false;
      this.tf = null;
      this.faceDetector = null;
    }
  }

  // Optionally load a TFJS CNN attention model (e.g., small ConvNet that outputs [attentionScore])
  async loadCnnModel(modelUrl: string): Promise<boolean> {
    try {
      if (!this.tfReady) {
        await this.ensureModels();
      }
      if (!this.tf) return false;
      this.cnnModel = await (this.tf as any).loadLayersModel(modelUrl);
      return true;
    } catch {
      this.cnnModel = null;
      return false;
    }
  }

  // Load face landmarks detection model (no URL needed; uses package weights)
  async loadLandmarksModel(): Promise<boolean> {
    try {
      if (!this.tfReady) {
        await this.ensureModels();
      }
      // dynamic import to avoid bundling if unused
      const modName = '@tensorflow-models/face-landmarks-detection';
      // @ts-ignore
      const faceLandmarks = await import(/* @vite-ignore */ modName);
      // Use MediaPipe/TFJS runtime automatically
      this.landmarksModel = await (faceLandmarks as any).load((faceLandmarks as any).SupportedPackages.mediapipeFacemesh);
      return true;
    } catch {
      this.landmarksModel = null;
      return false;
    }
  }

  async estimateAttention(canvas: HTMLCanvasElement): Promise<AttentionResult> {
    // Default heuristic: if no models, return mid score based on motion (not implemented here)
    const ctx = canvas.getContext('2d');
    if (!ctx) return { score: 0.5, faces: 0 };
    let faces = 0;
    let lookingAtCenter = false;

    // If a landmarks model is available, use it for primary attention scoring
    if (this.landmarksModel) {
      try {
        const preds = await this.landmarksModel.estimateFaces({ input: canvas });
        const facesFound = Array.isArray(preds) ? preds.length : 0;
        if (facesFound > 0) {
          const box = (preds[0].box || preds[0].boundingBox) as any;
          if (box) {
            const x = (('xMin' in box) ? (box as any).xMin : (box as any).topLeft && (box as any).topLeft[0]) ?? 0;
            const y = (('yMin' in box) ? (box as any).yMin : (box as any).topLeft && (box as any).topLeft[1]) ?? 0;
            const w = (box.width ?? (box.bottomRight?.[0] - box.topLeft?.[0]) ?? canvas.width / 3);
            const h = (box.height ?? (box.bottomRight?.[1] - box.topLeft?.[1]) ?? canvas.height / 3);
            const cx = x + w / 2;
            const cy = y + h / 2;
            const dx = Math.abs(cx - canvas.width / 2) / (canvas.width / 2);
            const dy = Math.abs(cy - canvas.height / 2) / (canvas.height / 2);
            const nearCenter = dx < 0.2 && dy < 0.2;
            const score = Math.min(1, Math.max(0, 0.6 + (nearCenter ? 0.3 : 0)));
            return { score, faces: facesFound, lookingAtCenter: nearCenter };
          }
        }
      } catch {
        // fall through to next method
      }
    }

    // If a CNN model is available, use it next
    if (this.cnnModel && this.tf) {
      try {
        const tf = this.tf as any;
        const size = 96;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const input = tf.tidy(() => {
          const t = tf.browser.fromPixels(imageData).toFloat();
          const resized = tf.image.resizeBilinear(t, [size, size]);
          const gray = resized.mean(2).expandDims(2); // [H,W,1]
          const norm = gray.div(255);
          return norm.expandDims(0); // [1,H,W,1]
        });
        const out = this.cnnModel.predict(input);
        const tensor = Array.isArray(out) ? out[0] : out;
        const vals = await tensor.data();
        const raw = Number(vals[0] ?? 0.5);
        const score = Math.max(0, Math.min(1, raw > 1 || raw < 0 ? 1 / (1 + Math.exp(-raw)) : raw));
        tensor.dispose();
        input.dispose();
        return { score, faces: 0, lookingAtCenter: false };
      } catch {
        // Fall through to heuristic path
      }
    }

    if (this.faceDetector) {
      try {
        let detections: any[] = [];
        if (this.faceDetector.estimateFaces) {
          detections = await this.faceDetector.estimateFaces(canvas, false);
        } else if (this.faceDetector.detect) {
          detections = await this.faceDetector.detect(canvas as any);
        }
        faces = detections.length;
        if (faces > 0) {
          const box = detections[0].box || detections[0].topLeft && detections[0].bottomRight && {
            x: detections[0].topLeft[0],
            y: detections[0].topLeft[1],
            width: detections[0].bottomRight[0] - detections[0].topLeft[0],
            height: detections[0].bottomRight[1] - detections[0].topLeft[1]
          };
          if (box) {
            const cx = box.x + box.width / 2;
            const cy = box.y + box.height / 2;
            const dx = Math.abs(cx - canvas.width / 2) / (canvas.width / 2);
            const dy = Math.abs(cy - canvas.height / 2) / (canvas.height / 2);
            lookingAtCenter = dx < 0.2 && dy < 0.2;
          }
        }
      } catch {
        // ignore detection errors
      }
    }

    const base = faces > 0 ? 0.7 : 0.4;
    const bonus = lookingAtCenter ? 0.2 : 0;
    const score = Math.min(1, Math.max(0, base + bonus));
    return { score, faces, lookingAtCenter };
  }
}

export const attentionService = new AttentionService();


