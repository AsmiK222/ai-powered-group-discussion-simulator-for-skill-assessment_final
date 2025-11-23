import { useState, useCallback, useRef } from 'react';
import { speechService } from '../services/SpeechService';

interface VoiceHook {
  isListening: boolean;
  isSpeaking: boolean;
  isSupported: boolean;
  startListening: () => Promise<string>;
  stopListening: () => void;
  speak: (text: string, rate?: number, pitch?: number, voiceIndex?: number) => Promise<void>;
  stopSpeaking: () => void;
}

export const useVoice = (): VoiceHook => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported] = useState(speechService.isSupported());
  const listeningRef = useRef(false);

  const startListening = useCallback((): Promise<string> => {
    if (!isSupported || isListening || listeningRef.current) {
      return Promise.reject(new Error('Cannot start listening'));
    }

    setIsListening(true);
    listeningRef.current = true;

    return speechService.startListening()
      .then((transcript) => {
        setIsListening(false);
        listeningRef.current = false;
        return transcript;
      })
      .catch((error) => {
        setIsListening(false);
        listeningRef.current = false;
        throw error;
      });
  }, [isSupported, isListening]);

  const stopListening = useCallback(() => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      listeningRef.current = false;
    }
  }, [isListening]);

  const speak = useCallback((text: string, rate = 1, pitch = 1, voiceIndex?: number): Promise<void> => {
    if (!isSupported || isSpeaking) {
      return Promise.reject(new Error('Cannot speak'));
    }

    setIsSpeaking(true);
    
    return speechService.speak(text, rate, pitch, voiceIndex)
      .then(() => {
        setIsSpeaking(false);
      })
      .catch((error) => {
        setIsSpeaking(false);
        throw error;
      });
  }, [isSupported, isSpeaking]);

  const stopSpeaking = useCallback(() => {
    if (isSpeaking) {
      speechService.stopSpeaking();
      setIsSpeaking(false);
    }
  }, [isSpeaking]);

  return {
    isListening,
    isSpeaking,
    isSupported,
    startListening,
    stopListening,
    speak,
    stopSpeaking
  };
};