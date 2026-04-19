import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

export function useAttendance(userId) {
  const [attendance, setAttendance] = useState([])

  useEffect(() => {
    if (!userId) return
    
    const fetchAttendance = async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) {
        console.error('Attendance fetch error:', error)
      } else {
        setAttendance(data || [])
      }
    }
    fetchAttendance()
  }, [userId])

  const markAttendance = async (date) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    
    if (date !== today) {
      toast.error('You can only mark attendance for today!')
      return { error: 'Invalid date' }
    }

    const { error } = await supabase
      .from('attendance')
      .insert([{ user_id: userId, date }])

    if (error) {
      if (error.code === '23505') {
        toast.error('Attendance already marked for today!')
      } else {
        toast.error('Failed to mark attendance')
      }
      return { error }
    }

    toast.success('Attendance marked successfully!')
    
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    setAttendance(data || [])
    
    return { success: true }
  }

  const isMarkedToday = attendance.some(a => a.date === format(new Date(), 'yyyy-MM-dd'))

  return {
    attendance,
    markAttendance,
    isMarkedToday
  }
}

export function useCredits(userId) {
  const [credits, setCredits] = useState([])

  useEffect(() => {
    if (!userId) return
    
    const fetchCredits = async () => {
      const { data, error } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Credits fetch error:', error)
      } else {
        setCredits(data || [])
      }
    }
    fetchCredits()
  }, [userId])

  const totalCredits = credits.reduce((sum, c) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    if (c.valid_until >= today) {
      return sum + parseFloat(c.amount)
    }
    return sum
  }, 0)

  const getExpiringCredits = () => {
    const today = new Date()
    const warningDate = new Date(today)
    warningDate.setDate(warningDate.getDate() + 7)
    const todayStr = format(today, 'yyyy-MM-dd')
    const warningStr = format(warningDate, 'yyyy-MM-dd')

    return credits.filter(c => 
      c.valid_until >= todayStr && 
      c.valid_until <= warningStr
    )
  }

  return {
    credits,
    totalCredits,
    getExpiringCredits
  }
}