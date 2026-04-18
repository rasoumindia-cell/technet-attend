import { useAuth } from '../../context/AuthContext'
import { useCredits } from '../../hooks/useAttendance'
import { Navbar } from '../../components/Navbar'
import { StatsCard } from '../../components/StatsCard'
import { Card, CardHeader, CardBody, Table, LoadingSpinner } from '../../components/ui'
import { CreditCard, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { format, formatDistanceToNow, differenceInDays } from 'date-fns'

export function Credits() {
  const { user } = useAuth()
  const { credits, totalCredits, getExpiringCredits, loading } = useCredits(user?.id)

  const activeCredits = credits.filter(c => new Date(c.valid_until) >= new Date())
  const expiredCredits = credits.filter(c => new Date(c.valid_until) < new Date())
  const expiringCredits = getExpiringCredits()

  const getDaysUntilExpiry = (date) => {
    return differenceInDays(new Date(date), new Date())
  }

  const getCreditStatus = (credit) => {
    const daysLeft = getDaysUntilExpiry(credit.valid_until)
    if (daysLeft < 0) return { status: 'Expired', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' }
    if (daysLeft <= 7) return { status: 'Expiring soon', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' }
    return { status: 'Active', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' }
  }

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          My Credits
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatsCard
            title="Total Credits"
            value={totalCredits.toFixed(2)}
            icon={CreditCard}
            color="green"
          />
          <StatsCard
            title="Active Credits"
            value={activeCredits.length}
            icon={CheckCircle}
            color="blue"
          />
          <StatsCard
            title="Expiring Soon"
            value={expiringCredits.length}
            icon={AlertTriangle}
            color="orange"
          />
          <StatsCard
            title="Expired"
            value={expiredCredits.length}
            icon={Clock}
            color="purple"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Active Credits
              </h2>
            </CardHeader>
            <CardBody>
              {activeCredits.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No active credits at the moment.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeCredits.map(credit => {
                    const { status, color, bg } = getCreditStatus(credit)
                    const daysLeft = getDaysUntilExpiry(credit.valid_until)

                    return (
                      <div
                        key={credit.id}
                        className={`p-4 rounded-lg border ${bg}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {parseFloat(credit.amount).toFixed(2)}
                          </span>
                          <span className={`text-sm font-medium ${color}`}>
                            {status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {credit.description || 'Credit added'}
                        </p>
                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Valid until: {format(new Date(credit.valid_until), 'MMMM d, yyyy')}
                            {daysLeft > 0 && ` (${daysLeft} days left)`}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Credit History
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {credits.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No credit history available.
                </p>
              ) : (
                <Table
                  columns={[
                    {
                      header: 'Amount',
                      render: (row) => (
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          +{parseFloat(row.amount).toFixed(2)}
                        </span>
                      )
                    },
                    {
                      header: 'Description',
                      accessor: 'description',
                      render: (row) => row.description || 'Credit added'
                    },
                    {
                      header: 'Valid Until',
                      render: (row) => format(new Date(row.valid_until), 'MMM d, yyyy')
                    },
                    {
                      header: 'Status',
                      render: (row) => {
                        const { status, color } = getCreditStatus(row)
                        return (
                          <span className={`text-sm font-medium ${color}`}>
                            {status}
                          </span>
                        )
                      }
                    }
                  ]}
                  data={credits}
                  emptyMessage="No credit history"
                />
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  )
}
