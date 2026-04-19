export function StatsCard({ title, value, icon: Icon, trend, trendUp = true, color = 'blue' }) {
  const colorStyles = {
    blue: {
      bg: 'from-blue-500 to-cyan-500',
      glow: 'group-hover:shadow-blue-500/25',
      icon: 'bg-blue-500'
    },
    green: {
      bg: 'from-emerald-500 to-teal-500',
      glow: 'group-hover:shadow-emerald-500/25',
      icon: 'bg-emerald-500'
    },
    purple: {
      bg: 'from-violet-500 to-purple-500',
      glow: 'group-hover:shadow-violet-500/25',
      icon: 'bg-violet-500'
    },
    orange: {
      bg: 'from-orange-500 to-amber-500',
      glow: 'group-hover:shadow-orange-500/25',
      icon: 'bg-orange-500'
    }
  }

  const style = colorStyles[color] || colorStyles.blue

  return (
    <div className={`group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${style.glow}`}>
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${style.bg} opacity-10 blur-2xl -translate-y-1/2 translate-x-1/2`} />
      
      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {value}
            </p>
            {trend && (
              <p className={`text-sm font-semibold mt-2 ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                <span className="inline-flex items-center">
                  {trendUp ? (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 7l-5 5H3v2l7-7 7 7v-2h-4l-5-5z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M12 13l5-5h-4V6l-7 7-7-7v2h4l5 5z" clipRule="evenodd" />
                    </svg>
                  )}
                  {trend}
                </span>
              </p>
            )}
          </div>
          {Icon && (
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${style.bg} shadow-lg`}>
              <Icon className="w-7 h-7 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}