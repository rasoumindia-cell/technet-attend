import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Navbar } from '../../components/Navbar'
import { Card, CardHeader, CardBody, Table, LoadingSpinner, Button, ConfirmModal } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Trash2, Calendar, CreditCard, User, Mail, Phone, Edit } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function CustomerDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [customer, setCustomer] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteAttendanceId, setDeleteAttendanceId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [editingCredit, setEditingCredit] = useState(null)
  const [editFormData, setEditFormData] = useState({ amount: '', description: '', valid_until: '' })

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      const [customerRes, attendanceRes, creditsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', id).single(),
        supabase.from('attendance').select('*').eq('user_id', id).order('date', { ascending: false }),
        supabase.from('credits').select('*').eq('user_id', id).order('created_at', { ascending: false })
      ])

      if (customerRes.error) throw customerRes.error
      setCustomer(customerRes.data)
      setAttendance(attendanceRes.data || [])
      setCredits(creditsRes.data || [])
    } catch (error) {
      toast.error('Failed to fetch customer data')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAttendance = async () => {
    if (!deleteAttendanceId) return
    setDeleting(true)
    try {
      const { error } = await supabase
        .from('attendance')
        .delete()
        .eq('id', deleteAttendanceId)

      if (error) throw error
      toast.success('Attendance deleted')
      setAttendance(attendance.filter(a => a.id !== deleteAttendanceId))
    } catch (error) {
      toast.error('Failed to delete attendance')
    } finally {
      setDeleteAttendanceId(null)
      setDeleting(false)
    }
  }

  const handleEditCredit = (credit) => {
    setEditingCredit(credit)
    setEditFormData({
      amount: credit.amount,
      description: credit.description || '',
      valid_until: credit.valid_until ? credit.valid_until.split('T')[0] : '',
      used: credit.used || false
    })
  }

  const handleSaveCredit = async () => {
    if (!editingCredit) return
    try {
      const { error } = await supabase
        .from('credits')
        .update({
          amount: parseFloat(editFormData.amount),
          description: editFormData.description,
          valid_until: editFormData.valid_until,
          used: editFormData.used
        })
        .eq('id', editingCredit.id)

      if (error) throw error
      toast.success('Credit updated successfully')
      setEditingCredit(null)
      fetchData()
    } catch (error) {
      toast.error('Failed to update credit')
      console.error(error)
    }
  }

  const handleDeleteCredit = async (creditId) => {
    try {
      const { error } = await supabase
        .from('credits')
        .delete()
        .eq('id', creditId)

      if (error) throw error
      toast.success('Credit deleted successfully')
      setCredits(credits.filter(c => c.id !== creditId))
    } catch (error) {
      toast.error('Failed to delete credit')
      console.error(error)
    }
  }

  const totalActiveCredits = credits
    .filter(c => new Date(c.valid_until) >= new Date())
    .reduce((sum, c) => sum + parseFloat(c.amount), 0)

  if (loading) {
    return <LoadingSpinner size="lg" />
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Customer not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <button
          onClick={() => navigate('/admin/customers')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Customers
        </button>

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full">
              {customer.customer_id}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {customer.name}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{customer.customer_id}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Attendance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {attendance.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Active Credits</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalActiveCredits.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <User className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {format(new Date(customer.created_at), 'MMM yyyy')}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Attendance History
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {attendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No attendance records
                </div>
              ) : (
                <Table
                  columns={[
                    {
                      header: 'Date',
                      render: (row) => format(new Date(row.date), 'MMM d, yyyy')
                    },
                    {
                      header: 'Day',
                      render: (row) => format(new Date(row.date), 'EEEE')
                    },
                    {
                      header: 'Actions',
                      render: (row) => (
                        <button
                          onClick={() => setDeleteAttendanceId(row.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )
                    }
                  ]}
                  data={attendance}
                />
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Credits History
                </h2>
                <Link
                  to={`/admin/credits?customer=${id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Add Credits
                </Link>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              {credits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No credits history
                </div>
              ) : (
                <Table
                  columns={[
                    {
                      header: 'Amount',
                      render: (row) => (
                        <span className="text-green-600 font-medium">
                          +{parseFloat(row.amount).toFixed(2)}
                        </span>
                      )
                    },
                    {
                      header: 'Description',
                      accessor: 'description'
                    },
                    {
                      header: 'Valid Until',
                      render: (row) => format(new Date(row.valid_until), 'MMM d')
                    },
                    {
                      header: 'Status',
                      render: (row) => (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          row.used 
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' 
                            : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {row.used ? 'Used' : 'Not Used'}
                        </span>
                      )
                    },
                    {
                      header: 'Actions',
                      render: (row) => (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditCredit(row)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCredit(row.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )
                    }
                  ]}
                  data={credits}
                />
              )}
            </CardBody>
          </Card>
        </div>

        <ConfirmModal
          isOpen={!!deleteAttendanceId}
          onClose={() => setDeleteAttendanceId(null)}
          onConfirm={handleDeleteAttendance}
          title="Delete Attendance"
          message="Are you sure you want to delete this attendance record?"
          loading={deleting}
        />

        {/* Edit Credit Modal */}
        {editingCredit && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
              <div className="fixed inset-0 bg-black/50" onClick={() => setEditingCredit(null)} />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Edit Credit
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editFormData.amount}
                      onChange={(e) => setEditFormData({...editFormData, amount: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={editFormData.valid_until}
                      onChange={(e) => setEditFormData({...editFormData, valid_until: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="used"
                      checked={editFormData.used}
                      onChange={(e) => setEditFormData({...editFormData, used: e.target.checked})}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="used" className="text-sm text-gray-700 dark:text-gray-300">
                      Mark as Used
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setEditingCredit(null)}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCredit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
