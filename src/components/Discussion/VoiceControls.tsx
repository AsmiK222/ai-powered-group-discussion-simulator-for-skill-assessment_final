import React, { useState } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';

interface VoiceControlsProps {
  onTranscription: (text: string) => void;
  disabled?: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({ onTranscription, disabled = false }) => {
  const { isListening, isSpeaking, isSupported, startListening, stopListening, stopSpeaking } = useVoice();
  const [transcription, setTranscription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleStartListening = async () => {
    if (!isSupported) {
      setError('Voice recognition is not supported in your browser');
      return;
    }

    try {
      setError(null);
      setTranscription('Listening...');
      const result = await startListening();
      setTranscription(result);
      onTranscription(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice recognition failed');
      setTranscription('');
    }
  };

  const handleStopListening = () => {
    stopListening();
    setTranscription('');
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-700">
          Voice features are not supported in your browser. Please use a modern browser with microphone support.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Voice Controls</h3>
        <div className="flex space-x-2">
          {/* Microphone Control */}
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            disabled={disabled || isSpeaking}
            className={`p-3 rounded-full transition-all duration-200 ${
              isListening
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed'
            }`}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin mr-1" />
                <MicOff className="h-5 w-5" />
              </div>
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>

          {/* Speaker Control */}
          <button
            onClick={handleStopSpeaking}
            disabled={!isSpeaking}
            className={`p-3 rounded-full transition-all duration-200 ${
              isSpeaking
                ? 'bg-orange-600 text-white hover:bg-orange-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            title="Stop speaking"
          >
            {isSpeaking ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Status Display */}
      <div className="min-h-[60px] p-3 bg-gray-50 rounded-md">
        {transcription && (
          <div className="text-sm">
            <p className="text-gray-600 mb-1">Transcription:</p>
            <p className="text-gray-900 italic">{transcription}</p>
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-600">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {!transcription && !error && (
          <div className="text-sm text-gray-500">
            <p>Click the microphone button to start voice input</p>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center ${isListening ? 'text-red-600' : ''}`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
            {isListening ? 'Listening' : 'Not listening'}
          </div>
          
          <div className={`flex items-center ${isSpeaking ? 'text-orange-600' : ''}`}>
            <div className={`w-2 h-2 rounded-full mr-1 ${isSpeaking ? 'bg-orange-500 animate-pulse' : 'bg-gray-300'}`}></div>
            {isSpeaking ? 'Speaking' : 'Silent'}
          </div>
        </div>
        
        <p>Voice recognition ready</p>
      </div>
    </div>
  );
};