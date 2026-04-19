import { useState, useEffect } from 'react'
import { Navbar } from '../../components/Navbar'
import { Card, CardHeader, CardBody, Input, Button, LoadingSpinner, Table } from '../../components/ui'
import { supabase } from '../../lib/supabase'
import { Search, Plus, Trash2 } from 'lucide-react'
import { format, addDays } from 'date-fns'
import toast from 'react-hot-toast'
import { useSearchParams } from 'react-router-dom'

export function AdminCredits() {
  const [searchParams] = useSearchParams()
  const preselectedCustomer = searchParams.get('customer')
  
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState(preselectedCustomer || '')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [customerCredits, setCustomerCredits] = useState([])

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomer) {
      fetchCustomerCredits(selectedCustomer)
    }
  }, [selectedCustomer])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('profiles')
        .select('id, name, customer_id, role')
      
      const customersOnly = (data || []).filter(p => !p.role || p.role !== 'admin')
      setCustomers(customersOnly)
    } catch (error) {
      console.error(error)
      toast.error('Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomerCredits = async (customerId) => {
    try {
      const { data } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', customerId)
        .order('created_at', { ascending: false })

      setCustomerCredits(data || [])
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCustomer) {
      toast.error('Please select a customer')
      return
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSubmitting(true)
    try {
      const validUntil = format(addDays(new Date(), 45), 'yyyy-MM-dd')
      const customer = customers.find(c => c.id === selectedCustomer)

      const { error } = await supabase
        .from('credits')
        .insert([{
          user_id: selectedCustomer,
          amount: parseFloat(amount),
          description: description || 'Credit added by admin',
          valid_until: validUntil
        }])

      if (error) throw error

      toast.success('Credits added successfully!')
      
      setAmount('')
      setDescription('')
      fetchCustomerCredits(selectedCustomer)
    } catch (error) {
      toast.error('Failed to add credits')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCredit = async (creditId) => {
    if (!confirm('Delete this credit?')) return
    
    try {
      await supabase.from('credits').delete().eq('id', creditId)
      toast.success('Credit deleted!')
      fetchCustomerCredits(selectedCustomer)
    } catch (error) {
      toast.error('Failed to delete credit')
    }
  }

  const selectedCustomerData = customers.find(c => c.id === selectedCustomer)

  if (loading) return <LoadingSpinner size="lg" />

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Credit Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
            Add and manage customer credits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add Credits
              </h2>
            </CardHeader>
            <CardBody className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Customer
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                    >
                      <option value="">Select a customer...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.customer_id})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <Input
                  label="Amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <Input
                  label="Description (optional)"
                  type="text"
                  placeholder="e.g., Monthly reward"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />

                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                    Credits valid for <span className="text-blue-900 dark:text-blue-300">45 days</span> until {format(addDays(new Date(), 45), 'MMMM d, yyyy')}
                  </p>
                </div>

                <Button type="submit" className="w-full" loading={submitting}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Credits
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedCustomerData ? `Credits for ${selectedCustomerData.name}` : 'Customer Credits'}
              </h2>
            </CardHeader>
            <CardBody className="p-0">
              {!selectedCustomer ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  Select a customer to view credits
                </div>
              ) : customerCredits.length === 0 ? (
                <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                  No credits for this customer
                </div>
              ) : (
                <Table
                  columns={[
                    { header: 'Amount', render: (row) => <span className="font-semibold text-green-600">+{parseFloat(row.amount).toFixed(2)}</span> },
                    { header: 'Description', accessor: 'description' },
                    { header: 'Valid Until', render: (row) => {
                      const isExpired = new Date(row.valid_until) < new Date()
                      return <span className={isExpired ? 'text-red-500' : ''}>{format(new Date(row.valid_until), 'MMM d, yyyy')}</span>
                    }},
                    { header: 'Status', render: (row) => {
                      const isExpired = new Date(row.valid_until) < new Date()
                      return <span className={`text-xs px-2 py-1 rounded-full ${isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {isExpired ? 'Expired' : 'Active'}
                      </span>
                    }},
                    { header: 'Actions', render: (row) => (
                      <button onClick={() => handleDeleteCredit(row.id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  ]}
                  data={customerCredits}
                />
              )}
            </CardBody>
          </Card>
        </div>
      </main>
    </div>
  )
}
