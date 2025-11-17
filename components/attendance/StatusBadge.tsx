'use client';

import React from 'react';
import { ATTENDANCE_STATUS } from '@/lib/constants';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClass =
    {
      [ATTENDANCE_STATUS.OFFLINE]: 'status-offline',
      [ATTENDANCE_STATUS.MANDIRI]: 'status-mandiri',
      [ATTENDANCE_STATUS.DOA]: 'status-doa',
      [ATTENDANCE_STATUS.ABSENT]: 'status-absent',
    }[status] || 'status-absent';

  return <span className={`status-badge ${statusClass}`}>{status}</span>;
};

export default StatusBadge;
