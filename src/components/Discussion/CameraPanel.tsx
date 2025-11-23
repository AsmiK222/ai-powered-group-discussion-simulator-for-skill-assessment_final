import React, { useCallback, useEffect, useRef, useState } from 'react';
import { attentionService } from '../../services/AttentionService';
import { emotionService, EmotionAnalysis } from '../../services/EmotionService';

interface CameraPanelProps {
  onAnalysis?: (data: { faces?: number; postureScore?: number; emotions?: EmotionAnalysis }) => void;
  disabled?: boolean;
}

export const CameraPanel: React.FC<CameraPanelProps> = ({ onAnalysis, disabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [currentEmotions, setCurrentEmotions] = useState<EmotionAnalysis | null>(null);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsRunning(true);
    } catch (e: any) {
      setError(e?.message || 'Camera access denied');
    }
  }, []);

  const stop = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    let raf: number;
    let lastAnalysisTime = 0;
    const analysisInterval = 200; // Run analysis every 200ms (5 fps) to reduce load
    
    const draw = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas) { raf = requestAnimationFrame(draw); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) { raf = requestAnimationFrame(draw); return; }
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      if (video.videoWidth && video.videoHeight) {
        // Draw the video frame onto canvas (not mirrored in pixel data so analysis is stable)
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      
      // Throttle analysis to reduce CPU load
      const now = Date.now();
      if (now - lastAnalysisTime < analysisInterval) {
        raf = requestAnimationFrame(draw);
        return;
      }
      lastAnalysisTime = now;
      
      // Run attention and emotion analysis
      Promise.all([
        attentionService.ensureModels().then(() => attentionService.estimateAttention(canvas)),
        emotionService.ensureModels().then(() => emotionService.analyzeEmotions(canvas))
      ]).then(([attentionResult, emotionResult]) => {
        if (onAnalysis) {
          onAnalysis({ 
            faces: attentionResult.faces, 
            postureScore: attentionResult.score,
            emotions: emotionResult
          });
        }
        
        // Update emotion state for UI display
        setCurrentEmotions(emotionResult);
        
        // Draw face detection box if face found
        if (emotionResult.hasFace) {
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.9)'; // yellow/orange box
          ctx.lineWidth = 3;
          // Draw box around center area where face is detected
          const boxSize = Math.min(canvas.width, canvas.height) * 0.4;
          const boxX = (canvas.width - boxSize) / 2;
          const boxY = (canvas.height - boxSize) / 2;
          ctx.strokeRect(boxX, boxY, boxSize, boxSize);
        }
      }).catch(() => {
        // ignore if models not available
      });
      raf = requestAnimationFrame(draw);
    };
    if (isRunning) raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [isRunning, onAnalysis]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  const emotionColors = {
    happy: { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' },
    sad: { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
    angry: { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' },
    surprised: { bg: 'bg-purple-100', text: 'text-purple-800', bar: 'bg-purple-500' },
    nervous: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-500' },
    neutral: { bg: 'bg-gray-100', text: 'text-gray-800', bar: 'bg-gray-500' }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-medium text-gray-900">Camera</h3>
        <div className="space-x-2">
          <button onClick={start} disabled={disabled || isRunning} className="px-3 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50 text-sm">Start</button>
          <button onClick={stop} disabled={!isRunning} className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 disabled:opacity-50 text-sm">Stop</button>
          <button onClick={() => setIsMirrored(m => !m)} className="px-3 py-1.5 rounded bg-gray-200 text-gray-700 text-sm">{isMirrored ? 'Unmirror' : 'Mirror'}</button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      
      <div className="relative">
        <div className={`relative w-full aspect-video bg-black rounded overflow-hidden ${isMirrored ? 'transform -scale-x-100' : ''}`}>
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          
          {/* Emotion Overlay Panel */}
          {isRunning && currentEmotions && currentEmotions.hasFace && (
            <div className="absolute top-2 left-2 bg-white bg-opacity-95 rounded-lg p-3 shadow-lg" style={{ minWidth: '180px' }}>
              <div className="text-xs font-semibold text-gray-700 mb-2">Real-time Emotions</div>
              <div className="space-y-1.5">
                {Object.entries(currentEmotions.emotions).map(([emotion, value]) => {
                  const colors = emotionColors[emotion as keyof typeof emotionColors] || emotionColors.neutral;
                  const percentage = Math.round(value * 100);
                  return (
                    <div key={emotion} className="flex items-center justify-between text-xs">
                      <span className="capitalize text-gray-700 w-20">{emotion}</span>
                      <div className="flex-1 mx-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${colors.bar}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-gray-600 w-8 text-right">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
              
              {/* Dominant Emotion Badge */}
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Dominant:</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    emotionColors[currentEmotions.dominantEmotion as keyof typeof emotionColors]?.bg || 'bg-gray-100'
                  } ${
                    emotionColors[currentEmotions.dominantEmotion as keyof typeof emotionColors]?.text || 'text-gray-800'
                  }`}>
                    {currentEmotions.dominantEmotion}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">Webcam preview. Analysis will run locally when enabled.</p>
    </div>
  );
};


