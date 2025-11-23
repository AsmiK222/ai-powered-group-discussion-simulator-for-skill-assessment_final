import React from 'react';
import { BotAvatar } from './BotAvatar';
import { BOTS } from '../../data/bots';
import { Activity } from 'lucide-react';

interface BotParticipantsProps {
  activeBotId?: string;
}

export const BotParticipants: React.FC<BotParticipantsProps> = ({ activeBotId }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        <Activity className="h-5 w-5 text-gray-600 mr-2" />
        <h3 className="text-lg font-medium text-gray-900">AI Participants</h3>
      </div>
      
      <div className="space-y-4">
        {BOTS.map((bot) => (
          <div
            key={bot.id}
            className={`p-4 rounded-lg border transition-all duration-200 ${
              activeBotId === bot.id 
                ? 'border-blue-300 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <BotAvatar 
              bot={bot} 
              isActive={activeBotId === bot.id}
              size="medium"
            />
            
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">{bot.description}</p>
              <div className="flex items-center text-xs text-gray-500">
                <span className="font-medium">Style:</span>
                <span className="ml-1">{bot.responseStyle}</span>
              </div>
            </div>

            {activeBotId === bot.id && (
              <div className="mt-2 flex items-center text-sm text-blue-600">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                Currently active
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Each AI participant has a unique personality and will contribute different perspectives to the discussion.
        </p>
      </div>
    </div>
  );
};