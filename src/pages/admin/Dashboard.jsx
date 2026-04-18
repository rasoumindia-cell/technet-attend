import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { StatsCard } from '../../components/StatsCard'
import { LoadingSpinner, Card, CardHeader, CardBody } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { Users, Calendar, CreditCard, TrendingUp, ArrowRight, UserPlus } from 'lucide-react'
import { format } from 'date-fns'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalAttendance: 0,
    totalCredits: 0,
    thisMonthAttendance: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentCredits, setRecentCredits] = useState([])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const today = new Date()
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const [allCustomers, attendance, credits, monthAttendance, recentCreditsData, profiles] = await Promise.all([
        supabase.from('profiles').select('id, role'),
        supabase.from('attendance').select('id', { count: 'exact' }),
        supabase.from('credits').select('amount'),
        supabase.from('attendance').select('date').gte('date', format(firstDayOfMonth, 'yyyy-MM-dd')),
        supabase.from('credits').select('*, profiles!inner(name)').order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id, name, customer_id')
      ])

      const customers = (allCustomers.data || []).filter(p => !p.role || p.role !== 'admin')
      const totalCreditsAmount = credits.data?.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0

      const profileMap = {}
      profiles.data?.forEach(p => {
        profileMap[p.id] = p
      })

      const creditsWithNames = (recentCreditsData.data || []).map(c => ({
        ...c,
        customerName: profileMap[c.user_id]?.name || 'Unknown',
        customerId: profileMap[c.user_id]?.customer_id || ''
      }))

      setStats({
        totalCustomers: customers.length || 0,
        totalAttendance: attendance.count || 0,
        totalCredits: totalCreditsAmount,
        thisMonthAttendance: monthAttendance.data?.length || 0
      })
      setRecentCredits(creditsWithNames)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Welcome back! Here's your attendance overview
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            color="blue"
          />
          <StatsCard
            title="Total Attendance"
            value={stats.totalAttendance}
            icon={Calendar}
            color="green"
          />
          <StatsCard
            title="Total Credits Issued"
            value={stats.totalCredits.toFixed(2)}
            icon={CreditCard}
            color="purple"
          />
          <StatsCard
            title="This Month Attendance"
            value={stats.thisMonthAttendance}
            icon={TrendingUp}
            color="orange"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Credits
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {recentCredits.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No recent credits
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {recentCredits.map(credit => (
                    <div key={credit.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {credit.customerName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {credit.customerId}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600 dark:text-green-400">
                          +{parseFloat(credit.amount).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(credit.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Quick Links
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <Link
                  to="/admin/customers"
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Customers</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage all customers</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>

                <Link
                  to="/admin/credits"
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Credits</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add & manage credits</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  )
}