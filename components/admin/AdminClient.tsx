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
  bulkUpdateAttendanceStatus,
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
import BulkActionBar from './BulkActionBar';
import BulkAttendanceModal from './BulkAttendanceModal';
import AdminManagementPanel from './AdminManagementPanel';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import type { Category, AttendanceData, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LogOut, Settings, Maximize2, Search, RotateCcw, ListChecks, Menu, X } from 'lucide-react';

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
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [pendingBulkStatus, setPendingBulkStatus] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Bulk selection handlers
  const toggleBulkMode = () => {
    setBulkMode(!bulkMode);
    setSelectedUserIds(new Set());
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const selectAllInCategory = (categoryId: string) => {
    const category = displayData.find((cat) => cat.id === categoryId);
    if (!category) return;

    const newSelection = new Set(selectedUserIds);
    const categoryUserIds = category.users.map((user) => user.id);
    const allSelected = categoryUserIds.every((id) => newSelection.has(id));

    if (allSelected) {
      // Deselect all in category
      categoryUserIds.forEach((id) => newSelection.delete(id));
    } else {
      // Select all in category
      categoryUserIds.forEach((id) => newSelection.add(id));
    }

    setSelectedUserIds(newSelection);
  };

  const clearSelection = () => {
    setSelectedUserIds(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    setPendingBulkStatus(status);
  };

  const confirmBulkStatusChange = async () => {
    if (!pendingBulkStatus || selectedUserIds.size === 0) return;

    const userIdsArray = Array.from(selectedUserIds);
    const result = await bulkUpdateAttendanceStatus(
      userIdsArray,
      pendingBulkStatus,
      currentMonthKey
    );

    if (result.success) {
      alert(`Berhasil mengubah status ${result.count} pengguna.`);
      setSelectedUserIds(new Set());
      setPendingBulkStatus(null);
    } else {
      alert('Gagal mengubah status pengguna.');
    }
  };

  const cancelBulkStatusChange = () => {
    setPendingBulkStatus(null);
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

  // Get selected users for modal
  const selectedUsers = useMemo(() => {
    const users: User[] = [];
    displayData.forEach((category) => {
      category.users.forEach((user) => {
        if (selectedUserIds.has(user.id)) {
          users.push(user);
        }
      });
    });
    return users;
  }, [displayData, selectedUserIds]);

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
      {pendingBulkStatus && selectedUsers.length > 0 && (
        <BulkAttendanceModal
          selectedUsers={selectedUsers}
          newStatus={pendingBulkStatus}
          onConfirm={confirmBulkStatusChange}
          onCancel={cancelBulkStatusChange}
        />
      )}
      {bulkMode && viewMode === 'attendance' && (
        <BulkActionBar
          selectedCount={selectedUserIds.size}
          onClearSelection={clearSelection}
          onApplyStatus={handleBulkStatusChange}
        />
      )}
      <main className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2 sm:gap-3">
                {viewMode === 'admin' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    className="lg:hidden"
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </Button>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Panel Admin</h1>
                  {viewMode === 'attendance' && (
                    <span className="text-xs sm:text-sm text-gray-500 font-medium px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-100 rounded-full">
                      {formatMonthKey(currentMonthKey)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {viewMode === 'attendance' && (
                  <>
                    <Button
                      variant={bulkMode ? 'default' : 'outline'}
                      onClick={toggleBulkMode}
                      className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4"
                      size="sm"
                    >
                      <ListChecks className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{bulkMode ? 'Exit Bulk' : 'Bulk Select'}</span>
                      <span className="sm:hidden">{bulkMode ? 'Exit' : 'Bulk'}</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleResetAttendance}
                      className="gap-1 sm:gap-2 hidden sm:flex"
                      size="sm"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset Kehadiran
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="hidden sm:flex"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setViewMode(viewMode === 'attendance' ? 'admin' : 'attendance')
                  }
                  aria-label={
                    viewMode === 'attendance' ? 'Buka mode admin' : 'Tutup mode admin'
                  }
                >
                  {viewMode === 'attendance' ? (
                    <Settings className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {viewMode === 'attendance' ? (
          <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6" aria-label="Statistik Kehadiran">
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

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Cari nama untuk absen..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base"
                />
              </div>
            </div>

            {displayData.length === 0 && searchTerm && (
              <p className="text-center text-gray-500 py-8 text-lg">Nama tidak ditemukan.</p>
            )}

            {displayData.map((category) => {
              const categoryUserIds = category.users.map((u) => u.id);
              const allSelected = categoryUserIds.length > 0 && categoryUserIds.every((id) => selectedUserIds.has(id));
              const someSelected = categoryUserIds.some((id) => selectedUserIds.has(id)) && !allSelected;

              return (
                <section key={category.id} className="mb-6">
                  <div
                    className="rounded-t-lg px-6 py-3 font-bold text-white text-lg flex items-center justify-between"
                    style={{ backgroundColor: category.color }}
                  >
                    <span>{category.name}</span>
                    {bulkMode && category.users.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={allSelected}
                          onCheckedChange={() => selectAllInCategory(category.id)}
                          className="border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-gray-900"
                        />
                        <span className="text-sm font-normal">Select All</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-b-lg border border-gray-200 divide-y divide-gray-100">
                    {category.users.map((person) => (
                      <div
                        key={person.id}
                        className={`flex items-center justify-between px-6 py-4 transition-colors ${
                          selectedUserIds.has(person.id) ? 'bg-blue-50' : ''
                        } ${bulkMode ? '' : 'cursor-pointer hover:bg-gray-50'}`}
                        onClick={() => {
                          if (bulkMode) {
                            toggleUserSelection(person.id);
                          } else {
                            setEditingUser(person);
                          }
                        }}
                        tabIndex={0}
                      >
                        <div className="flex items-center gap-3">
                          {bulkMode && (
                            <Checkbox
                              checked={selectedUserIds.has(person.id)}
                              onCheckedChange={() => toggleUserSelection(person.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          )}
                          {!bulkMode && person.status !== ATTENDANCE_STATUS.ABSENT && (
                            <AttendanceCheckmark />
                          )}
                          <span className="font-medium text-gray-900">{person.name}</span>
                        </div>
                        <StatusBadge status={person.status || ATTENDANCE_STATUS.ABSENT} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className="flex h-[calc(100vh-4rem)] relative">
            {/* Mobile overlay */}
            {mobileMenuOpen && (
              <div
                className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}

            {/* Sidebar Navigation */}
            <nav className={`
              fixed lg:relative
              w-64 bg-white border-r border-gray-200
              overflow-y-auto flex-shrink-0
              h-[calc(100vh-4rem)] lg:h-auto
              z-40 lg:z-auto
              transition-transform duration-300 ease-in-out
              ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
              <div className="p-4 space-y-1">
                <Button
                  variant={adminView.view === 'report' ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left px-3"
                  onClick={() => {
                    setAdminView({ view: 'report' });
                    setCurrentPage(1);
                    setMobileMenuOpen(false);
                  }}
                >
                  Laporan Kehadiran
                </Button>
                <Button
                  variant={adminView.view === 'add_category' ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-left px-3"
                  onClick={() => {
                    setAdminView({ view: 'add_category' });
                    setCurrentPage(1);
                    setMobileMenuOpen(false);
                  }}
                >
                  Tambah Kategori
                </Button>
                <div className="pt-4 pb-2">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">
                    Kategori
                  </h3>
                </div>
                {masterConfig.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={
                      adminView.view === 'manage_category' &&
                      adminView.categoryId === cat.id
                        ? 'secondary'
                        : 'ghost'
                    }
                    className="w-full justify-start text-left px-3"
                    onClick={() => {
                      setAdminView({ view: 'manage_category', categoryId: cat.id });
                      setCurrentPage(1);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </Button>
                ))}
              </div>
            </nav>
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-w-0 w-full">
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
