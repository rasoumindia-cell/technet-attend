import { useState, useEffect } from 'react'
import { Navbar } from '../../components/Navbar'
import { Card, CardHeader, CardBody, Table, Input, LoadingSpinner, ConfirmModal, Button } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { Search, Trash2, Eye, CreditCard } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [customerStats, setCustomerStats] = useState({})

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')

      if (error) {
        console.log('Error:', error)
      }
      // Filter out admins from client side
      const customersOnly = (data || []).filter(p => !p.role || p.role !== 'admin')
      setCustomers(customersOnly)

      const stats = {}
      for (const customer of data || []) {
        const [attendance, credits] = await Promise.all([
          supabase.from('attendance').select('*').eq('user_id', customer.id),
          supabase.from('credits').select('*').eq('user_id', customer.id)
        ])

        const activeCredits = credits.data?.filter(c => 
          new Date(c.valid_until) >= new Date()
        ) || []
        
        const totalActive = activeCredits.reduce((sum, c) => sum + parseFloat(c.amount), 0) || 0
        
        const earliestExpiry = activeCredits.length > 0 
          ? activeCredits.sort((a, b) => new Date(a.valid_until) - new Date(b.valid_until))[0].valid_until
          : null

        stats[customer.id] = {
          attendanceCount: attendance.count || 0,
          activeCredits: totalActive,
          validTill: earliestExpiry
        }
      }
      setCustomerStats(stats)
    } catch (error) {
      toast.error('Failed to fetch customers')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', deleteId)

      if (error) throw error

      toast.success('Customer deleted successfully')
      setCustomers(customers.filter(c => c.id !== deleteId))
    } catch (error) {
      toast.error('Failed to delete customer')
      console.error(error)
    } finally {
      setDeleteId(null)
      setDeleting(false)
    }
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.customer_id?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Customer Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
              {customers.length} total customers
            </p>
          </div>
        </div>

        <Card>
          <CardHeader className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <Table
              columns={[
                {
                  header: 'Customer ID',
                  accessor: 'customer_id',
                  render: (row) => (
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {row.customer_id}
                    </span>
                  )
                },
                {
                  header: 'Customer',
                  render: (row) => (
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {row.name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">{row.customer_id}</p>
                    </div>
                  )
                },
                {
                  header: 'Phone',
                  accessor: 'phone',
                  render: (row) => row.phone || 'N/A'
                },
                {
                  header: 'Joined',
                  render: (row) => format(new Date(row.created_at), 'MMM d, yyyy')
                },
                {
                  header: 'Attendance',
                  render: (row) => customerStats[row.id]?.attendanceCount || 0
                },
                {
                  header: 'Active Credits',
                  render: (row) => (
                    <span className="text-green-600 font-medium">
                      {customerStats[row.id]?.activeCredits?.toFixed(2) || '0.00'}
                    </span>
                  )
                },
                {
                  header: 'Valid Till',
                  render: (row) => {
                    const validTill = customerStats[row.id]?.validTill
                    if (!validTill) return <span className="text-gray-400">-</span>
                    const daysLeft = Math.ceil((new Date(validTill) - new Date()) / (1000 * 60 * 60 * 24))
                    const isExpiringSoon = daysLeft <= 7 && daysLeft > 0
                    return (
                      <span className={isExpiringSoon ? 'text-orange-600 font-medium' : 'text-gray-600 dark:text-gray-300'}>
                        {format(new Date(validTill), 'MMM d, yyyy')}
                        {isExpiringSoon && ` (${daysLeft}d)`}
                      </span>
                    )
                  }
                },
                {
                  header: 'Actions',
                  render: (row) => (
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/customer/${row.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/admin/credits?customer=${row.id}`}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                        title="Add Credits"
                      >
                        <CreditCard className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteId(row.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                }
              ]}
              data={filteredCustomers}
              emptyMessage="No customers found"
            />
          </CardBody>
        </Card>

        <ConfirmModal
          isOpen={!!deleteId}
          onClose={() => setDeleteId(null)}
          onConfirm={handleDelete}
          title="Delete Customer"
          message="Are you sure you want to delete this customer? All their attendance records and credits will also be deleted. This action cannot be undone."
          loading={deleting}
        />
      </main>
    </div>
  )
}
