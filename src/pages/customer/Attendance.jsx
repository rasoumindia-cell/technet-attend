import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAttendance } from '../../hooks/useAttendance'
import { Navbar } from '../../components/Navbar'
import { Calendar } from '../../components/Calendar'
import { Card, CardHeader, CardBody, Table, LoadingSpinner, ConfirmModal } from '../../components/ui'
import { Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export function Attendance() {
  const { user } = useAuth()
  const { attendance, markAttendance, isMarkedToday, deleteAttendance, loading } = useAttendance(user?.id)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDateClick = async (dateStr) => {
    await markAttendance(dateStr)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    await deleteAttendance(deleteId)
    setDeleteId(null)
    setDeleting(false)
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
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => setDeleteId(row.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )
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

        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Attendance"
          message="Are you sure you want to delete this attendance record? This action cannot be undone."
          loading={deleting}
        />
      </main>
    </div>
  )
}
