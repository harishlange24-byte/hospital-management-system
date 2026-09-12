import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Calendar, Stethoscope } from 'lucide-react'
import { getDoctors } from '../../api/doctors.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatCurrency } from '../../utils/format'
import { Button } from '../../components/ui/FormField'

export default function PatientDoctorsPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [specialization, setSpecialization] = useState('')

  useEffect(() => {
    setLoading(true)
    getDoctors({ page, limit, search: search || undefined, specialization: specialization || undefined, isAvailable: 'true' })
      .then(({ data }) => {
        setDoctors(data.data || [])
        setPagination(data.pagination)
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [page, search, specialization])

  return (
    <div>
      <PageHeader title="Find Doctors" description="Browse available doctors and book appointments" />

      <div className="mb-6 flex flex-wrap gap-4">
        <input type="search" placeholder="Search doctors..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input type="text" placeholder="Specialization..." value={specialization} onChange={(e) => { setSpecialization(e.target.value); setPage(1) }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {loading ? <LoadingSpinner /> : doctors.length === 0 ? (
        <EmptyState message="No doctors available" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doc) => (
            <div key={doc._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-teal-50">
                <Stethoscope className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-slate-800">{getUserName(doc)}</h3>
              <p className="text-sm text-primary-600">{doc.specialization}</p>
              {doc.department && <p className="text-xs text-slate-500">{doc.department}</p>}
              {doc.experienceYears && <p className="mt-1 text-xs text-slate-500">{doc.experienceYears} years experience</p>}
              <p className="mt-2 font-medium text-slate-800">{formatCurrency(doc.consultationFee)}</p>
              <Link to={`/patient/book-appointment?doctorId=${doc._id}`} className="mt-4 block">
                <Button className="w-full"><Calendar className="h-4 w-4" /> Book Appointment</Button>
              </Link>
            </div>
          ))}
        </div>
      )}
      <Pagination pagination={pagination} onPageChange={setPage} />
    </div>
  )
}
