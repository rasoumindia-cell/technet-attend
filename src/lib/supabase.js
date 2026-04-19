import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

const TOKEN_KEY = 'sb-access-token'
const REFRESH_KEY = 'sb-refresh-token'

const getStoredSession = () => {
  const accessToken = localStorage.getItem(TOKEN_KEY)
  const refreshToken = localStorage.getItem(REFRESH_KEY)
  
  if (accessToken && refreshToken) {
    const expiresAt = new Date().getTime() + (4 * 60 * 60 * 1000)
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_at: expiresAt,
      token_type: 'bearer',
      user: null
    }
  }
  return null
}

let supabaseInstance = null

const initializeSupabase = () => {
  if (supabaseInstance) return supabaseInstance
  
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
  
  const storedSession = getStoredSession()
  if (storedSession) {
    supabaseInstance.auth.setSession({
      access_token: storedSession.access_token,
      refresh_token: storedSession.refresh_token
    })
  }
  
  return supabaseInstance
}

export const supabase = initializeSupabase()