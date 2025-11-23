import React from 'react';
import { PerformanceReport } from '../../types';
import { Award, TrendingUp, Users, Brain, Target } from 'lucide-react';

interface ReportSummaryProps {
  report: PerformanceReport;
}

export const ReportSummary: React.FC<ReportSummaryProps> = ({ report }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <Award className="h-8 w-8 text-green-600" />;
    if (score >= 60) return <TrendingUp className="h-8 w-8 text-yellow-600" />;
    return <Target className="h-8 w-8 text-red-600" />;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const metricIcons = {
    confidence: Target,
    fluency: Brain,
    originality: Award,
    teamwork: Users,
    reasoning: TrendingUp
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Discussion Performance Report</h2>
            <p className="text-blue-100">Generated {report.generatedAt.toLocaleDateString()}</p>
          </div>
          <div className="text-center">
            {getScoreIcon(report.overallScore)}
            <div className="text-3xl font-bold mt-2">{report.overallScore}/100</div>
            <div className="text-sm text-blue-100">Overall Score</div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium text-gray-900 mb-1">Topic</h3>
          <p className="text-gray-600">{report.topic}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium text-gray-900 mb-1">Difficulty</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            report.difficulty === 'beginner' ? 'text-green-600 bg-green-100' :
            report.difficulty === 'intermediate' ? 'text-yellow-600 bg-yellow-100' :
            'text-red-600 bg-red-100'
          }`}>
            {report.difficulty.charAt(0).toUpperCase() + report.difficulty.slice(1)}
          </span>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <h3 className="font-medium text-gray-900 mb-1">Duration</h3>
          <p className="text-gray-600">{formatDuration(report.duration)}</p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {Object.entries(report.detailedAnalysis).map(([key, analysis]) => {
            const Icon = metricIcons[key as keyof typeof metricIcons];
            return (
              <div key={key} className="text-center">
                <div className="mb-2">
                  <Icon className="h-6 w-6 mx-auto text-gray-600" />
                </div>
                <div className={`text-2xl font-bold mb-1 ${getScoreColor(analysis.score).split(' ')[0]}`}>
                  {analysis.score.toFixed(1)}
                </div>
                <div className="text-sm font-medium text-gray-700 capitalize">
                  {key}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 text-green-600 mr-2" />
          Key Strengths
        </h3>
        <ul className="space-y-2">
          {report.strengths.map((strength, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700">{strength}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
          Areas for Improvement
        </h3>
        <ul className="space-y-2">
          {report.weaknesses.map((weakness, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-gray-700">{weakness}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvement Recommendations */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
          <Brain className="h-5 w-5 text-blue-600 mr-2" />
          Improvement Recommendations
        </h3>
        <ul className="space-y-2">
          {report.improvements.map((improvement, index) => (
            <li key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
              <span className="text-blue-800">{improvement}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};