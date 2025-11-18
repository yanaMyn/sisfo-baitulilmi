'use client';

import React from 'react';
import { useAnimatedCount } from '@/lib/hooks/useAnimatedCount';
import { Card, CardContent } from '@/components/ui/card';

interface CompactStatCardProps {
  title: string;
  attended: number;
  total: number;
  percentage: number;
  color: string;
  onClick?: () => void;
}

const CompactStatCard: React.FC<CompactStatCardProps> = ({
  title,
  attended,
  total,
  percentage,
  color,
  onClick,
}) => {
  const animatedPercentage = useAnimatedCount(percentage, 1500);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200 min-w-[140px]"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center gap-2">
          {/* Compact Donut Chart */}
          <div className="relative">
            <svg width="70" height="70" viewBox="0 0 70 70" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="35"
                cy="35"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              {/* Progress circle */}
              <circle
                cx="35"
                cy="35"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Percentage text */}
              <text
                x="50%"
                y="50%"
                className="text-sm font-bold"
                fill={color}
                textAnchor="middle"
                dominantBaseline="middle"
                transform="rotate(90 35 35)"
              >
                {animatedPercentage}%
              </text>
            </svg>
            {/* Tap indicator */}
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              <svg
                className="w-3 h-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>

          {/* Info */}
          <div className="w-full">
            <h3 className="text-xs font-bold text-gray-900 mb-0.5 truncate" title={title}>
              {title}
            </h3>
            <p className="text-[10px] text-gray-600">
              {attended}/{total}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactStatCard;
