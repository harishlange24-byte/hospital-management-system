import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../../api/doctors.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Input, Select, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatCurrency } from '../../utils/format'

export default function AdminDoctorsPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchDoctors = async () => {
    setLoading(true)
    try {
      const { data } = await getDoctors({ page, limit, search: search || undefined })
      setDoctors(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDoctors() }, [page, search])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', email: '', password: '', phone: '', specialization: '', qualification: '', experienceYears: '', consultationFee: '', department: '', bio: '' })
    setModalOpen(true)
  }

  const openEdit = (doc) => {
    setEditing(doc)
    reset({
      name: doc.user?.name || '',
      phone: doc.user?.phone || '',
      specialization: doc.specialization || '',
      qualification: doc.qualification || '',
      experienceYears: doc.experienceYears || '',
      consultationFee: doc.consultationFee || '',
      department: doc.department || '',
      bio: doc.bio || '',
      isAvailable: doc.isAvailable ?? true,
    })
    setModalOpen(true)
  }

  const onSubmit = async (formData) => {
    try {
      if (editing) {
        await updateDoctor(editing._id, formData)
        toast.success('Doctor updated')
      } else {
        await createDoctor(formData)
        toast.success('Doctor created')
      }
      setModalOpen(false)
      fetchDoctors()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this doctor?')) return
    try {
      await deleteDoctor(id)
      toast.success('Doctor deactivated')
      fetchDoctors()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Doctors"
        description="Manage hospital doctors"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Doctor</Button>}
      />

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? <LoadingSpinner /> : doctors.length === 0 ? (
        <EmptyState message="No doctors found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Specialization</th>
                <th className="px-4 py-3 font-medium text-slate-600">Department</th>
                <th className="px-4 py-3 font-medium text-slate-600">Fee</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((doc) => (
                <tr key={doc._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{getUserName(doc)}</td>
                  <td className="px-4 py-3">{doc.specialization}</td>
                  <td className="px-4 py-3">{doc.department || '—'}</td>
                  <td className="px-4 py-3">{formatCurrency(doc.consultationFee)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${doc.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {doc.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(doc)} className="text-primary-600 hover:text-primary-800"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(doc._id)} className="text-red-600 hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Name" {...register('name', { required: !editing && 'Required' })} error={errors.name?.message} />
            {!editing && (
              <>
                <Input label="Email" type="email" {...register('email', { required: 'Required' })} error={errors.email?.message} />
                <Input label="Password" type="password" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} error={errors.password?.message} />
              </>
            )}
            <Input label="Phone" {...register('phone')} />
            <Input label="Specialization" {...register('specialization', { required: 'Required' })} error={errors.specialization?.message} />
            <Input label="Qualification" {...register('qualification')} />
            <Input label="Experience (years)" type="number" {...register('experienceYears')} />
            <Input label="Consultation Fee" type="number" {...register('consultationFee')} />
            <Input label="Department" {...register('department')} />
          </div>
          <Input label="Bio" {...register('bio')} />
          {editing && (
            <Select label="Availability" {...register('isAvailable')}>
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </Select>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
