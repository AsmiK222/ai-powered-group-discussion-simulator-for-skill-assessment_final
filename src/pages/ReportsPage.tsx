import React, { useState } from 'react';
import { ArrowLeft, Download, FileText, BarChart3, Calendar } from 'lucide-react';
import { PerformanceReport } from '../types';
import { ReportSummary } from '../components/Reports/ReportSummary';
import { PerformanceChart } from '../components/Reports/PerformanceChart';
import { reportService } from '../services/ReportService';

interface ReportsPageProps {
  report: PerformanceReport | null;
  onBack: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ report, onBack }) => {
  const [activeChart, setActiveChart] = useState<'confidence' | 'fluency' | 'originality' | 'teamwork' | 'reasoning'>('confidence');

  const handleExportPDF = async () => {
    if (!report) return;
    
    try {
      const blob = await reportService.exportToPDF(report);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gd-report-${report.sessionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportHTML = () => {
    if (!report) return;
    
    const htmlContent = reportService.exportToHTML(report);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gd-report-${report.sessionId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </button>
          </div>
          
          <div className="text-center py-16">
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Reports Available</h2>
            <p className="text-gray-600 mb-8">Complete a discussion session to generate your first performance report</p>
            <button
              onClick={onBack}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Start a Discussion
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartMetrics = [
    { key: 'confidence', label: 'Confidence', color: '#3B82F6' },
    { key: 'fluency', label: 'Fluency', color: '#10B981' },
    { key: 'originality', label: 'Originality', color: '#8B5CF6' },
    { key: 'teamwork', label: 'Teamwork', color: '#F59E0B' },
    { key: 'reasoning', label: 'Reasoning', color: '#6366F1' }
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportHTML}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export HTML
            </button>
            
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Report */}
          <div className="lg:col-span-2">
            <ReportSummary report={report} />
          </div>

          {/* Performance Charts */}
          <div className="space-y-6">
            {/* Chart Navigation */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Over Time</h3>
              <div className="space-y-2">
                {chartMetrics.map(({ key, label, color }) => (
                  <button
                    key={key}
                    onClick={() => setActiveChart(key)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-200 ${
                      activeChart === key
                        ? 'bg-blue-100 text-blue-700 border-blue-200'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: color }}
                      ></div>
                      {label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Active Chart */}
            <PerformanceChart
              data={report.progressOverTime}
              metric={activeChart}
              title={chartMetrics.find(m => m.key === activeChart)?.label || 'Performance'}
              color={chartMetrics.find(m => m.key === activeChart)?.color}
            />

            {/* Quick Stats */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Session Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="text-sm font-medium text-gray-900">
                    {report.progressOverTime.length > 0 
                      ? report.progressOverTime[report.progressOverTime.length - 1].messageCount 
                      : 0}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Words Per Minute</span>
                  <span className="text-sm font-medium text-gray-900">
                    {report.finalMetrics.wordsPerMinute.toFixed(0)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Filler Words</span>
                  <span className="text-sm font-medium text-gray-900">
                    {report.finalMetrics.fillerWords}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sentiment Score</span>
                  <span className="text-sm font-medium text-gray-900">
                    {report.finalMetrics.sentiment.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};