import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null

  return (
    <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
      <p className="text-sm text-slate-500">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!pagination.hasPrevPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </button>
        <button
          type="button"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
