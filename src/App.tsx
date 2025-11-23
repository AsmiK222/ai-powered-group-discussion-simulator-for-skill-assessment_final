import React, { useState } from 'react';
import { Header } from './components/Layout/Header';
import { Layout } from './components/Layout/Layout';
import { HomePage } from './pages/HomePage';
import { DiscussionPage } from './pages/DiscussionPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { PerformanceReport } from './types';
import { useAccessibility } from './hooks/useAccessibility';

function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [latestReport, setLatestReport] = useState<PerformanceReport | null>(null);
  const [isInDiscussion, setIsInDiscussion] = useState(false);
  
  const accessibility = useAccessibility();

  const handleViewChange = (view: string) => {
    if (isInDiscussion && view !== 'discussion') {
      return; // Prevent navigation during active discussion
    }
    
    setCurrentView(view);
    accessibility.announceToScreenReader(`Navigated to ${view} page`);
  };

  const handleStartDiscussion = () => {
    setCurrentView('discussion');
    setIsInDiscussion(true);
    accessibility.announceToScreenReader('Starting new discussion session');
  };

  const handleDiscussionBack = () => {
    setCurrentView('home');
    setIsInDiscussion(false);
    accessibility.announceToScreenReader('Returned to home page');
  };

  const handleReportGenerated = (report: PerformanceReport) => {
    setLatestReport(report);
    setCurrentView('reports');
    setIsInDiscussion(false);
    accessibility.announceToScreenReader('Discussion completed. Performance report generated.');
  };

  const handleReportsBack = () => {
    setCurrentView('home');
    accessibility.announceToScreenReader('Returned to home page');
  };

  const handleSettingsBack = () => {
    setCurrentView('home');
    accessibility.announceToScreenReader('Returned to home page');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'discussion':
        return (
          <DiscussionPage 
            onBack={handleDiscussionBack}
            onReportGenerated={handleReportGenerated}
          />
        );
      case 'reports':
        return (
          <ReportsPage 
            report={latestReport}
            onBack={handleReportsBack}
          />
        );
      case 'settings':
        return (
          <SettingsPage 
            onBack={handleSettingsBack}
          />
        );
      case 'home':
      default:
        return (
          <HomePage 
            onStartDiscussion={handleStartDiscussion}
          />
        );
    }
  };

  return (
    <Layout className={`
      ${accessibility.highContrast ? 'high-contrast' : ''}
      ${accessibility.reducedMotion ? 'reduced-motion' : ''}
      font-${accessibility.fontSize}
    `}>
      {/* Skip Navigation for Accessibility */}
      <a 
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-blue-600 text-white p-2 z-50"
      >
        Skip to main content
      </a>

      <Header 
        currentView={currentView}
        onViewChange={handleViewChange}
        isInDiscussion={isInDiscussion}
      />
      
      <main id="main-content" role="main">
        {renderCurrentView()}
      </main>

      {/* Screen Reader Live Region */}
      <div 
        id="live-region"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      {/* High Contrast Styles */}
      <style jsx global>{`
        .high-contrast {
          --tw-bg-opacity: 1;
          background-color: rgb(0 0 0 / var(--tw-bg-opacity));
          color: white;
        }
        
        .high-contrast .bg-white {
          background-color: black !important;
          color: white !important;
          border-color: white !important;
        }
        
        .high-contrast .text-gray-900 {
          color: white !important;
        }
        
        .high-contrast .text-gray-600 {
          color: #ccc !important;
        }
        
        .reduced-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .font-small {
          font-size: 0.875rem;
        }
        
        .font-medium {
          font-size: 1rem;
        }
        
        .font-large {
          font-size: 1.125rem;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }
        
        .sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: 0.5rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
        }
        
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </Layout>
  );
}

export default App;