'use client';

import React from 'react';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import type { User } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, BookOpen, Heart, X } from 'lucide-react';

interface AttendanceModalProps {
  user: User;
  onSave: (userId: string, status: string) => void;
  onClose: () => void;
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ user, onSave, onClose }) => {
  const statusOptions = [
    {
      status: ATTENDANCE_STATUS.OFFLINE,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    },
    {
      status: ATTENDANCE_STATUS.MANDIRI,
      icon: BookOpen,
      color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200',
    },
    {
      status: ATTENDANCE_STATUS.DOA,
      icon: Heart,
      color: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200',
    },
    {
      status: ATTENDANCE_STATUS.ABSENT,
      icon: X,
      color: 'bg-red-50 text-red-700 hover:bg-red-100 border-red-200',
    },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Ubah Status Kehadiran</DialogTitle>
          <DialogDescription className="text-base">
            Pilih status untuk <span className="font-semibold text-gray-900">{user.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          {statusOptions.map(({ status, icon: Icon, color }) => (
            <Button
              key={status}
              variant="outline"
              className={`h-20 flex flex-col items-center justify-center gap-2 border-2 ${color} transition-all hover:scale-105`}
              onClick={() => {
                onSave(user.id, status);
                onClose();
              }}
            >
              <Icon className="w-6 h-6" />
              <span className="font-semibold">{status}</span>
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          className="w-full"
          onClick={onClose}
        >
          Batal
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceModal;
