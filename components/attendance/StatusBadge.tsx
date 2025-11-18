'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  // Map status to colors using Tailwind classes
  const statusStyles = {
    [ATTENDANCE_STATUS.OFFLINE]: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    [ATTENDANCE_STATUS.MANDIRI]: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    [ATTENDANCE_STATUS.DOA]: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    [ATTENDANCE_STATUS.ABSENT]: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
  }[status] || 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200';

  return (
    <Badge
      variant="outline"
      className={cn('font-semibold', statusStyles)}
    >
      {status}
    </Badge>
  );
};

export default StatusBadge;
