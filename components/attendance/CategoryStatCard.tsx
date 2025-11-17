'use client';

import React from 'react';
import { useAnimatedCount } from '@/lib/hooks/useAnimatedCount';

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
    <div className="stat-card">
      <div className="stat-chart">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle className="chart-background" cx="50" cy="50" r={radius} />
          <circle
            className="chart-progress"
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
          <text x="50%" y="50%" className="chart-text" fill={color}>
            {animatedPercentage}%
          </text>
        </svg>
      </div>
      <div className="stat-info">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-count">
          {attended} / {total} Hadir
        </p>
      </div>
    </div>
  );
};

export default CategoryStatCard;
