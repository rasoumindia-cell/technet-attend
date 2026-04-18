export function Input({ 
  label, 
  error, 
  className = '', 
  ...props 
}) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error 
            ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          } text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500`}
        {...props}
      />
      {error && (
        <p className="text-sm font-medium text-red-500">{error}</p>
      )}
    </div>
  )
}