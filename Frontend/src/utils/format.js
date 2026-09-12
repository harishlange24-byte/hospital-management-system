export function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(date) {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getUserName(entity) {
  if (!entity) return '—'
  if (typeof entity === 'object' && entity.user?.name) return entity.user.name
  if (typeof entity === 'object' && entity.name) return entity.name
  return '—'
}

export function toInputDate(date) {
  if (!date) return ''
  return new Date(date).toISOString().split('T')[0]
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
