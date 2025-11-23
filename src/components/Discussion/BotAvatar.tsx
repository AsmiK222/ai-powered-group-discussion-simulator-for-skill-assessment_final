import React from 'react';
import { Bot } from '../../types';

interface BotAvatarProps {
  bot: Bot;
  isActive?: boolean;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
}

export const BotAvatar: React.FC<BotAvatarProps> = ({ 
  bot, 
  isActive = false, 
  size = 'medium',
  showName = true 
}) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-lg',
    medium: 'w-12 h-12 text-2xl',
    large: 'w-16 h-16 text-3xl'
  };

  const borderClasses = isActive 
    ? 'ring-2 ring-offset-2' 
    : 'border-2 border-gray-200';

  return (
    <div className="flex items-center space-x-3">
      <div 
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${borderClasses} transition-all duration-200`}
        style={{ 
          backgroundColor: `${bot.color}15`,
          borderColor: isActive ? bot.color : undefined,
          ringColor: isActive ? bot.color : undefined
        }}
      >
        {bot.avatar && bot.avatar.startsWith('/') ? (
          <img
            src={bot.avatar}
            alt={bot.name}
            className="w-full h-full rounded-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="select-none" role="img" aria-label={bot.name}>
            {bot.avatar}
          </span>
        )}
      </div>
      
      {showName && (
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{bot.name}</p>
          <p className="text-xs text-gray-500 truncate">{bot.role}</p>
        </div>
      )}
    </div>
  );
};