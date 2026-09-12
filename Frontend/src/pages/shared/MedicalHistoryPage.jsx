import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import {
  getMedicalHistory,
  createMedicalHistory,
  deleteMedicalHistory,
} from '../../api/medicalHistory.api'
import { getPatients } from '../../api/patients.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Input, Select, Textarea, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatDate } from '../../utils/format'
import { ROLES } from '../../utils/constants'

export default function MedicalHistoryPage({ role }) {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const canDelete = role === ROLES.ADMIN || role === ROLES.DOCTOR

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getMedicalHistory({ page, limit })
      setRecords(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page])

  const openCreate = async () => {
    if (role !== ROLES.PATIENT) {
      const { data } = await getPatients({ limit: 100 })
      setPatients(data.data || [])
    }
    reset({ patientId: '', title: '', description: '', condition: '', treatment: '', notes: '' })
    setModalOpen(true)
  }

  const onSubmit = async (formData) => {
    try {
      await createMedicalHistory(formData)
      toast.success('Record added')
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this record?')) return
    try {
      await deleteMedicalHistory(id)
      toast.success('Deleted')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Medical History"
        description="Patient medical records"
        action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Record</Button>}
      />

      {loading ? <LoadingSpinner /> : records.length === 0 ? (
        <EmptyState message="No medical history found" />
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div key={rec._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{rec.title}</h3>
                  {role !== ROLES.PATIENT && (
                    <p className="text-sm text-slate-500">Patient: {getUserName(rec.patient)}</p>
                  )}
                  {rec.condition && <p className="mt-1 text-sm text-slate-600">Condition: {rec.condition}</p>}
                  {rec.description && <p className="mt-2 text-sm text-slate-500">{rec.description}</p>}
                  {rec.treatment && <p className="mt-1 text-sm text-slate-600">Treatment: {rec.treatment}</p>}
                  <p className="mt-2 text-xs text-slate-400">{formatDate(rec.diagnosisDate || rec.createdAt)}</p>
                </div>
                {canDelete && (
                  <button type="button" onClick={() => handleDelete(rec._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            </div>
          ))}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Medical Record">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {role !== ROLES.PATIENT && (
            <Select label="Patient" {...register('patientId')}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{getUserName(p)}</option>)}
            </Select>
          )}
          <Input label="Title" {...register('title', { required: 'Required' })} error={errors.title?.message} />
          <Input label="Condition" {...register('condition')} />
          <Textarea label="Description" {...register('description')} />
          <Textarea label="Treatment" {...register('treatment')} />
          <Textarea label="Notes" {...register('notes')} />
          <Input label="Diagnosis Date" type="date" {...register('diagnosisDate')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
