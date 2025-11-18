'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAnimatedCount } from '@/lib/hooks/useAnimatedCount';

interface StatDetailModalProps {
  title: string;
  attended: number;
  total: number;
  percentage: number;
  color: string;
  onClose: () => void;
}

const StatDetailModal: React.FC<StatDetailModalProps> = ({
  title,
  attended,
  total,
  percentage,
  color,
  onClose,
}) => {
  const animatedPercentage = useAnimatedCount(percentage, 1500);
  const animatedAttended = useAnimatedCount(attended, 1500);
  const animatedTotal = useAnimatedCount(total, 1500);
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Detail Statistik
          </DialogTitle>
          <DialogDescription className="text-center">
            Kehadiran {title}
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 flex flex-col items-center">
          {/* Large Donut Chart */}
          <div className="mb-6">
            <svg width="150" height="150" viewBox="0 0 150 150" className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="12"
              />
              {/* Progress circle */}
              <circle
                cx="75"
                cy="75"
                r={radius}
                fill="none"
                stroke={color}
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              {/* Percentage text */}
              <text
                x="50%"
                y="50%"
                className="text-3xl font-bold"
                fill={color}
                textAnchor="middle"
                dominantBaseline="middle"
                transform="rotate(90 75 75)"
              >
                {animatedPercentage}%
              </text>
            </svg>
          </div>

          {/* Stats Details */}
          <div className="w-full space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Total Anggota</span>
                <span className="text-2xl font-bold text-gray-900">{animatedTotal}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-green-700">Hadir</span>
                <span className="text-2xl font-bold text-green-700">{animatedAttended}</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-red-700">Tidak Hadir</span>
                <span className="text-2xl font-bold text-red-700">
                  {animatedTotal - animatedAttended}
                </span>
              </div>
              <div className="w-full bg-red-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${100 - percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Close hint */}
          <p className="text-xs text-gray-400 mt-6 text-center">
            Ketuk di luar untuk menutup
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StatDetailModal;
