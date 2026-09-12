export function Input({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <select
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <textarea
        rows={3}
        className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700',
    secondary: 'border border-slate-300 text-slate-700 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-sm',
  }
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
