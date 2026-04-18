import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../../components/ui'
import { Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const SUPABASE_URL = 'https://wmlthxpdsknpfczxzmkk.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_REy2veg2KW1auAq0HYy7kQ_Ckk_urHO'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_KEY
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error_description || data.msg || 'Login failed')
        setLoading(false)
        return
      }

      if (data.user) {
        const profileRes = await fetch(
          `${SUPABASE_URL}/rest/v1/profiles?id=eq.${data.user.id}`,
          {
            headers: {
              'apikey': SUPABASE_KEY,
              'Authorization': `Bearer ${data.access_token}`
            }
          }
        )
        
        const profiles = await profileRes.json()
        
        if (profiles && profiles.length > 0 && profiles[0].role === 'customer') {
          localStorage.setItem('sb-access-token', data.access_token)
          localStorage.setItem('sb-refresh-token', data.refresh_token)
          toast.success('Login successful!')
          window.location.href = '/customer/dashboard'
        } else {
          toast.error('Use admin login page')
          setLoading(false)
        }
      }
    } catch (error) {
      toast.error('Network error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/Logo.jpeg" alt="TS Attend" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-4 shadow-2xl" />
          <h1 className="text-3xl font-bold text-white">Customer Login</h1>
          <p className="text-white mt-2">Sign in to TS Attend</p>
        </div>

        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="password"
                name="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12 py-3"
                autoComplete="current-password"
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
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Sign up
            </Link>
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
            <Link to="/admin-login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}