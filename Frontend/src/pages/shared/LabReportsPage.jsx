import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import {
  getLabReports,
  createLabReport,
  deleteLabReport,
} from '../../api/labReports.api'
import { getPatients } from '../../api/patients.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { Input, Select, Textarea, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatDate } from '../../utils/format'
import { ROLES, LAB_STATUSES } from '../../utils/constants'

export default function LabReportsPage({ role }) {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const canCreate = role === ROLES.ADMIN || role === ROLES.DOCTOR
  const canDelete = role === ROLES.ADMIN

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getLabReports({ page, limit })
      setReports(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page])

  const openCreate = async () => {
    if (canCreate) {
      const { data } = await getPatients({ limit: 100 })
      setPatients(data.data || [])
    }
    reset({ patientId: '', testName: '', testType: '', resultSummary: '', reportUrl: '', status: 'pending' })
    setModalOpen(true)
  }

  const onSubmit = async (formData) => {
    try {
      await createLabReport(formData)
      toast.success('Lab report created')
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this lab report?')) return
    try {
      await deleteLabReport(id)
      toast.success('Deleted')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Lab Reports"
        description={role === ROLES.PATIENT ? 'Your lab test results' : 'Manage lab reports'}
        action={canCreate ? <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Report</Button> : null}
      />

      {loading ? <LoadingSpinner /> : reports.length === 0 ? (
        <EmptyState message="No lab reports found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                {role !== ROLES.PATIENT && <th className="px-4 py-3 font-medium text-slate-600">Patient</th>}
                <th className="px-4 py-3 font-medium text-slate-600">Test</th>
                <th className="px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{formatDate(r.reportDate || r.createdAt)}</td>
                  {role !== ROLES.PATIENT && <td className="px-4 py-3">{getUserName(r.patient)}</td>}
                  <td className="px-4 py-3">{r.testName}</td>
                  <td className="px-4 py-3">{r.testType || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {r.reportUrl && (
                        <a href={r.reportUrl} target="_blank" rel="noreferrer" className="text-primary-600 text-xs underline">View</a>
                      )}
                      {canDelete && <button type="button" onClick={() => handleDelete(r._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Lab Report">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Patient" {...register('patientId', { required: 'Required' })} error={errors.patientId?.message}>
            <option value="">Select patient</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{getUserName(p)}</option>)}
          </Select>
          <Input label="Test Name" {...register('testName', { required: 'Required' })} error={errors.testName?.message} />
          <Input label="Test Type" {...register('testType')} />
          <Textarea label="Result Summary" {...register('resultSummary')} />
          <Input label="Report URL" {...register('reportUrl')} />
          <Select label="Status" {...register('status')}>
            {LAB_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Input label="Report Date" type="date" {...register('reportDate')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
