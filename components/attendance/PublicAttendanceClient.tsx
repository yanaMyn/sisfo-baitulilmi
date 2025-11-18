'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { db } from '@/lib/firebase/client'
import { doc, onSnapshot } from 'firebase/firestore'
import { ATTENDANCE_STATUS } from '@/lib/constants'
import { getCurrentMonthKey, formatMonthKey } from '@/lib/utils/date'
import { updateAttendanceStatus } from '@/lib/actions/attendance'
import CompactStatCard from './CompactStatCard'
import StatDetailModal from './StatDetailModal'
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
  const [selectedStat, setSelectedStat] = useState<AttendanceStats | null>(null)
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
      {selectedStat && (
        <StatDetailModal
          title={selectedStat.name}
          attended={selectedStat.attended}
          total={selectedStat.total}
          percentage={selectedStat.percentage}
          color={selectedStat.color}
          onClose={() => setSelectedStat(null)}
        />
      )}
      <main className='split-view-container'>
        {/* Header */}
        <header className='header-compact'>
          <div className='header-left'>
            <h1 className='text-xl font-bold text-blue-700'>Absensi ASAD Baitul Ilmi</h1>
            <span className='text-sm font-semibold text-gray-600'>
              {formatMonthKey(currentMonthKey)}
            </span>
          </div>
        </header>

        {/* Sticky Stats Section - Top Half */}
        <section
          ref={statsSectionRef}
          className='stats-container-compact'
          aria-label='Statistik Kehadiran'
        >
          <div className='stats-scroll-wrapper'>
            {attendanceStats.map((stat) => (
              <CompactStatCard
                key={stat.categoryId}
                title={stat.name}
                attended={stat.attended}
                total={stat.total}
                percentage={stat.percentage}
                color={stat.color}
                onClick={() => setSelectedStat(stat)}
              />
            ))}
          </div>
        </section>

        {/* Search Bar */}
        <div className='search-container-compact'>
          <input
            type='search'
            className='search-input'
            placeholder='Cari nama...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Scrollable Name List - Bottom Half */}
        <div className='name-list-container'>
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
        </div>
      </main>
    </>
  )
}

export default PublicAttendanceClient
