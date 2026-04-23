import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSocialLinks() {
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLinks()
  }, [])

  const fetchLinks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .limit(5)

      if (error) throw error
      setLinks(data || [])
    } catch (error) {
      console.error('Error fetching social links:', error)
    } finally {
      setLoading(false)
    }
  }

  return { links, loading, refresh: fetchLinks }
}
