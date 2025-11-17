'use client';

import React from 'react';
import { ATTENDANCE_STATUS } from '@/lib/constants';
import type { Category, User } from '@/types';

const USERS_PER_PAGE = 10;

interface AdminManagementPanelProps {
  masterConfig: Category[];
  adminView: { view: string; categoryId?: string };
  handleDeleteCategory: (categoryId: string) => void;
  handleAddUser: (categoryId: string) => void;
  handleDeleteUser: (categoryId: string, userId: string) => void;
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  newUserNames: Record<string, string>;
  setNewUserNames: (names: Record<string, string>) => void;
  handleAddCategory: () => void;
  displayData: Category[];
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const AdminManagementPanel: React.FC<AdminManagementPanelProps> = ({
  masterConfig,
  adminView,
  handleDeleteCategory,
  handleAddUser,
  handleDeleteUser,
  newCategoryName,
  setNewCategoryName,
  newUserNames,
  setNewUserNames,
  handleAddCategory,
  displayData,
  currentPage,
  setCurrentPage,
}) => {
  const { view, categoryId } = adminView;

  if (view === 'report') {
    return (
      <section className="admin-content-section">
        <h3>Laporan Kehadiran</h3>
        {displayData.map((category) => {
          const totalUsers = category.users.length;
          const statusCounts = {
            [ATTENDANCE_STATUS.OFFLINE]: category.users.filter(
              (u) => u.status === ATTENDANCE_STATUS.OFFLINE
            ).length,
            [ATTENDANCE_STATUS.MANDIRI]: category.users.filter(
              (u) => u.status === ATTENDANCE_STATUS.MANDIRI
            ).length,
            [ATTENDANCE_STATUS.DOA]: category.users.filter(
              (u) => u.status === ATTENDANCE_STATUS.DOA
            ).length,
            [ATTENDANCE_STATUS.ABSENT]: category.users.filter(
              (u) => u.status === ATTENDANCE_STATUS.ABSENT
            ).length,
          };

          const getPercentage = (count: number) =>
            totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;

          return (
            <div key={category.id} className="report-category-section">
              <h4
                style={{
                  color: category.color,
                  borderBottom: `2px solid ${category.color}`,
                  paddingBottom: '0.5rem',
                }}
              >
                {category.name} ({totalUsers} orang)
              </h4>
              <div className="report-grid">
                <div>
                  <h5>
                    {ATTENDANCE_STATUS.OFFLINE} ({statusCounts[ATTENDANCE_STATUS.OFFLINE]}) -{' '}
                    {getPercentage(statusCounts[ATTENDANCE_STATUS.OFFLINE])}%
                  </h5>
                  <ul>
                    {category.users
                      .filter((u) => u.status === ATTENDANCE_STATUS.OFFLINE)
                      .map((u) => (
                        <li key={u.id}>{u.name}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h5>
                    {ATTENDANCE_STATUS.MANDIRI} ({statusCounts[ATTENDANCE_STATUS.MANDIRI]}) -{' '}
                    {getPercentage(statusCounts[ATTENDANCE_STATUS.MANDIRI])}%
                  </h5>
                  <ul>
                    {category.users
                      .filter((u) => u.status === ATTENDANCE_STATUS.MANDIRI)
                      .map((u) => (
                        <li key={u.id}>{u.name}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h5>
                    {ATTENDANCE_STATUS.DOA} ({statusCounts[ATTENDANCE_STATUS.DOA]}) -{' '}
                    {getPercentage(statusCounts[ATTENDANCE_STATUS.DOA])}%
                  </h5>
                  <ul>
                    {category.users
                      .filter((u) => u.status === ATTENDANCE_STATUS.DOA)
                      .map((u) => (
                        <li key={u.id}>{u.name}</li>
                      ))}
                  </ul>
                </div>
                <div>
                  <h5>
                    {ATTENDANCE_STATUS.ABSENT} ({statusCounts[ATTENDANCE_STATUS.ABSENT]}) -{' '}
                    {getPercentage(statusCounts[ATTENDANCE_STATUS.ABSENT])}%
                  </h5>
                  <ul>
                    {category.users
                      .filter((u) => u.status === ATTENDANCE_STATUS.ABSENT)
                      .map((u) => (
                        <li key={u.id}>{u.name}</li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </section>
    );
  }

  if (view === 'add_category') {
    return (
      <section className="admin-content-section">
        <h3>Tambah Kategori Baru</h3>
        <form
          className="admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddCategory();
          }}
        >
          <input
            type="text"
            className="admin-input"
            placeholder="Nama Kategori"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="admin-btn btn-add">
            Tambah
          </button>
        </form>
      </section>
    );
  }

  if (view === 'manage_category' && categoryId) {
    const category = masterConfig.find((c) => c.id === categoryId);
    if (!category) return <p>Kategori tidak ditemukan.</p>;

    const totalUsers = category.users?.length || 0;
    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);
    const paginatedUsers = (category.users || []).slice(
      (currentPage - 1) * USERS_PER_PAGE,
      currentPage * USERS_PER_PAGE
    );

    return (
      <section className="admin-content-section">
        <div className="admin-content-header">
          <h3>Kelola: {category.name}</h3>
          <button
            onClick={() => handleDeleteCategory(category.id)}
            className="admin-btn btn-delete"
          >
            Hapus Kategori Ini
          </button>
        </div>
        <form
          className="admin-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleAddUser(category.id);
          }}
        >
          <input
            type="text"
            className="admin-input"
            placeholder="Nama Pengguna Baru"
            value={newUserNames[category.id] || ''}
            onChange={(e) =>
              setNewUserNames({ ...newUserNames, [category.id]: e.target.value })
            }
            autoFocus
          />
          <button type="submit" className="admin-btn btn-add">
            Tambah Pengguna
          </button>
        </form>
        <ul className="user-list">
          {paginatedUsers.map((user) => (
            <li key={user.id} className="admin-user-item">
              <span>{user.name}</span>
              <button
                onClick={() => handleDeleteUser(category.id, user.id)}
                className="admin-btn btn-delete"
              >
                Hapus
              </button>
            </li>
          ))}
        </ul>
        {totalUsers > USERS_PER_PAGE && (
          <div className="pagination-controls">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="admin-btn"
            >
              Sebelumnya
            </button>
            <span>
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="admin-btn"
            >
              Berikutnya
            </button>
          </div>
        )}
      </section>
    );
  }
  return null;
};

export default AdminManagementPanel;
