import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import * as tf from '@tensorflow/tfjs';

export interface EmotionSignals {
  hasFace: boolean;
  eyeContact: number; // 0..1
  smile: number; // 0..1
  frown: number; // 0..1
  lipBite: number; // 0..1
  landmarks?: any;
}

export interface EmotionAnalysis {
  emotions: {
    happy: number;
    sad: number;
    angry: number;
    surprised: number;
    nervous: number;
    neutral: number;
  };
  dominantEmotion: string;
  confidence: number;
  hasFace: boolean;
  eyeContact: number;
  engagement: number;
}

export class EmotionService {
  private landmarker: FaceLandmarker | null = null;
  private emotionModel: tf.LayersModel | null = null;
  private faceDetector: any | null = null;
  private isModelLoaded = false;

  async ensureModels(): Promise<void> {
    if (this.isModelLoaded) return;
    
    try {
      // Load MediaPipe face landmarker
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
      );
      this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: { modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task' },
        // Use IMAGE mode so we can call detect(canvas) reliably from our pipeline
        runningMode: 'IMAGE',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false
      } as any);

      // Load TensorFlow.js emotion model
      await this.loadEmotionModel();
      
      // Load face detector for cropping
      await this.loadFaceDetector();
      
      this.isModelLoaded = true;
    } catch (error) {
      console.warn('Failed to load emotion models:', error);
    }
  }

  private async loadEmotionModel(): Promise<void> {
    try {
      // Try to load a pre-trained emotion recognition model
      // For now, we'll create a simple CNN model for emotion classification
      this.emotionModel = await this.createEmotionCNN();
    } catch (error) {
      console.warn('Failed to load emotion CNN model:', error);
    }
  }

  private async createEmotionCNN(): Promise<tf.LayersModel> {
    // Create a simple CNN model for emotion classification
    const model = tf.sequential({
      layers: [
        // Input layer for 48x48 grayscale images
        tf.layers.conv2d({
          inputShape: [48, 48, 1],
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        
        tf.layers.flatten(),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 6, activation: 'softmax' }) // 6 emotions
      ]
    });

    model.compile({
      optimizer: 'adam',
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  private async loadFaceDetector(): Promise<void> {
    try {
      // Use BlazeFace for face detection
      const blazeFace = await import('@tensorflow-models/blazeface');
      this.faceDetector = await blazeFace.load();
    } catch (error) {
      console.warn('Failed to load BlazeFace:', error);
    }
  }

  analyze(canvas: HTMLCanvasElement): EmotionSignals {
    if (!this.landmarker) {
      return { hasFace: false, eyeContact: 0.5, smile: 0, frown: 0, lipBite: 0 };
    }
    const detections = this.landmarker.detect(canvas as unknown as HTMLVideoElement);
    const face = (detections as any)?.faceLandmarks?.[0];
    const blend = (detections as any)?.faceBlendshapes?.[0]?.categories || [];

    if (!face) {
      return { hasFace: false, eyeContact: 0.3, smile: 0, frown: 0, lipBite: 0 };
    }

    const get = (name: string) => blend.find((c: any) => c.categoryName === name)?.score ?? 0;

    // Use blendshape proxies
    const smile = Math.max(get('smile'), get('mouthSmileLeft'), get('mouthSmileRight'));
    const frown = Math.max(get('mouthFrownLeft'), get('mouthFrownRight'));
    const eyeIn = (get('eyeLookInLeft') + get('eyeLookInRight')) / 2;
    const eyeOut = (get('eyeLookOutLeft') + get('eyeLookOutRight')) / 2;
    const eyeContact = Math.max(0, 1 - (eyeOut + Math.abs(eyeIn)));
    const lipBite = Math.max(get('mouthClose'), get('mouthPressLeft'), get('mouthPressRight')) * 0.7;

    return { hasFace: true, eyeContact, smile, frown, lipBite, landmarks: face };
  }

  async analyzeEmotions(canvas: HTMLCanvasElement): Promise<EmotionAnalysis> {
    await this.ensureModels();

    // Default response if no models are available
    const defaultResponse: EmotionAnalysis = {
      emotions: {
        happy: 0.2,
        sad: 0.1,
        angry: 0.1,
        surprised: 0.1,
        nervous: 0.2,
        neutral: 0.3
      },
      dominantEmotion: 'neutral',
      confidence: 0.3,
      hasFace: false,
      eyeContact: 0.5,
      engagement: 0.5
    };

    if (!this.landmarker) {
      return defaultResponse;
    }

    try {
      // Get MediaPipe analysis
      const emotionSignals = this.analyze(canvas);
      
      if (!emotionSignals.hasFace) {
        return defaultResponse;
      }

      // Get CNN emotion predictions
      const cnnEmotions = await this.predictEmotionsCNN(canvas);
      
      // Combine MediaPipe and CNN results
      const combinedEmotions = this.combineEmotionResults(emotionSignals, cnnEmotions);
      
      // Calculate engagement based on eye contact and facial expressions
      const engagement = this.calculateEngagement(emotionSignals, combinedEmotions);

      return {
        emotions: combinedEmotions,
        dominantEmotion: this.getDominantEmotion(combinedEmotions),
        confidence: this.calculateConfidence(combinedEmotions),
        hasFace: emotionSignals.hasFace,
        eyeContact: emotionSignals.eyeContact,
        engagement
      };
    } catch (error) {
      console.warn('Emotion analysis failed:', error);
      return defaultResponse;
    }
  }

  private async predictEmotionsCNN(canvas: HTMLCanvasElement): Promise<{ [key: string]: number }> {
    if (!this.emotionModel || !this.faceDetector) {
      // Fallback to heuristic-based emotion detection
      return this.heuristicEmotionDetection(canvas);
    }

    try {
      // Detect and crop face
      const faceBox = await this.detectAndCropFace(canvas);
      if (!faceBox) {
        return this.heuristicEmotionDetection(canvas);
      }

      // Preprocess image for CNN
      const processedImage = this.preprocessImageForCNN(faceBox);
      
      // Run CNN prediction
      const prediction = this.emotionModel.predict(processedImage) as tf.Tensor;
      const probabilities = await prediction.data();
      
      // Map probabilities to emotion names
      const emotionNames = ['happy', 'sad', 'angry', 'surprised', 'nervous', 'neutral'];
      const emotions: { [key: string]: number } = {};
      
      emotionNames.forEach((emotion, index) => {
        emotions[emotion] = probabilities[index];
      });

      prediction.dispose();
      processedImage.dispose();
      
      return emotions;
    } catch (error) {
      console.warn('CNN emotion prediction failed:', error);
      return this.heuristicEmotionDetection(canvas);
    }
  }

  private async detectAndCropFace(canvas: HTMLCanvasElement): Promise<HTMLCanvasElement | null> {
    if (!this.faceDetector) return null;

    try {
      const detections = await this.faceDetector.estimateFaces(canvas, false);
      if (detections.length === 0) return null;

      const detection = detections[0];
      const box = detection.topLeft.concat(detection.bottomRight);
      
      // Crop face region
      const croppedCanvas = document.createElement('canvas');
      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) return null;

      const [x1, y1, x2, y2] = box;
      const width = x2 - x1;
      const height = y2 - y1;
      
      croppedCanvas.width = 48;
      croppedCanvas.height = 48;
      
      ctx.drawImage(
        canvas,
        x1, y1, width, height,
        0, 0, 48, 48
      );

      return croppedCanvas;
    } catch (error) {
      console.warn('Face detection failed:', error);
      return null;
    }
  }

  private preprocessImageForCNN(canvas: HTMLCanvasElement): tf.Tensor {
    // Convert canvas to tensor and normalize
    const imageData = canvas.getContext('2d')?.getImageData(0, 0, 48, 48);
    if (!imageData) {
      throw new Error('Failed to get image data');
    }

    const pixels = imageData.data;
    const grayscalePixels = [];
    
    // Convert to grayscale
    for (let i = 0; i < pixels.length; i += 4) {
      const gray = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      grayscalePixels.push(gray / 255); // Normalize to [0, 1]
    }

    return tf.tensor4d(grayscalePixels, [1, 48, 48, 1]);
  }

  private heuristicEmotionDetection(canvas: HTMLCanvasElement): { [key: string]: number } {
    // Fallback heuristic-based emotion detection using MediaPipe blendshapes
    const emotionSignals = this.analyze(canvas);
    
    if (!emotionSignals.hasFace) {
      return {
        happy: 0.2,
        sad: 0.1,
        angry: 0.1,
        surprised: 0.1,
        nervous: 0.2,
        neutral: 0.3
      };
    }

    // Map MediaPipe signals to emotions
    const emotions = {
      happy: Math.max(0, emotionSignals.smile - emotionSignals.frown),
      sad: Math.max(0, emotionSignals.frown - emotionSignals.smile),
      angry: Math.max(0, emotionSignals.frown * 0.8),
      surprised: Math.max(0, emotionSignals.eyeContact * 0.3),
      nervous: Math.max(0, emotionSignals.lipBite * 0.7),
      neutral: Math.max(0, 1 - emotionSignals.smile - emotionSignals.frown - emotionSignals.lipBite)
    };

    // Normalize probabilities
    const total = Object.values(emotions).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(emotions).forEach(key => {
        emotions[key] = emotions[key] / total;
      });
    }

    return emotions;
  }

  private combineEmotionResults(
    mediaPipeSignals: EmotionSignals, 
    cnnEmotions: { [key: string]: number }
  ): { [key: string]: number } {
    // Combine MediaPipe and CNN results with weights
    const mediaPipeWeight = 0.3;
    const cnnWeight = 0.7;

    const combined = { ...cnnEmotions };
    
    // Adjust based on MediaPipe signals
    combined.happy = cnnEmotions.happy * cnnWeight + mediaPipeSignals.smile * mediaPipeWeight;
    combined.sad = cnnEmotions.sad * cnnWeight + mediaPipeSignals.frown * mediaPipeWeight;
    combined.nervous = cnnEmotions.nervous * cnnWeight + mediaPipeSignals.lipBite * mediaPipeWeight;
    
    // Normalize
    const total = Object.values(combined).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(combined).forEach(key => {
        combined[key] = combined[key] / total;
      });
    }

    return combined;
  }

  private getDominantEmotion(emotions: { [key: string]: number }): string {
    let maxEmotion = 'neutral';
    let maxValue = -Infinity;
    for (const [emotion, value] of Object.entries(emotions)) {
      if (value > maxValue) {
        maxValue = value;
        maxEmotion = emotion;
      }
    }
    return maxEmotion;
  }

  private calculateConfidence(emotions: { [key: string]: number }): number {
    const values = Object.values(emotions).slice().sort((a, b) => b - a);
    const max = values[0] ?? 0.5;
    const secondMax = values[1] ?? 0.5;
    const margin = Math.max(0, max - secondMax);
    return Math.min(1, margin + 0.1);
  }

  private calculateEngagement(
    emotionSignals: EmotionSignals, 
    emotions: { [key: string]: number }
  ): number {
    // Calculate engagement based on eye contact, facial expressions, and emotions
    const eyeContactScore = emotionSignals.eyeContact;
    const expressionScore = emotions.happy + emotions.surprised - emotions.sad - emotions.nervous;
    const normalizedExpressionScore = (expressionScore + 1) / 2; // Normalize to [0, 1]
    
    return (eyeContactScore + normalizedExpressionScore) / 2;
  }
}

export const emotionService = new EmotionService();



