import React from 'react';
import { Message } from '../../types';
import { BotAvatar } from './BotAvatar';
import { BOTS } from '../../data/bots';
import { Mic, Volume2 } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onPlayVoice?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onPlayVoice }) => {
  const bot = message.type === 'bot' && message.botId 
    ? BOTS.find(b => b.id === message.botId)
    : null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
        message.type === 'user'
          ? 'bg-blue-600 text-white'
          : 'bg-white border shadow-sm'
      }`}>
        {message.type === 'bot' && bot && (
          <div className="flex items-center mb-2">
            <BotAvatar bot={bot} size="small" showName={false} />
            <div className="ml-2">
              <p className="text-sm font-medium text-gray-900">{bot.name}</p>
              <p className="text-xs text-gray-500">{bot.role}</p>
            </div>
          </div>
        )}
        
        <div className="flex items-start justify-between">
          <p className={`text-sm leading-relaxed ${
            message.type === 'user' ? 'text-white' : 'text-gray-900'
          }`}>
            {message.content}
          </p>
          
          <div className="flex items-center ml-3 space-x-1">
            {message.isVoice && (
              <Mic className={`h-3 w-3 ${
                message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
              }`} />
            )}
            
            {message.type === 'bot' && onPlayVoice && (
              <button
                onClick={() => onPlayVoice(message.content)}
                className="p-1 rounded hover:bg-gray-100 transition-colors duration-200"
                title="Play audio"
              >
                <Volume2 className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>
        </div>
        
        <p className={`text-xs mt-2 ${
          message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
        }`}>
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};