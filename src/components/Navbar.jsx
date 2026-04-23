import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Calendar, 
  CreditCard, 
  Users, 
  LogOut,
  Menu,
  X,
  Share2
} from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function Navbar() {
  const { profile, clearAuth, isAdmin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await clearAuth()
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/customer/attendance', label: 'Attendance', icon: Calendar },
    { to: '/customer/credits', label: 'Credits', icon: CreditCard },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/credits', label: 'Credits', icon: CreditCard },
    { to: '/admin/social-links', label: 'Social Links', icon: Share2 },
  ]

  const links = isAdmin ? adminLinks : customerLinks

  const NavLink = ({ to, label, icon: Icon }) => {
    const isActive = location.pathname === to
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-white/20 text-white shadow-lg shadow-blue-600/25'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">{label}</span>
      </Link>
    )
  }

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 backdrop-blur-lg border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-18">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
            </button>
            <div className="flex items-center gap-2">
              <img src="/Logo.jpeg" alt="TS Attend" className="w-9 h-9 rounded-xl object-cover shadow-md" />
              <span className="font-bold text-lg md:text-xl text-white">
                TS Attend
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            {links.map(link => (
              <NavLink key={link.to} {...link} />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">
                {profile?.name}
              </p>
              <p className="text-xs font-medium text-white/70 capitalize">
                {profile?.role}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-red-500 hover:text-white transition-all duration-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-2">
              {links.map(link => {
                const isActive = location.pathname === link.to
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    <link.icon className="w-5 h-5" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
