import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getPatients } from '../../api/patients.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatDate } from '../../utils/format'

export default function DoctorPatientsPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    getPatients({ page, limit, search: search || undefined })
      .then(({ data }) => {
        setPatients(data.data || [])
        setPagination(data.pagination)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [page, search])

  return (
    <div>
      <PageHeader title="Patients" description="View patient records" />

      <div className="mb-4">
        <input type="search" placeholder="Search patients..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {loading ? <LoadingSpinner /> : patients.length === 0 ? (
        <EmptyState message="No patients found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Email</th>
                <th className="px-4 py-3 font-medium text-slate-600">Phone</th>
                <th className="px-4 py-3 font-medium text-slate-600">Gender</th>
                <th className="px-4 py-3 font-medium text-slate-600">Blood Group</th>
                <th className="px-4 py-3 font-medium text-slate-600">DOB</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{getUserName(p)}</td>
                  <td className="px-4 py-3">{p.user?.email || '—'}</td>
                  <td className="px-4 py-3">{p.user?.phone || '—'}</td>
                  <td className="px-4 py-3 capitalize">{p.gender || '—'}</td>
                  <td className="px-4 py-3">{p.bloodGroup || '—'}</td>
                  <td className="px-4 py-3">{formatDate(p.dateOfBirth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}
    </div>
  )
}
