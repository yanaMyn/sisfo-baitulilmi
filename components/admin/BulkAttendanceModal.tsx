'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import { CheckCircle2, BookOpen, Heart, X } from 'lucide-react';
import type { User } from '@/types';

interface BulkAttendanceModalProps {
  selectedUsers: User[];
  newStatus: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const BulkAttendanceModal: React.FC<BulkAttendanceModalProps> = ({
  selectedUsers,
  newStatus,
  onConfirm,
  onCancel,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case ATTENDANCE_STATUS.OFFLINE:
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case ATTENDANCE_STATUS.MANDIRI:
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case ATTENDANCE_STATUS.DOA:
        return <Heart className="w-5 h-5 text-orange-600" />;
      case ATTENDANCE_STATUS.ABSENT:
        return <X className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ATTENDANCE_STATUS.OFFLINE:
        return 'bg-green-50 border-green-200';
      case ATTENDANCE_STATUS.MANDIRI:
        return 'bg-blue-50 border-blue-200';
      case ATTENDANCE_STATUS.DOA:
        return 'bg-orange-50 border-orange-200';
      case ATTENDANCE_STATUS.ABSENT:
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            {getStatusIcon(newStatus)}
            Konfirmasi Perubahan Status Massal
          </DialogTitle>
          <DialogDescription>
            Anda akan mengubah status {selectedUsers.length} pengguna menjadi{' '}
            <span className="font-semibold text-gray-900">{newStatus}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable user list */}
        <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-2 max-h-[400px]">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className={`flex items-center justify-between p-3 rounded-md border ${getStatusColor(
                newStatus
              )}`}
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(newStatus)}
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <span className="text-sm text-gray-600">{newStatus}</span>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Konfirmasi Perubahan ({selectedUsers.length} pengguna)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkAttendanceModal;
