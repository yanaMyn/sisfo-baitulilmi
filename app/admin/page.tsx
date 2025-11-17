import { adminDb } from '@/lib/firebase/admin';
import { getCurrentMonthKey } from '@/lib/utils/date';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import AdminClient from '@/components/admin/AdminClient';
import type { Category, AttendanceData } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getAdminData() {
  try {
    // Fetch categories
    const categoriesSnapshot = await adminDb
      .collection('categories')
      .orderBy('createdAt', 'asc')
      .get();

    // Serialize Firestore data to plain objects (convert Timestamp to Date)
    const categories: Category[] = categoriesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        color: data.color,
        users: data.users || [],
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    // Fetch attendance for current month
    const currentMonthKey = getCurrentMonthKey();
    const attendanceRef = adminDb.collection('attendance').doc(currentMonthKey);
    const attendanceDoc = await attendanceRef.get();

    let attendanceData: AttendanceData;

    if (attendanceDoc.exists) {
      attendanceData = attendanceDoc.data() as AttendanceData;
    } else {
      // Initialize attendance if it doesn't exist
      attendanceData = {};
      categories.forEach((cat) => {
        (cat.users || []).forEach((user) => {
          attendanceData[user.id] = { status: ATTENDANCE_STATUS.ABSENT };
        });
      });
      await attendanceRef.set(attendanceData);
    }

    return { categories, attendanceData };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return { categories: [], attendanceData: {} };
  }
}

export default async function AdminPage() {
  const { categories, attendanceData } = await getAdminData();

  return (
    <div className="app-container">
      <AdminClient initialCategories={categories} initialAttendance={attendanceData} />
    </div>
  );
}
