import React from 'react';
import { Brain, MessageSquare, Users, Target, TrendingUp, Clock, Heart } from 'lucide-react';
import { RealtimeMetrics } from '../../types';

interface PerformanceMetricsProps {
  metrics: RealtimeMetrics | null;
  isLive?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({ metrics, isLive = false }) => {
  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="text-center py-8">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Start speaking to see your performance metrics</p>
        </div>
      </div>
    );
  }

  // Check if all core metrics are zero (non-participation case)
  const isNonParticipation = metrics.confidence === 0 && 
                              metrics.fluency === 0 && 
                              metrics.originality === 0 && 
                              metrics.teamwork === 0 && 
                              metrics.reasoning === 0 &&
                              metrics.participation === 0;

  if (isNonParticipation) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-red-100 rounded-full p-3">
                <Users className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h4 className="text-lg font-medium text-red-800 mb-2">No Participation Detected</h4>
            <p className="text-red-700 mb-4">
              You haven't contributed to the discussion yet. All performance metrics are at zero.
            </p>
            <div className="bg-red-100 rounded-lg p-4">
              <p className="text-red-800 font-medium mb-2">To improve your score:</p>
              <ul className="text-red-700 text-sm space-y-1">
                <li>• Start contributing to the discussion</li>
                <li>• Share your thoughts and opinions</li>
                <li>• Ask questions or build on others' ideas</li>
                <li>• Practice speaking up in group settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const metricItems = [
    {
      label: 'Confidence',
      value: metrics.confidence,
      icon: Target,
      color: 'blue',
      description: 'Voice clarity and assertiveness'
    },
    {
      label: 'Fluency',
      value: metrics.fluency,
      icon: MessageSquare,
      color: 'green',
      description: 'Speech flow and articulation'
    },
    {
      label: 'Originality',
      value: metrics.originality,
      icon: Brain,
      color: 'purple',
      description: 'Creative and unique thinking'
    },
    {
      label: 'Teamwork',
      value: metrics.teamwork,
      icon: Users,
      color: 'orange',
      description: 'Collaboration and support'
    },
    {
      label: 'Reasoning',
      value: metrics.reasoning,
      icon: TrendingUp,
      color: 'indigo',
      description: 'Logical argument structure'
    },
    {
      label: 'Emotional Engagement',
      value: metrics.emotionalEngagement || 0,
      icon: Heart,
      color: 'pink',
      description: 'Emotional involvement and expression'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
        {isLive && (
          <div className="flex items-center text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Analysis
          </div>
        )}
      </div>

      <div className="space-y-4">
        {metricItems.map(({ label, value, icon: Icon, color, description }) => (
          <div key={label} className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Icon className={`h-4 w-4 text-${color}-600`} />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getScoreColor(value)}`}>
                {value.toFixed(1)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ease-out bg-${color}-600`}
                style={{ width: `${Math.min(value, 100)}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
        ))}
      </div>

      {/* Additional Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              Words/min
            </div>
            <p className="font-semibold text-gray-900">{metrics.wordsPerMinute.toFixed(0)}</p>
          </div>
          
          <div>
            <div className="text-gray-600">Filler Words</div>
            <p className="font-semibold text-gray-900">{metrics.fillerWords}</p>
          </div>
        </div>
      </div>

      {/* Emotion Analysis */}
      {metrics.dominantEmotion && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Emotion</p>
            <div className="flex items-center justify-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                metrics.dominantEmotion === 'happy' ? 'bg-green-100 text-green-800' :
                metrics.dominantEmotion === 'sad' ? 'bg-blue-100 text-blue-800' :
                metrics.dominantEmotion === 'angry' ? 'bg-red-100 text-red-800' :
                metrics.dominantEmotion === 'surprised' ? 'bg-purple-100 text-purple-800' :
                metrics.dominantEmotion === 'nervous' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {metrics.dominantEmotion.charAt(0).toUpperCase() + metrics.dominantEmotion.slice(1)}
              </div>
              <span className="text-xs text-gray-500">
                ({Math.round((metrics.emotionConfidence || 0) * 100)}% confidence)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Overall Score */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-1">Overall Performance</p>
          <div className={`inline-flex items-center px-4 py-2 rounded-lg text-lg font-bold ${
            getScoreColor((metrics.confidence + metrics.fluency + metrics.originality + metrics.teamwork + metrics.reasoning) / 5)
          }`}>
            {((metrics.confidence + metrics.fluency + metrics.originality + metrics.teamwork + metrics.reasoning) / 5).toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
};