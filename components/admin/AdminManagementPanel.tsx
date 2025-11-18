'use client'

import React from 'react'
import { ATTENDANCE_STATUS } from '@/lib/constants'
import type { Category, User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Trash2, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react'

const USERS_PER_PAGE = 10

interface AdminManagementPanelProps {
  masterConfig: Category[]
  adminView: { view: string; categoryId?: string }
  handleDeleteCategory: (categoryId: string) => void
  handleAddUser: (categoryId: string) => void
  handleDeleteUser: (categoryId: string, userId: string) => void
  newCategoryName: string
  setNewCategoryName: (name: string) => void
  newUserNames: Record<string, string>
  setNewUserNames: (names: Record<string, string>) => void
  handleAddCategory: () => void
  displayData: Category[]
  currentPage: number
  setCurrentPage: (page: number) => void
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
  const { view, categoryId } = adminView

  if (view === 'report') {
    return (
      <div className='space-y-6'>
        <h3 className='text-2xl font-bold text-gray-900'>Laporan Kehadiran</h3>
        {displayData.map((category) => {
          const totalUsers = category.users.length
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
          }

          const getPercentage = (count: number) =>
            totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0

          return (
            <Card key={category.id} className='overflow-hidden'>
              <CardHeader
                className='pb-3'
                style={{ borderBottom: `3px solid ${category.color}` }}
              >
                <CardTitle style={{ color: category.color }}>
                  {category.name}
                </CardTitle>
                <CardDescription className='text-base'>
                  Total: {totalUsers} orang
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6'>
                  <div className='bg-green-50 p-5 rounded-lg border border-green-200 min-w-0'>
                    <h5 className='font-semibold text-green-800 mb-3 text-base'>
                      {ATTENDANCE_STATUS.OFFLINE} (
                      {statusCounts[ATTENDANCE_STATUS.OFFLINE]}) -{' '}
                      {getPercentage(statusCounts[ATTENDANCE_STATUS.OFFLINE])}%
                    </h5>
                    <ul className='space-y-2 text-sm text-green-700'>
                      {category.users
                        .filter((u) => u.status === ATTENDANCE_STATUS.OFFLINE)
                        .map((u) => (
                          <li
                            key={u.id}
                            className='break-words leading-relaxed'
                          >
                            {u.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className='bg-blue-50 p-5 rounded-lg border border-blue-200 min-w-0'>
                    <h5 className='font-semibold text-blue-800 mb-3 text-base'>
                      {ATTENDANCE_STATUS.MANDIRI} (
                      {statusCounts[ATTENDANCE_STATUS.MANDIRI]}) -{' '}
                      {getPercentage(statusCounts[ATTENDANCE_STATUS.MANDIRI])}%
                    </h5>
                    <ul className='space-y-2 text-sm text-blue-700'>
                      {category.users
                        .filter((u) => u.status === ATTENDANCE_STATUS.MANDIRI)
                        .map((u) => (
                          <li
                            key={u.id}
                            className='break-words leading-relaxed'
                          >
                            {u.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className='bg-orange-50 p-5 rounded-lg border border-orange-200 min-w-0'>
                    <h5 className='font-semibold text-orange-800 mb-3 text-base'>
                      {ATTENDANCE_STATUS.DOA} (
                      {statusCounts[ATTENDANCE_STATUS.DOA]}) -{' '}
                      {getPercentage(statusCounts[ATTENDANCE_STATUS.DOA])}%
                    </h5>
                    <ul className='space-y-2 text-sm text-orange-700'>
                      {category.users
                        .filter((u) => u.status === ATTENDANCE_STATUS.DOA)
                        .map((u) => (
                          <li
                            key={u.id}
                            className='break-words leading-relaxed'
                          >
                            {u.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                  <div className='bg-red-50 p-5 rounded-lg border border-red-200 min-w-0'>
                    <h5 className='font-semibold text-red-800 mb-3 text-base'>
                      {ATTENDANCE_STATUS.ABSENT} (
                      {statusCounts[ATTENDANCE_STATUS.ABSENT]}) -{' '}
                      {getPercentage(statusCounts[ATTENDANCE_STATUS.ABSENT])}%
                    </h5>
                    <ul className='space-y-2 text-sm text-red-700'>
                      {category.users
                        .filter((u) => u.status === ATTENDANCE_STATUS.ABSENT)
                        .map((u) => (
                          <li
                            key={u.id}
                            className='break-words leading-relaxed'
                          >
                            {u.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  if (view === 'add_category') {
    return (
      <Card className='max-w-2xl'>
        <CardHeader>
          <CardTitle className='text-2xl'>Tambah Kategori Baru</CardTitle>
          <CardDescription>
            Buat kategori baru untuk mengelompokkan pengguna
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className='flex gap-3'
            onSubmit={(e) => {
              e.preventDefault()
              handleAddCategory()
            }}
          >
            <Input
              type='text'
              placeholder='Nama Kategori'
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              autoFocus
              className='flex-1'
            />
            <Button type='submit' className='bg-green-600 hover:bg-green-700'>
              <UserPlus className='w-4 h-4 mr-2' />
              Tambah
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  if (view === 'manage_category' && categoryId) {
    const category = masterConfig.find((c) => c.id === categoryId)
    if (!category)
      return <p className='text-gray-500'>Kategori tidak ditemukan.</p>

    const totalUsers = category.users?.length || 0
    const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE)
    const paginatedUsers = (category.users || []).slice(
      (currentPage - 1) * USERS_PER_PAGE,
      currentPage * USERS_PER_PAGE
    )

    return (
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle
                  className='text-2xl'
                  style={{ color: category.color }}
                >
                  Kelola: {category.name}
                </CardTitle>
                <CardDescription>
                  Tambah atau hapus pengguna dari kategori ini
                </CardDescription>
              </div>
              <Button
                onClick={() => handleDeleteCategory(category.id)}
                variant='destructive'
                className='gap-2'
              >
                <Trash2 className='w-4 h-4' />
                Hapus Kategori
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form
              className='flex gap-3 mb-6'
              onSubmit={(e) => {
                e.preventDefault()
                handleAddUser(category.id)
              }}
            >
              <Input
                type='text'
                placeholder='Nama Pengguna Baru'
                value={newUserNames[category.id] || ''}
                onChange={(e) =>
                  setNewUserNames({
                    ...newUserNames,
                    [category.id]: e.target.value,
                  })
                }
                autoFocus
                className='flex-1'
              />
              <Button
                type='submit'
                className='bg-blue-600 hover:bg-blue-700 gap-2'
              >
                <UserPlus className='w-4 h-4' />
                Tambah Pengguna
              </Button>
            </form>

            <div className='space-y-2'>
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors'
                >
                  <span className='font-medium text-gray-900'>{user.name}</span>
                  <Button
                    onClick={() => handleDeleteUser(category.id, user.id)}
                    variant='ghost'
                    size='sm'
                    className='text-red-600 hover:text-red-700 hover:bg-red-50'
                  >
                    <Trash2 className='w-4 h-4 mr-1' />
                    Hapus
                  </Button>
                </div>
              ))}
            </div>

            {totalUsers > USERS_PER_PAGE && (
              <div className='flex items-center justify-between mt-6 pt-4 border-t'>
                <Button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  variant='outline'
                  className='gap-2'
                >
                  <ChevronLeft className='w-4 h-4' />
                  Sebelumnya
                </Button>
                <span className='text-sm text-gray-600 font-medium'>
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant='outline'
                  className='gap-2'
                >
                  Berikutnya
                  <ChevronRight className='w-4 h-4' />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }
  return null
}

export default AdminManagementPanel
