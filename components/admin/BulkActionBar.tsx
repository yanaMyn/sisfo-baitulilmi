'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import { CheckCircle2, BookOpen, Heart, X, Trash2 } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onApplyStatus: (status: string) => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  onClearSelection,
  onApplyStatus,
}) => {
  const statusOptions = [
    {
      status: ATTENDANCE_STATUS.OFFLINE,
      icon: CheckCircle2,
      label: 'Offline',
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      status: ATTENDANCE_STATUS.MANDIRI,
      icon: BookOpen,
      label: 'Mandiri',
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      status: ATTENDANCE_STATUS.DOA,
      icon: Heart,
      label: 'Doa',
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      status: ATTENDANCE_STATUS.ABSENT,
      icon: X,
      label: 'Absent',
      color: 'bg-red-600 hover:bg-red-700',
    },
  ];

  if (selectedCount === 0) return null;

  return (
    <div className="bulk-action-bar">
      <div className="bulk-action-content">
        <div className="bulk-action-info">
          <div className="bulk-count-badge">
            {selectedCount}
          </div>
          <span className="bulk-action-text">
            {selectedCount === 1 ? 'user selected' : 'users selected'}
          </span>
        </div>

        <div className="bulk-action-buttons">
          {statusOptions.map(({ status, icon: Icon, label, color }) => (
            <Button
              key={status}
              size="sm"
              className={`${color} text-white gap-2`}
              onClick={() => onApplyStatus(status)}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outline"
            className="gap-2 border-gray-300 hover:bg-gray-100"
            onClick={onClearSelection}
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionBar;
