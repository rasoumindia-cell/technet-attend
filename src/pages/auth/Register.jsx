import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../../components/ui'
import { Mail, Lock, User, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name || !email || !password) {
      toast.error('Please fill in all required fields')
      return
    }
    if (!email.endsWith('@gmail.com')) {
      toast.error('Only Gmail addresses are allowed (@gmail.com)')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    
    try {
      const customerId = `CUST${Math.floor(Math.random() * 9000) + 1000}`

      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: name,
            phone: phone,
            customer_id: customerId
          }
        }
      })

      if (error) {
        toast.error(error.message || 'Registration failed')
        setLoading(false)
        return
      }

      if (data.user) {
        // Upsert profile (insert or update if exists)
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            customer_id: customerId,
            name: name,
            role: 'customer'
          }, { onConflict: 'id' })

        if (profileError) {
          console.error('Profile creation failed:', profileError)
          toast.error('Account created but profile failed')
          setLoading(false)
          return
        }

        toast.success('Account created! Please login.')
        window.location.href = '/login'
      }
    } catch (error) {
      toast.error('Registration failed')
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/Logo.jpeg" alt="TS Attend" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-2xl" />
          <h1 className="text-3xl font-bold text-white">Create Account</h1>
          <p className="text-white mt-2">Join TS Attend today</p>
        </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                name="name"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-12 py-3"
                autoComplete="name"
              />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                name="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 py-3"
                autoComplete="email"
              />
            </div>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="tel"
                name="phone"
                placeholder="Phone number (optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-12 py-3"
                autoComplete="tel"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                name="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 py-3"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 shadow-lg shadow-blue-600/30 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating...
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}