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
import { CheckCircle2, BookOpen, Heart } from 'lucide-react';

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
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Pilih Status Kehadiran</DialogTitle>
          <DialogDescription className="text-base">
            Pilih status untuk <span className="font-semibold text-gray-900">{user.name}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-4">
          {statusOptions.map(({ status, icon: Icon, color }) => (
            <Button
              key={status}
              variant="outline"
              className={`h-16 flex items-center justify-center gap-3 border-2 ${color} transition-all hover:scale-105`}
              onClick={() => {
                onSave(user.id, status);
                onClose();
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-semibold text-lg">{status}</span>
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

export default PublicAttendanceModal;
