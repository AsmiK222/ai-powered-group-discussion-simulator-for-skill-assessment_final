import React, { useState } from 'react';
import { Play, Clock, Tag, Users } from 'lucide-react';
import { Topic } from '../../types';
import { TOPICS, TOPIC_CATEGORIES } from '../../data/topics';

interface TopicSelectorProps {
  onTopicSelect: (topic: Topic) => void;
  onCancel: () => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({ onTopicSelect, onCancel }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');

  const filteredTopics = TOPICS.filter(topic => {
    const categoryMatch = selectedCategory === 'all' || topic.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-orange-600 bg-orange-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-fadeIn">
      <div className="mb-10 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Choose Your Topic</h2>
        <p className="text-lg text-gray-600">Select a discussion topic to begin your AI-powered practice session</p>
      </div>

      {/* Filters */}
      <div className="mb-8 flex flex-wrap gap-4 justify-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-56 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-4 py-2.5 font-medium"
          >
            <option value="all">🌐 All Categories</option>
            {TOPIC_CATEGORIES.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
          <select 
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="block w-48 rounded-lg border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all px-4 py-2.5 font-medium"
          >
            <option value="all">📊 All Levels</option>
            <option value="beginner">🟢 Beginner</option>
            <option value="intermediate">🟡 Intermediate</option>
            <option value="advanced">🔴 Advanced</option>
          </select>
        </div>
      </div>

      {/* Custom Topic */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Or create your own topic</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Enter a custom topic title"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Brief description (optional)</label>
            <input
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="A short line to describe the topic"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            disabled={!customTitle.trim()}
            onClick={() => onTopicSelect({
              id: 'custom_' + Date.now(),
              title: customTitle.trim(),
              description: customDescription.trim() || 'Custom discussion topic',
              category: selectedCategory === 'all' ? 'Custom' : selectedCategory,
              difficulty: (selectedDifficulty === 'all' ? 'beginner' : selectedDifficulty) as any,
              estimatedDuration: 20,
              objectives: ['Share perspectives', 'Build arguments', 'Reach conclusions']
            } as Topic)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md disabled:opacity-50"
          >
            Start with Custom Topic
          </button>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{topic.title}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                {topic.difficulty}
              </span>
            </div>
            
            <p className="text-gray-600 mb-4 leading-relaxed">{topic.description}</p>
            
            <div className="flex items-center text-sm text-gray-500 mb-4 space-x-4">
              <div className="flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                {topic.category}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {topic.estimatedDuration} min
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Objectives:</h4>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                {topic.objectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => onTopicSelect(topic)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Discussion
            </button>
          </div>
        ))}
      </div>

      {filteredTopics.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No topics found matching your criteria</p>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};