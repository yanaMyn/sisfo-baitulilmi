'use client';

import React from 'react';
import { useAnimatedCount } from '@/lib/hooks/useAnimatedCount';
import { Card, CardContent } from '@/components/ui/card';

interface CategoryStatCardProps {
  title: string;
  attended: number;
  total: number;
  percentage: number;
  color: string;
}

const CategoryStatCard: React.FC<CategoryStatCardProps> = ({
  title,
  attended,
  total,
  percentage,
  color,
}) => {
  const animatedPercentage = useAnimatedCount(percentage, 1500);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4">
            <svg width="100" height="100" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <text
                x="50%"
                y="50%"
                className="text-xl font-bold"
                fill={color}
                textAnchor="middle"
                dominantBaseline="middle"
                transform="rotate(90 50 50)"
              >
                {animatedPercentage}%
              </text>
            </svg>
          </div>
          <div className="w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">
              {attended} / {total} Hadir
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryStatCard;
