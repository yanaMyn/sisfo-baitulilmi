'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import { getCurrentMonthKey, formatMonthKey } from '@/lib/utils/date';
import {
  updateAttendanceStatus,
  resetMonthlyAttendance,
} from '@/lib/actions/attendance';
import {
  addCategory,
  deleteCategory,
  addUserToCategory,
  deleteUserFromCategory,
} from '@/lib/actions/categories';
import { destroySession } from '@/lib/actions/auth';
import CategoryStatCard from '@/components/attendance/CategoryStatCard';
import StatusBadge from '@/components/attendance/StatusBadge';
import AttendanceCheckmark from '@/components/attendance/AttendanceCheckmark';
import AttendanceModal from '@/components/attendance/AttendanceModal';
import AdminManagementPanel from './AdminManagementPanel';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Category, AttendanceData, User } from '@/types';

interface AdminClientProps {
  initialCategories: Category[];
  initialAttendance: AttendanceData;
}

const AdminClient: React.FC<AdminClientProps> = ({
  initialCategories,
  initialAttendance,
}) => {
  const router = useRouter();
  const [masterConfig, setMasterConfig] = useState<Category[]>(initialCategories);
  const [attendanceData, setAttendanceData] = useState<AttendanceData>(initialAttendance);
  const [viewMode, setViewMode] = useState<'attendance' | 'admin'>('attendance');
  const [adminView, setAdminView] = useState<{ view: string; categoryId?: string }>({
    view: 'report',
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newUserNames, setNewUserNames] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const currentMonthKey = getCurrentMonthKey();

  // Real-time listener for attendance data
  useEffect(() => {
    const attendanceDocRef = doc(db, 'attendance', currentMonthKey);
    const unsubscribe = onSnapshot(attendanceDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAttendanceData(docSnap.data() as AttendanceData);
      }
    });

    return () => unsubscribe();
  }, [currentMonthKey]);

  const handleUpdateStatus = async (userId: string, status: string) => {
    await updateAttendanceStatus(userId, status, currentMonthKey);
    setEditingUser(null);
  };

  const handleResetAttendance = async () => {
    if (
      window.confirm(
        `Yakin ingin mereset semua data kehadiran untuk bulan ${formatMonthKey(
          currentMonthKey
        )}? Semua status akan menjadi 'Belum Asad'.`
      )
    ) {
      const result = await resetMonthlyAttendance(currentMonthKey);
      if (result.success) {
        alert('Data kehadiran berhasil direset.');
      } else {
        alert('Gagal mereset data kehadiran.');
      }
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim() === '') return;
    const result = await addCategory(newCategoryName);
    if (result.success && result.categoryId) {
      setNewCategoryName('');
      setAdminView({ view: 'manage_category', categoryId: result.categoryId });
      setCurrentPage(1);
      router.refresh();
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (
      window.confirm(
        'Yakin ingin menghapus kategori ini? Semua pengguna di dalamnya akan terhapus.'
      )
    ) {
      const result = await deleteCategory(categoryId);
      if (result.success) {
        setAdminView({ view: 'report' });
        router.refresh();
      }
    }
  };

  const handleAddUser = async (categoryId: string) => {
    const userName = newUserNames[categoryId]?.trim();
    if (!userName) return;
    const result = await addUserToCategory(categoryId, userName);
    if (result.success) {
      setNewUserNames({ ...newUserNames, [categoryId]: '' });
      router.refresh();
    }
  };

  const handleDeleteUser = async (categoryId: string, userId: string) => {
    if (window.confirm('Yakin ingin menghapus pengguna ini?')) {
      const result = await deleteUserFromCategory(categoryId, userId);
      if (result.success) {
        router.refresh();
      }
    }
  };

  const handleLogout = async () => {
    await destroySession();
  };

  const displayData = useMemo(() => {
    if (!attendanceData) return [];

    const filteredAndSorted = masterConfig.map((cat) => ({
      ...cat,
      users: [...(cat.users || [])]
        .filter((user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((user) => ({
          ...user,
          status: attendanceData[user.id]?.status || ATTENDANCE_STATUS.ABSENT,
        })),
    }));

    if (viewMode === 'attendance') {
      return filteredAndSorted.filter((cat) => cat.users.length > 0);
    }
    return filteredAndSorted;
  }, [masterConfig, attendanceData, searchTerm, viewMode]);

  const attendanceStats = useMemo(() => {
    const originalData = masterConfig.map((cat) => ({
      ...cat,
      users: (cat.users || []).map((user) => ({
        ...user,
        status: attendanceData[user.id]?.status || ATTENDANCE_STATUS.ABSENT,
      })),
    }));

    return originalData.map((cat) => {
      const attended = cat.users.filter(
        (u) => u.status !== ATTENDANCE_STATUS.ABSENT
      ).length;
      const total = cat.users.length;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
      return {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        attended,
        total,
        percentage,
      };
    });
  }, [masterConfig, attendanceData]);

  return (
    <>
      {editingUser && (
        <AttendanceModal
          user={editingUser}
          onSave={handleUpdateStatus}
          onClose={() => setEditingUser(null)}
        />
      )}
      <main>
        <header className="header">
          <div className="header-left">
            <h1>Panel Admin</h1>
            {viewMode === 'attendance' && (
              <span className="header-subtitle">
                {formatMonthKey(currentMonthKey)}
              </span>
            )}
          </div>
          <div className="header-controls">
            {viewMode === 'attendance' && (
              <button
                className="admin-btn btn-reset"
                onClick={handleResetAttendance}
              >
                Reset Kehadiran
              </button>
            )}
            <button
              className="view-toggle-btn"
              onClick={handleLogout}
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
            </button>
            <button
              className="view-toggle-btn"
              onClick={() =>
                setViewMode(viewMode === 'attendance' ? 'admin' : 'attendance')
              }
              aria-label={
                viewMode === 'attendance' ? 'Buka mode admin' : 'Tutup mode admin'
              }
            >
              {viewMode === 'attendance' ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M19.44 12.99l-2.52.5c-.14-1.06-.5-2.06-.98-2.99l1.49-2.23c-.31-.47-.21-1.09-.26-1.4l-1.41-1.41c-.46-.46-1.13-.57-1.6-.26l-2.22 1.5c-.93-.48-1.94-.84-3-.98l.5-2.52C9.51 2.62 9.07 2 8.5 2h-2c-.57 0-1.01.62-.94 1.19l.5 2.52c-1.06.14-2.06.5-2.99.98L.84 5.2c-.47-.31-1.09-.21-1.4.26L1.15 3.15c-.46.46-.57 1.13-.26 1.6l1.5 2.22c-.48.93-.84 1.94-.98 3l-2.52-.5C-1.19 9.51-1.63 10-2.2 10v2c0 .57.62 1.01 1.19.94l2.52-.5c.14 1.06.5 2.06.98 2.99l-1.49 2.23c-.31.47-.21 1.09.26 1.4l1.41 1.41c.46.46 1.13.57 1.6.26l2.22-1.5c.93.48 1.94.84 3 .98l-.5 2.52c-.07.57.37 1.19.94 1.19h2c.57 0 1.01-.62.94-1.19l-.5-2.52c1.06-.14 2.06-.5 2.99-.98l2.23 1.49c.47.31 1.09.21 1.4-.26l1.41-1.41c.46.46.57 1.13.26-1.6l-1.5-2.22c.48-.93.84-1.94.98-3l2.52.5c.57-.07 1.19-.51 1.19-1.08v-2c-.01-.57-.63-1.01-1.2-0.93zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 2h-2v3h-3v2h5v-5zm-3-2V5h-2v3h-3v2h5z" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {viewMode === 'attendance' ? (
          <>
            <section className="stats-container" aria-label="Statistik Kehadiran">
              {attendanceStats.map((stat) => (
                <CategoryStatCard
                  key={stat.categoryId}
                  title={stat.name}
                  attended={stat.attended}
                  total={stat.total}
                  percentage={stat.percentage}
                  color={stat.color}
                />
              ))}
            </section>

            <div className="search-container">
              <input
                type="search"
                className="search-input"
                placeholder="Cari nama untuk absen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {displayData.length === 0 && searchTerm && (
              <p className="no-results">Nama tidak ditemukan.</p>
            )}

            {displayData.map((category) => (
              <section key={category.id} className="attendance-section">
                <h2
                  className="section-title"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </h2>
                <ul className="user-list">
                  {category.users.map((person) => (
                    <li
                      key={person.id}
                      className="user-item interactive"
                      onClick={() => setEditingUser(person)}
                      tabIndex={0}
                    >
                      <div className="user-info">
                        {person.status !== ATTENDANCE_STATUS.ABSENT && (
                          <AttendanceCheckmark />
                        )}
                        <span className="user-item-label">{person.name}</span>
                      </div>
                      <StatusBadge status={person.status || ATTENDANCE_STATUS.ABSENT} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        ) : (
          <div className="admin-panel">
            <nav className="admin-sidebar">
              <button
                className={`admin-sidebar-btn ${
                  adminView.view === 'report' ? 'active' : ''
                }`}
                onClick={() => {
                  setAdminView({ view: 'report' });
                  setCurrentPage(1);
                }}
              >
                Laporan Kehadiran
              </button>
              <button
                className={`admin-sidebar-btn ${
                  adminView.view === 'add_category' ? 'active' : ''
                }`}
                onClick={() => {
                  setAdminView({ view: 'add_category' });
                  setCurrentPage(1);
                }}
              >
                Tambah Kategori
              </button>
              {masterConfig.map((cat) => (
                <button
                  key={cat.id}
                  className={`admin-sidebar-btn ${
                    adminView.view === 'manage_category' &&
                    adminView.categoryId === cat.id
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => {
                    setAdminView({ view: 'manage_category', categoryId: cat.id });
                    setCurrentPage(1);
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </nav>
            <main className="admin-content">
              <AdminManagementPanel
                masterConfig={masterConfig}
                adminView={adminView}
                handleDeleteCategory={handleDeleteCategory}
                handleAddUser={handleAddUser}
                handleDeleteUser={handleDeleteUser}
                newCategoryName={newCategoryName}
                setNewCategoryName={setNewCategoryName}
                newUserNames={newUserNames}
                setNewUserNames={setNewUserNames}
                handleAddCategory={handleAddCategory}
                displayData={displayData}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
              />
            </main>
          </div>
        )}
      </main>
    </>
  );
};

export default AdminClient;
