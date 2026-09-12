import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import {
  getAppointments,
  updateAppointmentStatus,
  cancelAppointment,
} from '../../api/appointments.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { Select, Textarea, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatDate } from '../../utils/format'
import { ROLES, APPOINTMENT_STATUSES } from '../../utils/constants'

export default function AppointmentsPage({ role }) {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [actionModal, setActionModal] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [notes, setNotes] = useState('')
  const [cancelReason, setCancelReason] = useState('')

  const canManageStatus = role === ROLES.ADMIN || role === ROLES.DOCTOR
  const canCancel = true

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getAppointments({ page, limit, status: statusFilter || undefined })
      setAppointments(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, statusFilter])

  const handleStatusUpdate = async () => {
    try {
      await updateAppointmentStatus(actionModal._id, { status: newStatus, notes })
      toast.success('Status updated')
      setActionModal(null)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleCancel = async () => {
    try {
      await cancelAppointment(actionModal._id, { cancellationReason: cancelReason })
      toast.success('Appointment cancelled')
      setActionModal(null)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const titles = {
    [ROLES.ADMIN]: { title: 'Appointments', desc: 'All hospital appointments' },
    [ROLES.DOCTOR]: { title: 'My Appointments', desc: 'Manage your patient appointments' },
    [ROLES.PATIENT]: { title: 'My Appointments', desc: 'View and manage your appointments' },
  }

  const { title, desc } = titles[role] || titles[ROLES.PATIENT]

  return (
    <div>
      <PageHeader title={title} description={desc} />

      <div className="mb-4 flex gap-4">
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="w-48">
          <option value="">All Statuses</option>
          {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
      </div>

      {loading ? <LoadingSpinner /> : appointments.length === 0 ? (
        <EmptyState message="No appointments found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 font-medium text-slate-600">Time</th>
                {role !== ROLES.PATIENT && <th className="px-4 py-3 font-medium text-slate-600">Patient</th>}
                {role !== ROLES.DOCTOR && <th className="px-4 py-3 font-medium text-slate-600">Doctor</th>}
                <th className="px-4 py-3 font-medium text-slate-600">Reason</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{formatDate(apt.appointmentDate)}</td>
                  <td className="px-4 py-3">{apt.startTime} - {apt.endTime}</td>
                  {role !== ROLES.PATIENT && <td className="px-4 py-3">{getUserName(apt.patient)}</td>}
                  {role !== ROLES.DOCTOR && <td className="px-4 py-3">{getUserName(apt.doctor)}</td>}
                  <td className="px-4 py-3 max-w-[150px] truncate">{apt.reason || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={apt.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {canManageStatus && !['cancelled', 'completed'].includes(apt.status) && (
                        <Button size="sm" variant="secondary" onClick={() => { setActionModal({ ...apt, action: 'status' }); setNewStatus(apt.status) }}>Update</Button>
                      )}
                      {canCancel && !['cancelled', 'completed'].includes(apt.status) && (
                        <Button size="sm" variant="danger" onClick={() => { setActionModal({ ...apt, action: 'cancel' }); setCancelReason('') }}>Cancel</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={!!actionModal} onClose={() => setActionModal(null)} title={actionModal?.action === 'status' ? 'Update Status' : 'Cancel Appointment'}>
        {actionModal?.action === 'status' ? (
          <div className="space-y-4">
            <Select label="Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
              {APPOINTMENT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Textarea label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setActionModal(null)}>Close</Button>
              <Button onClick={handleStatusUpdate}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Textarea label="Cancellation Reason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setActionModal(null)}>Close</Button>
              <Button variant="danger" onClick={handleCancel}>Confirm Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
