import React, { useState } from 'react';
import { ArrowLeft, Volume2, Accessibility, Palette, Globe } from 'lucide-react';
import { AccessibilitySettings, VoiceSettings } from '../types';
import { useAccessibility } from '../hooks/useAccessibility';

interface SettingsPageProps {
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onBack }) => {
  const accessibility = useAccessibility();
  
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: true,
    speechRecognitionEnabled: true,
    textToSpeechEnabled: true,
    voiceSpeed: 1.0,
    language: 'en-US'
  });

  const handleAccessibilityChange = (setting: keyof AccessibilitySettings, value: any) => {
    accessibility.updateSettings({ [setting]: value });
  };

  const handleVoiceChange = (setting: keyof VoiceSettings, value: any) => {
    setVoiceSettings(prev => ({ ...prev, [setting]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Customize your GD Simulator experience</p>
        </div>

        <div className="space-y-8">
          {/* Voice Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <Volume2 className="h-6 w-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Voice Settings</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={voiceSettings.speechRecognitionEnabled}
                    onChange={(e) => handleVoiceChange('speechRecognitionEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Speech Recognition</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Enable voice input during discussions</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={voiceSettings.textToSpeechEnabled}
                    onChange={(e) => handleVoiceChange('textToSpeechEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Text-to-Speech</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Enable voice output from AI bots</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Speed</label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={voiceSettings.voiceSpeed}
                  onChange={(e) => handleVoiceChange('voiceSpeed', parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>{voiceSettings.voiceSpeed.toFixed(1)}x</span>
                  <span>Fast</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                <select
                  value={voiceSettings.language}
                  onChange={(e) => handleVoiceChange('language', e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                </select>
              </div>
            </div>
          </div>

          {/* Accessibility Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <Accessibility className="h-6 w-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Accessibility</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={accessibility.screenReader}
                    onChange={(e) => handleAccessibilityChange('screenReader', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Screen Reader Support</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Enhanced support for screen readers</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={accessibility.highContrast}
                    onChange={(e) => handleAccessibilityChange('highContrast', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">High Contrast</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Increase contrast for better visibility</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={accessibility.reducedMotion}
                    onChange={(e) => handleAccessibilityChange('reducedMotion', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Reduced Motion</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Minimize animations and transitions</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={accessibility.keyboardNavigation}
                    onChange={(e) => handleAccessibilityChange('keyboardNavigation', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Keyboard Navigation</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Enhanced keyboard navigation support</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                <div className="flex space-x-4">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <label key={size} className="flex items-center">
                      <input
                        type="radio"
                        name="fontSize"
                        value={size}
                        checked={accessibility.fontSize === size}
                        onChange={(e) => handleAccessibilityChange('fontSize', e.target.value)}
                        className="border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Display Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <Palette className="h-6 w-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Display</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>Auto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
                <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
                  <option>Default</option>
                  <option>Blue</option>
                  <option>Green</option>
                  <option>Purple</option>
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center mb-6">
              <Globe className="h-6 w-6 text-gray-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Advanced</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Enable Analytics</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Help improve the platform by sharing usage data</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Auto-save Progress</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Automatically save discussion progress</p>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Performance Notifications</span>
                </label>
                <p className="text-xs text-gray-500 mt-1">Receive notifications about your progress</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={() => {
                accessibility.announceToScreenReader('Settings saved successfully');
                // In a real app, save settings to backend
              }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};