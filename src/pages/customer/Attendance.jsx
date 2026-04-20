import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAttendance } from '../../hooks/useAttendance'
import { Navbar } from '../../components/Navbar'
import { Calendar } from '../../components/Calendar'
import { Card, CardHeader, CardBody, Table, LoadingSpinner } from '../../components/ui'
import { format } from 'date-fns'

export function Attendance() {
  const { user } = useAuth()
  const { attendance, markAttendance, isMarkedToday, loading } = useAttendance(user?.id)

  const handleDateClick = async (dateStr) => {
    await markAttendance(dateStr)
  }

  const markedDates = attendance.map(a => ({ date: a.date, id: a.id }))

  const columns = [
    {
      header: 'Date',
      accessor: 'date',
      render: (row) => format(new Date(row.date), 'MMMM d, yyyy')
    },
    {
      header: 'Day',
      accessor: 'date',
      render: (row) => format(new Date(row.date), 'EEEE')
    },
    {
      header: 'Marked At',
      accessor: 'created_at',
      render: (row) => format(new Date(row.created_at), 'h:mm a')
    }
  ]

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          Attendance Management
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Calendar 
            markedDates={markedDates}
            onDateClick={handleDateClick}
            isMarkedToday={isMarkedToday}
          />

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attendance History
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total: {attendance.length} days
              </p>
            </CardHeader>
            <CardBody className="p-0">
              {attendance.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No attendance records yet. Mark your attendance using the calendar!
                </div>
              ) : (
                <Table 
                  columns={columns} 
                  data={attendance}
                  emptyMessage="No attendance records"
                />
              )}
            </CardBody>
          </Card>
        </div>

      </main>
    </div>
  )
}
