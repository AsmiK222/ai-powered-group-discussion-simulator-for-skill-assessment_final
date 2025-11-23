import React from 'react';
import { Users, MessageCircle, BarChart3, Settings } from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isInDiscussion?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, isInDiscussion }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Users },
    { id: 'discussion', label: 'Discussion', icon: MessageCircle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-gray-900">GD Simulator</h1>
            </div>
          </div>
          
          <nav className="flex space-x-8">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => !isInDiscussion && onViewChange(id)}
                disabled={isInDiscussion && id !== 'discussion'}
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                  currentView === id
                    ? 'border-blue-500 text-gray-900'
                    : isInDiscussion && id !== 'discussion'
                    ? 'border-transparent text-gray-400 cursor-not-allowed'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
                aria-label={label}
              >
                <Icon className="h-4 w-4 mr-1" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center">
            {isInDiscussion && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Discussion Active
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};