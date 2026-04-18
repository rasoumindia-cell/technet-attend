import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const SUPABASE_URL = 'https://wmlthxpdsknpfczxzmkk.supabase.co'
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_REy2veg2KW1auAq0HYy7kQ_Ckk_urHO'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    const token = localStorage.getItem('sb-access-token')
    const refreshToken = localStorage.getItem('sb-refresh-token')
    console.log('Checking session, token exists:', !!token)
    
    if (token) {
      try {
        if (refreshToken) {
          await supabase.auth.setSession({
            access_token: token,
            refresh_token: refreshToken
          })
        }

        const response = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const userData = await response.json()
          console.log('User data:', userData)
          setUser(userData)
          
          const profileRes = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${userData.id}`,
            {
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${token}`
              }
            }
          )
          
          const profiles = await profileRes.json()
          console.log('Profile data:', profiles)
          
          if (profiles && profiles.length > 0) {
            setProfile(profiles[0])
            setIsAdmin(profiles[0].role === 'admin')
          }
        }
      } catch (error) {
        console.error('Session check error:', error)
      }
    }
    setLoading(false)
  }

  const setUserData = (userData, profileData) => {
    setUser(userData)
    setProfile(profileData)
    setIsAdmin(profileData?.role === 'admin')
  }

  const clearAuth = async () => {
    localStorage.removeItem('sb-access-token')
    localStorage.removeItem('sb-refresh-token')
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      isAdmin,
      isCustomer: profile?.role === 'customer',
      setUserData,
      clearAuth,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}