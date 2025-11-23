import React, { useMemo } from 'react';
import { RealtimeMetrics } from '../../types';

interface PerformanceChartProps {
  data: RealtimeMetrics[];
  metric: keyof Pick<RealtimeMetrics, 'confidence' | 'fluency' | 'originality' | 'teamwork' | 'reasoning'>;
  title: string;
  color?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data, 
  metric, 
  title, 
  color = '#3B82F6' 
}) => {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    const maxValue = Math.max(...data.map(d => d[metric]));
    const minValue = Math.min(...data.map(d => d[metric]));
    const range = maxValue - minValue || 1;
    
    return data.map((point, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: ((point[metric] - minValue) / range) * 80 + 10, // 10% padding
      value: point[metric],
      timestamp: point.timestamp
    }));
  }, [data, metric]);

  const pathData = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const commands = chartData.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${100 - point.y}`
    );
    
    return commands.join(' ');
  }, [chartData]);

  const areaPathData = useMemo(() => {
    if (chartData.length === 0) return '';
    
    const linePath = pathData;
    return `${linePath} L 100 100 L 0 100 Z`;
  }, [pathData]);

  const currentValue = chartData.length > 0 ? chartData[chartData.length - 1].value : 0;
  const previousValue = chartData.length > 1 ? chartData[chartData.length - 2].value : currentValue;
  const trend = currentValue - previousValue;

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-bold" style={{ color }}>
            {currentValue.toFixed(1)}
          </span>
          {trend !== 0 && (
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)}
            </span>
          )}
        </div>
      </div>
      
      <div className="relative h-32 mb-4">
        {chartData.length > 0 ? (
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
            
            {/* Area fill */}
            <path
              d={areaPathData}
              fill={`${color}20`}
              stroke="none"
            />
            
            {/* Line */}
            <path
              d={pathData}
              fill="none"
              stroke={color}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
            
            {/* Data points */}
            {chartData.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={100 - point.y}
                r="1.5"
                fill={color}
                vectorEffect="non-scaling-stroke"
              />
            ))}
          </svg>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No data available</p>
          </div>
        )}
      </div>
      
      {chartData.length > 0 && (
        <div className="flex justify-between text-sm text-gray-500">
          <span>Start</span>
          <span>Time</span>
          <span>Current</span>
        </div>
      )}
    </div>
  );
};