class SpeechService {
  private speechRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private recognition: SpeechRecognition | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if ('speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
      this.loadVoices();
      // Some browsers load voices asynchronously
      window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
    }

    if ('webkitSpeechRecognition' in window) {
      this.speechRecognition = new (window as any).webkitSpeechRecognition();
      this.setupSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      this.speechRecognition = new SpeechRecognition();
      this.setupSpeechRecognition();
    }
  }

  private loadVoices() {
    if (!this.speechSynthesis) return;
    const all = this.speechSynthesis.getVoices();
    // Prefer English voices but keep all as fallback
    const english = all.filter(v => /en[-_]/i.test(v.lang) || /English/i.test(v.name));
    this.voices = english.length > 0 ? english : all;
  }

  private setupSpeechRecognition() {
    if (!this.speechRecognition) return;

    // Keep the mic open a bit longer and collect interim results for responsiveness
    this.speechRecognition.continuous = true;
    this.speechRecognition.interimResults = true;
    this.speechRecognition.lang = 'en-US';
  }

  isSupported(): boolean {
    return !!(this.speechRecognition && this.speechSynthesis);
  }

  startListening(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition || this.isListening) {
        reject(new Error('Speech recognition not available or already listening'));
        return;
      }

      let finalTranscript = '';
      let timeout: NodeJS.Timeout;
      let silenceResolveTimer: NodeJS.Timeout | undefined;
      let lastInterimCandidate = '';

      this.speechRecognition.onstart = () => {
        this.isListening = true;
        // Extend timeout to better accommodate initial mic activation delays
        timeout = setTimeout(() => {
          this.stopListening();
          const candidate = this.cleanTranscript((finalTranscript || lastInterimCandidate).trim());
          if (candidate) {
            resolve(candidate);
          } else {
            reject(new Error('No speech detected'));
          }
        }, 25000); // 25 second timeout
      };

      this.speechRecognition.onresult = (event) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            // Resolve early on first final result for faster UX
            const cleaned = this.cleanTranscript(finalTranscript.trim());
            if (cleaned) {
              clearTimeout(timeout);
              if (silenceResolveTimer) clearTimeout(silenceResolveTimer);
              this.stopListening();
              resolve(cleaned);
              return;
            }
          } else {
            interimTranscript += transcript;
          }
        }
        // Keep the session alive while user is speaking
        if (interimTranscript.trim()) {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            this.stopListening();
            const candidate = this.cleanTranscript((finalTranscript || lastInterimCandidate).trim());
            if (candidate) {
              resolve(candidate);
            } else {
              reject(new Error('No speech detected'));
            }
          }, 7000);

          // Also resolve if user pauses after interim speech
          if (silenceResolveTimer) clearTimeout(silenceResolveTimer);
          const candidate = this.cleanTranscript((finalTranscript + ' ' + interimTranscript).trim());
          lastInterimCandidate = candidate || lastInterimCandidate;
          silenceResolveTimer = setTimeout(() => {
            if (candidate) {
              clearTimeout(timeout);
              this.stopListening();
              resolve(candidate);
            }
          }, 1800);
        }
      };

      this.speechRecognition.onend = () => {
        this.isListening = false;
        clearTimeout(timeout);
        if (silenceResolveTimer) clearTimeout(silenceResolveTimer);
        
        if (finalTranscript.trim() || lastInterimCandidate) {
          const candidate = this.cleanTranscript((finalTranscript || lastInterimCandidate).trim());
          if (candidate) resolve(candidate);
        }
      };

      this.speechRecognition.onerror = (event) => {
        this.isListening = false;
        clearTimeout(timeout);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      try {
        this.speechRecognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  stopListening() {
    if (this.speechRecognition && this.isListening) {
      this.speechRecognition.stop();
      this.isListening = false;
    }
  }

  private cleanTranscript(transcript: string): string {
    // Remove common filler words and clean up transcript
    return transcript
      .replace(/\b(um|uh|like|you know|actually)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  speak(text: string, rate = 1, pitch = 1, voiceIndex?: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.speechSynthesis) {
        reject(new Error('Speech synthesis not available'));
        return;
      }

      // Cancel any ongoing speech
      this.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 0.8;
      if (typeof voiceIndex === 'number' && this.voices.length > 0) {
        const selected = this.voices[voiceIndex % this.voices.length];
        if (selected) {
          utterance.voice = selected;
        }
      }

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));

      this.speechSynthesis.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
  }

  getIsListening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();