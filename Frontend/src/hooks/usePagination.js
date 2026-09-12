import { useState, useCallback } from 'react'

export default function usePagination(initialLimit = 10) {
  const [page, setPage] = useState(1)
  const [limit] = useState(initialLimit)
  const [pagination, setPagination] = useState(null)

  const resetPage = useCallback(() => setPage(1), [])

  return { page, setPage, limit, pagination, setPagination, resetPage }
}
