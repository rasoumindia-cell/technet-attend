import { useState } from 'react'
import { ChevronLeft, ChevronRight, Check, CheckCircle } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, addMonths, subMonths } from 'date-fns'

export function Calendar({ markedDates = [], onDateClick, isMarkedToday }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isSubmitting, setIsSubmitting] = useState(false)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const startDay = monthStart.getDay()
  const emptyDays = Array(startDay).fill(null)

  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const handleDateClick = async (day) => {
    if (!day || isMarkedToday || isSubmitting) return
    
    const dateStr = format(day, 'yyyy-MM-dd')
    if (dateStr !== todayStr) {
      return
    }

    setIsSubmitting(true)
    if (onDateClick) {
      await onDateClick(dateStr)
    }
    setTimeout(() => setIsSubmitting(false), 1000)
  }

  const handleMarkToday = async () => {
    if (isMarkedToday || isSubmitting) return
    
    setIsSubmitting(true)
    if (onDateClick) {
      await onDateClick(todayStr)
    }
    setTimeout(() => setIsSubmitting(false), 1000)
  }

  const isDateMarked = (day) => {
    if (!day) return false
    return markedDates.some(d => d.date === format(day, 'yyyy-MM-dd'))
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 w-full max-w-md mx-auto">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" />
        ))}
        {days.map(day => {
          const isCurrentDay = isToday(day)
          const isMarked = isDateMarked(day)
          const dateStr = format(day, 'yyyy-MM-dd')
          const isClickable = dateStr === todayStr && !isMarked && !isSubmitting

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              disabled={!isClickable}
              className={`
                aspect-square flex items-center justify-center rounded-lg text-base
                transition-all duration-200 relative
                ${isCurrentDay 
                  ? isMarked 
                    ? 'bg-green-500 text-white font-semibold' 
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold ring-2 ring-blue-500'
                  : isMarked 
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
                ${!isClickable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                ${isSubmitting ? 'opacity-50 cursor-wait' : ''}
              `}
            >
              {format(day, 'd')}
              {isMarked && isCurrentDay && (
                <span className="absolute -top-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-0.5">
                  <Check className="w-3 h-3 text-green-500" />
                </span>
              )}
            </button>
          )
        })}
      </div>

      {!isMarkedToday && !isSubmitting && (
        <button
          onClick={handleMarkToday}
          className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          Mark Today's Attendance
        </button>
      )}

      {isSubmitting && (
        <button
          disabled
          className="mt-4 w-full py-3 bg-blue-400 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
        >
          <span className="animate-spin">⏳</span>
          Marking...
        </button>
      )}

      {isMarkedToday && !isSubmitting && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg text-center">
          <p className="text-sm text-green-700 dark:text-green-400 font-medium flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Attendance marked for today!
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500" />
          <span>Today</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-500" />
          <span>Marked</span>
        </div>
      </div>
    </div>
  )
}