import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getMedicines } from '../../api/pharmacy.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import usePagination from '../../hooks/usePagination'
import { formatCurrency } from '../../utils/format'

export default function PatientPharmacyPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getMedicines({ page, limit, search: search || undefined, isActive: 'true' })
      .then(({ data }) => {
        setMedicines(data.data || [])
        setPagination(data.pagination)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [page, search])

  return (
    <div>
      <PageHeader title="Pharmacy" description="Browse available medicines" />

      <div className="mb-4">
        <input type="search" placeholder="Search medicines..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {loading ? <LoadingSpinner /> : medicines.length === 0 ? (
        <EmptyState message="No medicines available" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {medicines.map((med) => (
            <div key={med._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="font-semibold text-slate-800">{med.name}</h3>
              {med.brand && <p className="text-sm text-slate-500">{med.brand}</p>}
              {med.category && <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{med.category}</span>}
              <p className="mt-3 text-lg font-bold text-primary-600">{formatCurrency(med.price)}</p>
              <p className="text-xs text-slate-500">Stock: {med.stock} {med.unit}s</p>
              {med.description && <p className="mt-2 text-xs text-slate-500">{med.description}</p>}
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  )
}
