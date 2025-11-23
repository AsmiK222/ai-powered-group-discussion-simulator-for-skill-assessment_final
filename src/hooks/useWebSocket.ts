import { useState, useEffect, useRef, useCallback } from 'react';
import { Message, RealtimeMetrics } from '../types';

interface WebSocketHook {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  messages: Message[];
  metrics: RealtimeMetrics | null;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (url?: string): WebSocketHook => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [metrics, setMetrics] = useState<RealtimeMetrics | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);

  // Simulate WebSocket connection since we don't have a real backend. Metrics are driven externally.
  const connect = useCallback(() => {
    if (isConnected) return;
    
    // Simulate connection
    setIsConnected(true);
    console.log('WebSocket connected (simulated)');
    
    return () => {};
  }, [isConnected]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setMessages([]);
    setMetrics(null);
    console.log('WebSocket disconnected (simulated)');
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (!isConnected) {
      console.warn('WebSocket not connected');
      return;
    }

    console.log('Sending message (simulated):', message);
    
    // Simulate message acknowledgment
    setTimeout(() => {
      if (message.type === 'user_message') {
        const newMessage: Message = {
          id: Date.now().toString(),
          sender: message.sender || 'User',
          content: message.content,
          timestamp: new Date(),
          type: 'user',
          isVoice: message.isVoice || false
        };
        setMessages(prev => [...prev, newMessage]);
      }
    }, 100);
  }, [isConnected]);

  const addBotMessage = useCallback((botId: string, content: string) => {
    const botMessage: Message = {
      id: Date.now().toString() + '_bot',
      sender: botId,
      content,
      timestamp: new Date(),
      type: 'bot',
      botId
    };
    setMessages(prev => [...prev, botMessage]);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    isConnected,
    sendMessage,
    messages,
    metrics,
    connect,
    disconnect,
    addBotMessage,
    // expose for deterministic updates by outside services
    setMetrics
  } as WebSocketHook & { addBotMessage: (botId: string, content: string) => void } & { setMetrics: (m: RealtimeMetrics) => void };
};