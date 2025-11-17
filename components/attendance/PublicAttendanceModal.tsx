'use client';

import React from 'react';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import type { User } from '@/types';

interface PublicAttendanceModalProps {
  user: User;
  onSave: (userId: string, status: string) => void;
  onClose: () => void;
}

const PublicAttendanceModal: React.FC<PublicAttendanceModalProps> = ({
  user,
  onSave,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Pilih Status Kehadiran</h3>
        <p>
          Pilih status untuk <strong>{user.name}</strong>:
        </p>
        <div className="modal-actions">
          <button
            className="modal-btn status-offline"
            onClick={() => onSave(user.id, ATTENDANCE_STATUS.OFFLINE)}
          >
            {ATTENDANCE_STATUS.OFFLINE}
          </button>
          <button
            className="modal-btn status-mandiri"
            onClick={() => onSave(user.id, ATTENDANCE_STATUS.MANDIRI)}
          >
            {ATTENDANCE_STATUS.MANDIRI}
          </button>
          <button
            className="modal-btn status-doa"
            onClick={() => onSave(user.id, ATTENDANCE_STATUS.DOA)}
          >
            {ATTENDANCE_STATUS.DOA}
          </button>
        </div>
        <button className="modal-close-btn" onClick={onClose}>
          Batal
        </button>
      </div>
    </div>
  );
};

export default PublicAttendanceModal;
