'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { db } from '@/lib/firebase/client'
import { doc, onSnapshot } from 'firebase/firestore'
import { ATTENDANCE_STATUS } from '@/lib/constants'
import { getCurrentMonthKey, formatMonthKey } from '@/lib/utils/date'
import { updateAttendanceStatus } from '@/lib/actions/attendance'
import CategoryStatCard from './CategoryStatCard'
import StatusBadge from './StatusBadge'
import AttendanceCheckmark from './AttendanceCheckmark'
import PublicAttendanceModal from './PublicAttendanceModal'
import LoadingSpinner from '../common/LoadingSpinner'
import type { Category, AttendanceData, User, AttendanceStats } from '@/types'

interface PublicAttendanceClientProps {
  initialCategories: Category[]
  initialAttendance: AttendanceData
}

const PublicAttendanceClient: React.FC<PublicAttendanceClientProps> = ({
  initialCategories,
  initialAttendance,
}) => {
  const [masterConfig, setMasterConfig] =
    useState<Category[]>(initialCategories)
  const [attendanceData, setAttendanceData] =
    useState<AttendanceData>(initialAttendance)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const currentMonthKey = getCurrentMonthKey()
  const statsSectionRef = useRef<HTMLElement>(null)

  // Real-time listener for attendance data
  useEffect(() => {
    const attendanceDocRef = doc(db, 'attendance', currentMonthKey)
    const unsubscribe = onSnapshot(attendanceDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setAttendanceData(docSnap.data() as AttendanceData)
      }
    })

    return () => unsubscribe()
  }, [currentMonthKey])

  const handleUpdateStatus = async (userId: string, status: string) => {
    setEditingUser(null)

    statsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })

    setTimeout(async () => {
      await updateAttendanceStatus(userId, status, currentMonthKey)
    }, 600)
  }

  const displayData = useMemo(() => {
    if (!attendanceData) return []

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
    }))

    return filteredAndSorted.filter((cat) => cat.users.length > 0)
  }, [masterConfig, attendanceData, searchTerm])

  const attendanceStats: AttendanceStats[] = useMemo(() => {
    const originalData = masterConfig.map((cat) => ({
      ...cat,
      users: (cat.users || []).map((user) => ({
        ...user,
        status: attendanceData[user.id]?.status || ATTENDANCE_STATUS.ABSENT,
      })),
    }))

    return originalData.map((cat) => {
      const attended = cat.users.filter(
        (u) => u.status !== ATTENDANCE_STATUS.ABSENT
      ).length
      const total = cat.users.length
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0
      return {
        categoryId: cat.id,
        name: cat.name,
        color: cat.color,
        attended,
        total,
        percentage,
      }
    })
  }, [masterConfig, attendanceData])

  return (
    <>
      {editingUser && (
        <PublicAttendanceModal
          user={editingUser}
          onSave={handleUpdateStatus}
          onClose={() => setEditingUser(null)}
        />
      )}
      <main>
        <header className='header'>
          <div className='header-left'>
            <h1>Absensi ASAD Baitul Ilmi</h1>
            <span className='header-subtitle'>
              {formatMonthKey(currentMonthKey)}
            </span>
          </div>
        </header>
        <section
          ref={statsSectionRef}
          className='stats-container'
          aria-label='Statistik Kehadiran'
        >
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

        <div className='search-container'>
          <input
            type='search'
            className='search-input'
            placeholder='Cari nama...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {displayData.length === 0 && searchTerm && (
          <p className='no-results'>Nama tidak ditemukan.</p>
        )}

        {displayData.map((category) => (
          <section key={category.id} className='attendance-section'>
            <h2
              className='section-title'
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </h2>
            <ul className='user-list'>
              {category.users.map((person) => (
                <li
                  key={person.id}
                  className='user-item interactive'
                  onClick={() => setEditingUser(person)}
                >
                  <div className='user-info'>
                    {person.status !== ATTENDANCE_STATUS.ABSENT && (
                      <AttendanceCheckmark />
                    )}
                    <span className='user-item-label'>{person.name}</span>
                  </div>
                  <StatusBadge
                    status={person.status || ATTENDANCE_STATUS.ABSENT}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </>
  )
}

export default PublicAttendanceClient
