// User type
export interface User {
  id: string;
  name: string;
  status?: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  color: string;
  users: User[];
  createdAt: Date | { seconds: number; nanoseconds: number };
}

// Attendance status type
export interface AttendanceStatus {
  status: string;
}

// Attendance data (keyed by userId)
export interface AttendanceData {
  [userId: string]: AttendanceStatus;
}

// Attendance stats for display
export interface AttendanceStats {
  categoryId: string;
  name: string;
  color: string;
  attended: number;
  total: number;
  percentage: number;
}

// Firebase document with ID
export interface FirebaseDocument<T> {
  id: string;
  data: T;
}

// View mode for admin panel
export type ViewMode = 'attendance' | 'management';

// Admin view state
export interface AdminViewState {
  view: 'report' | 'manage_category';
  categoryId?: string;
}
