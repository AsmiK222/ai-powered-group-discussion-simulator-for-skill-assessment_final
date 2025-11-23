import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Mic } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import { Message } from '../../types';
import { ChatMessage } from './ChatMessage';
 

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, isVoice?: boolean) => void;
  disabled?: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, disabled = false }) => {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { speak, stopSpeaking, isSpeaking, startListening, isSupported } = useVoice() as any;
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setIsTyping(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };

  const handlePlayVoice = async (text: string) => {
    try {
      await speak(text, 0.9, 1);
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h3 className="text-lg font-medium text-gray-900">Group Discussion</h3>
        <p className="text-sm text-gray-600">Share your thoughts and engage with AI participants</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '400px' }}>
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Start the discussion by sharing your thoughts!</p>
            <p className="text-gray-400 text-sm mt-2">The AI bots will respond and engage with your ideas</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage 
                key={message.id} 
                message={message} 
                onPlayVoice={handlePlayVoice}
              />
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-end mb-4">
                <div className="max-w-xs lg:max-w-md px-4 py-2 bg-blue-100 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm text-blue-700">You are typing...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? "Discussion ended" : "Type your message..."}
              disabled={disabled}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() || disabled}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Send className="h-4 w-4" />
          </button>

          {/* Inline mic next to send button */}
          <button
            type="button"
            onClick={async () => {
              setVoiceError(null);
              try {
                if (!isSupported || disabled) return;
                const text = await startListening();
                if (text && text.trim()) {
                  onSendMessage(text.trim(), true);
                }
              } catch (e:any) {
                setVoiceError(e?.message || 'Voice input failed');
              }
            }}
            disabled={disabled}
            title="Speak"
            className="inline-flex items-center px-3 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:bg-gray-200"
          >
            <Mic className="h-4 w-4" />
          </button>
        </form>

        {voiceError && (
          <div className="text-xs text-red-600 mt-1">{voiceError}</div>
        )}

        {isSpeaking && (
          <div className="mt-2 flex items-center text-sm text-orange-600">
            <div className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></div>
            AI bot is speaking...
          </div>
        )}
      </div>
    </div>
  );
};