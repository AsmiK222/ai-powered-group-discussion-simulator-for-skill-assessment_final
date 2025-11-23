import { useState, useEffect, useCallback } from 'react';
import { AccessibilitySettings } from '../types';

interface AccessibilityHook extends AccessibilitySettings {
  updateSettings: (settings: Partial<AccessibilitySettings>) => void;
  announceToScreenReader: (message: string) => void;
}

export const useAccessibility = (): AccessibilityHook => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    screenReader: false,
    highContrast: false,
    reducedMotion: false,
    fontSize: 'medium',
    keyboardNavigation: true
  });

  // Detect user preferences on mount
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    setSettings(prev => ({
      ...prev,
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      screenReader: navigator.userAgent.includes('NVDA') || 
                   navigator.userAgent.includes('JAWS') || 
                   navigator.userAgent.includes('VoiceOver')
    }));
  }, []);

  // Apply CSS classes based on settings
  useEffect(() => {
    const bodyClasses = document.body.classList;
    
    // High contrast
    if (settings.highContrast) {
      bodyClasses.add('high-contrast');
    } else {
      bodyClasses.remove('high-contrast');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      bodyClasses.add('reduced-motion');
    } else {
      bodyClasses.remove('reduced-motion');
    }
    
    // Font size
    bodyClasses.remove('font-small', 'font-medium', 'font-large');
    bodyClasses.add(`font-${settings.fontSize}`);
  }, [settings]);

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const announceToScreenReader = useCallback((message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, []);

  return {
    ...settings,
    updateSettings,
    announceToScreenReader
  };
};