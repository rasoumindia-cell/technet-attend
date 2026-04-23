import { useAuth } from '../../context/AuthContext'
import { useAttendance, useCredits } from '../../hooks/useAttendance'
import { useSocialLinks } from '../../hooks/useSocialLinks'
import { Navbar } from '../../components/Navbar'
import { Calendar } from '../../components/Calendar'
import { StatsCard } from '../../components/StatsCard'
import { CreditCard, Calendar as CalendarIcon, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const PLATFORM_COLORS = {
  facebook: 'bg-blue-600 hover:bg-blue-700',
  instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 hover:opacity-90',
  gmb: 'bg-green-600 hover:bg-green-700',
  twitter: 'bg-sky-500 hover:bg-sky-600',
  linkedin: 'bg-blue-700 hover:bg-blue-800',
  youtube: 'bg-red-600 hover:bg-red-700',
  default: 'bg-gray-600 hover:bg-gray-700'
}

export function CustomerDashboard() {
  const { user, profile } = useAuth()
  const { attendance, markAttendance, isMarkedToday } = useAttendance(user?.id)
  const { totalCredits, getExpiringCredits } = useCredits(user?.id)
  const { links: socialLinks, loading: socialLoading } = useSocialLinks()

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
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome, {userName}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Track your attendance and manage your credits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Calendar 
              markedDates={markedDates}
              onDateClick={handleDateClick}
              isMarkedToday={isMarkedToday}
            />

            {/* Social Links Section */}
            {!socialLoading && socialLinks.length > 0 && (
              <div className="rounded-2xl shadow-lg p-6 w-full max-w-[1200px] mx-auto">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                  Latest Updates
                  <span className="ml-2 text-2xl animate-bounce">🎉</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {socialLinks.slice(0, 5).map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200"
                    >
                      {link.thumbnail_url ? (
                        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700">
                          <img
                            src={link.thumbnail_url}
                            alt={link.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                  <svg class="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              `
                            }}
                          />
                        </div>
                      ) : (
                        <div className="aspect-video w-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <ExternalLink className="w-12 h-12 text-white/50" />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {link.title}
                        </h3>
                        {link.description && (
                          <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mt-1">
                            {link.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {link.platform}
                          </span>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            View Offer →
                          </span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
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