import { useAuth } from '../../context/AuthContext'
import { useAttendance, useCredits } from '../../hooks/useAttendance'
import { Navbar } from '../../components/Navbar'
import { Calendar } from '../../components/Calendar'
import { StatsCard } from '../../components/StatsCard'
import { CreditCard, Calendar as CalendarIcon, TrendingUp, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export function CustomerDashboard() {
  const { user, profile } = useAuth()
  const { attendance, markAttendance, isMarkedToday } = useAttendance(user?.id)
  const { totalCredits, getExpiringCredits } = useCredits(user?.id)

  const userName = profile?.name || user?.email?.split('@')[0] || 'User'

  const handleDateClick = async (dateStr) => {
    if (isMarkedToday) {
      toast.error('You have already marked attendance for today!')
      return
    }
    await markAttendance(dateStr)
  }

  const markedDates = attendance.map(a => ({ date: a.date, id: a.id }))
  const expiringCredits = getExpiringCredits()
  const currentMonthAttendance = attendance.filter(a => {
    const today = new Date()
    const attendanceDate = new Date(a.date)
    return attendanceDate.getMonth() === today.getMonth() && 
           attendanceDate.getFullYear() === today.getFullYear()
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome, {userName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Track your attendance and manage your credits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Calendar 
              markedDates={markedDates}
              onDateClick={handleDateClick}
              isMarkedToday={isMarkedToday}
            />
          </div>

          <div className="lg:col-span-1 space-y-4">
            <StatsCard
              title="Total Credits"
              value={totalCredits.toFixed(2)}
              icon={CreditCard}
              color="green"
            />
            <StatsCard
              title="Total Attendance"
              value={attendance.length}
              icon={CalendarIcon}
              color="blue"
            />
            <StatsCard
              title="This Month"
              value={currentMonthAttendance.length}
              icon={TrendingUp}
              color="purple"
            />
            <StatsCard
              title="Expiring Soon"
              value={expiringCredits.length}
              icon={AlertTriangle}
              color="orange"
            />
          </div>
        </div>
      </main>
    </div>
  )
}