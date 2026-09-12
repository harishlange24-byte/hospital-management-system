import { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Download, Trash2 } from 'lucide-react'
import {
  getPrescriptions,
  createPrescription,
  deletePrescription,
} from '../../api/prescriptions.api'
import { getPatients } from '../../api/patients.api'
import { getAppointments as getAppts } from '../../api/appointments.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Input, Select, Textarea, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatDate } from '../../utils/format'
import { generatePrescriptionPDF, downloadPDF } from '../../utils/pdf'
import { ROLES } from '../../utils/constants'

export default function PrescriptionsPage({ role }) {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [prescriptions, setPrescriptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const canCreate = role === ROLES.ADMIN || role === ROLES.DOCTOR
  const canDelete = canCreate

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: { medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'medicines' })

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getPrescriptions({ page, limit })
      setPrescriptions(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page])

  const openCreate = async () => {
    try {
      if (canCreate) {
        const [patRes, aptRes] = await Promise.all([
          getPatients({ limit: 100 }),
          getAppts({ limit: 100, status: 'completed' }),
        ])
        setPatients(patRes.data.data || [])
        setAppointments(aptRes.data.data || [])
      }
      reset({ patientId: '', appointmentId: '', diagnosis: '', advice: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] })
      setModalOpen(true)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const onSubmit = async (formData) => {
    try {
      await createPrescription(formData)
      toast.success('Prescription created')
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDownload = (rx) => {
    const doc = generatePrescriptionPDF({
      patientName: getUserName(rx.patient),
      doctorName: getUserName(rx.doctor),
      diagnosis: rx.diagnosis,
      medicines: rx.medicines,
      advice: rx.advice,
      date: rx.createdAt,
    })
    downloadPDF(doc, `prescription-${rx._id}.pdf`)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this prescription?')) return
    try {
      await deletePrescription(id)
      toast.success('Deleted')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Prescriptions"
        description={role === ROLES.PATIENT ? 'Your prescriptions' : 'Manage prescriptions'}
        action={canCreate ? <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Prescription</Button> : null}
      />

      {loading ? <LoadingSpinner /> : prescriptions.length === 0 ? (
        <EmptyState message="No prescriptions found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                {role !== ROLES.PATIENT && <th className="px-4 py-3 font-medium text-slate-600">Patient</th>}
                {role !== ROLES.DOCTOR && <th className="px-4 py-3 font-medium text-slate-600">Doctor</th>}
                <th className="px-4 py-3 font-medium text-slate-600">Diagnosis</th>
                <th className="px-4 py-3 font-medium text-slate-600">Medicines</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx) => (
                <tr key={rx._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{formatDate(rx.createdAt)}</td>
                  {role !== ROLES.PATIENT && <td className="px-4 py-3">{getUserName(rx.patient)}</td>}
                  {role !== ROLES.DOCTOR && <td className="px-4 py-3">{getUserName(rx.doctor)}</td>}
                  <td className="px-4 py-3">{rx.diagnosis || '—'}</td>
                  <td className="px-4 py-3">{rx.medicines?.length || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleDownload(rx)} className="text-primary-600"><Download className="h-4 w-4" /></button>
                      {canDelete && <button type="button" onClick={() => handleDelete(rx._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Prescription" size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Patient" {...register('patientId')}>
              <option value="">Select patient</option>
              {patients.map((p) => <option key={p._id} value={p._id}>{getUserName(p)}</option>)}
            </Select>
            <Select label="Appointment (optional)" {...register('appointmentId')}>
              <option value="">None</option>
              {appointments.map((a) => <option key={a._id} value={a._id}>{getUserName(a.patient)} — {formatDate(a.appointmentDate)}</option>)}
            </Select>
          </div>
          <Input label="Diagnosis" {...register('diagnosis')} />
          <Textarea label="Advice" {...register('advice')} />
          <Input label="Follow-up Date" type="date" {...register('followUpDate')} />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Medicines</p>
            {fields.map((field, idx) => (
              <div key={field.id} className="mb-3 grid gap-2 sm:grid-cols-4">
                <Input placeholder="Name" {...register(`medicines.${idx}.name`, { required: 'Required' })} />
                <Input placeholder="Dosage" {...register(`medicines.${idx}.dosage`)} />
                <Input placeholder="Frequency" {...register(`medicines.${idx}.frequency`)} />
                <div className="flex gap-2">
                  <Input placeholder="Duration" {...register(`medicines.${idx}.duration`)} />
                  {fields.length > 1 && <button type="button" onClick={() => remove(idx)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}
                </div>
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => append({ name: '', dosage: '', frequency: '', duration: '' })}>+ Add Medicine</Button>
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
