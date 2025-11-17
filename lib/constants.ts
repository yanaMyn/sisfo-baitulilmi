export const COLORS_PALETTE = [
  '#1abc9c',
  '#3498db',
  '#9b59b6',
  '#f1c40f',
  '#e67e22',
  '#e74c3c',
  '#34495e',
];

export const ATTENDANCE_STATUS = {
  OFFLINE: 'Asad Offline',
  MANDIRI: 'Asad Mandiri',
  DOA: 'Doa',
  ABSENT: 'Belum Asad',
} as const;

export type AttendanceStatusValue =
  (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];
