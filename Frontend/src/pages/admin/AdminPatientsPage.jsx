import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { getPatients, createPatient, deletePatient } from '../../api/patients.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Input, Select, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatDate } from '../../utils/format'
import { BLOOD_GROUPS, GENDERS } from '../../utils/constants'

export default function AdminPatientsPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const { data } = await getPatients({ page, limit, search: search || undefined })
      setPatients(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchPatients() }, [page, search])

  const onSubmit = async (formData) => {
    try {
      await createPatient(formData)
      toast.success('Patient created')
      setModalOpen(false)
      reset()
      fetchPatients()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this patient?')) return
    try {
      await deletePatient(id)
      toast.success('Patient deactivated')
      fetchPatients()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Patients"
        description="Manage patient records"
        action={<Button onClick={() => { reset(); setModalOpen(true) }}><Plus className="h-4 w-4" /> Add Patient</Button>}
      />

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
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
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
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleDelete(p._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Patient" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
            <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
            <Input label="Password" type="password" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} error={errors.password?.message} />
            <Input label="Phone" {...register('phone')} />
            <Input label="Date of Birth" type="date" {...register('dateOfBirth')} />
            <Select label="Gender" {...register('gender')}>
              <option value="">Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </Select>
            <Select label="Blood Group" {...register('bloodGroup')}>
              <option value="">Select</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </Select>
            <Input label="Address" {...register('address')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
