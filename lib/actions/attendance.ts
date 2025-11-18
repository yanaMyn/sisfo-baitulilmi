'use server';

import { revalidatePath } from 'next/cache';
import { adminDb } from '@/lib/firebase/admin';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import type { Category } from '@/types';

/**
 * Update attendance status for a user
 */
export async function updateAttendanceStatus(
  userId: string,
  status: string,
  month: string
) {
  try {
    const attendanceRef = adminDb.collection('attendance').doc(month);

    await attendanceRef.update({
      [`${userId}.status`]: status,
    });

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error updating attendance:', error);
    return { success: false, error: 'Failed to update attendance' };
  }
}

/**
 * Reset all attendance for the current month
 */
export async function resetMonthlyAttendance(month: string) {
  try {
    const categoriesSnapshot = await adminDb
      .collection('categories')
      .orderBy('createdAt', 'asc')
      .get();

    const categories = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Category[];

    const attendanceRef = adminDb.collection('attendance').doc(month);
    const resetData: Record<string, any> = {};

    categories.forEach((cat) => {
      (cat.users || []).forEach((user) => {
        resetData[`${user.id}.status`] = ATTENDANCE_STATUS.ABSENT;
      });
    });

    await attendanceRef.update(resetData);

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true };
  } catch (error) {
    console.error('Error resetting attendance:', error);
    return { success: false, error: 'Failed to reset attendance' };
  }
}

/**
 * Bulk update attendance status for multiple users
 */
export async function bulkUpdateAttendanceStatus(
  userIds: string[],
  status: string,
  month: string
) {
  try {
    if (userIds.length === 0) {
      return { success: false, error: 'No users selected' };
    }

    const attendanceRef = adminDb.collection('attendance').doc(month);
    const bulkData: Record<string, any> = {};

    userIds.forEach((userId) => {
      bulkData[`${userId}.status`] = status;
    });

    await attendanceRef.update(bulkData);

    revalidatePath('/');
    revalidatePath('/admin');

    return { success: true, count: userIds.length };
  } catch (error) {
    console.error('Error bulk updating attendance:', error);
    return { success: false, error: 'Failed to bulk update attendance' };
  }
}

/**
 * Initialize attendance document for a month if it doesn't exist
 */
export async function initializeAttendance(month: string) {
  try {
    const attendanceRef = adminDb.collection('attendance').doc(month);
    const doc = await attendanceRef.get();

    if (!doc.exists) {
      const categoriesSnapshot = await adminDb
        .collection('categories')
        .orderBy('createdAt', 'asc')
        .get();

      const categories = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];

      const initialData: Record<string, any> = {};
      categories.forEach((cat) => {
        (cat.users || []).forEach((user) => {
          initialData[user.id] = { status: ATTENDANCE_STATUS.ABSENT };
        });
      });

      await attendanceRef.set(initialData);
      return { success: true, data: initialData };
    }

    return { success: true, data: doc.data() };
  } catch (error) {
    console.error('Error initializing attendance:', error);
    return { success: false, error: 'Failed to initialize attendance' };
  }
}
