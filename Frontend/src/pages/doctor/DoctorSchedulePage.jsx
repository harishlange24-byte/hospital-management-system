import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { getSchedules, createSchedule, deleteSchedule } from '../../api/schedules.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { Input, Button } from '../../components/ui/FormField'
import { formatDate } from '../../utils/format'

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [slots, setSlots] = useState([{ startTime: '09:00', endTime: '09:30' }])
  const { register, handleSubmit, reset } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getSchedules({ limit: 30 })
      setSchedules(data.data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const onSubmit = async (formData) => {
    try {
      await createSchedule({ date: formData.date, slots, isHoliday: formData.isHoliday === 'true', notes: formData.notes })
      toast.success('Schedule saved')
      setModalOpen(false)
      reset()
      setSlots([{ startTime: '09:00', endTime: '09:30' }])
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this schedule?')) return
    try {
      await deleteSchedule(id)
      toast.success('Schedule deleted')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader title="My Schedule" description="Manage your availability and time slots" action={<Button onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Add Schedule</Button>} />

      {loading ? <LoadingSpinner /> : schedules.length === 0 ? (
        <EmptyState message="No schedules yet. Add your first schedule." />
      ) : (
        <div className="space-y-4">
          {schedules.map((sch) => (
            <div key={sch._id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">{formatDate(sch.date)}</h3>
                  {sch.isHoliday && <span className="text-sm text-red-600">Holiday</span>}
                  {sch.notes && <p className="text-sm text-slate-500">{sch.notes}</p>}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {sch.slots?.map((slot) => (
                      <span key={slot._id} className={`rounded-lg px-3 py-1 text-xs ${slot.isBooked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                        {slot.startTime}-{slot.endTime} {slot.isBooked ? '(Booked)' : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => handleDelete(sch._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Schedule" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Date" type="date" min={new Date().toISOString().split('T')[0]} {...register('date', { required: true })} />
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Time Slots</p>
            {slots.map((slot, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <Input type="time" value={slot.startTime} onChange={(e) => { const n = [...slots]; n[idx].startTime = e.target.value; setSlots(n) }} />
                <Input type="time" value={slot.endTime} onChange={(e) => { const n = [...slots]; n[idx].endTime = e.target.value; setSlots(n) }} />
                {slots.length > 1 && <button type="button" onClick={() => setSlots(slots.filter((_, i) => i !== idx))} className="text-red-600"><Trash2 className="h-4 w-4" /></button>}
              </div>
            ))}
            <Button variant="secondary" size="sm" onClick={() => setSlots([...slots, { startTime: '10:00', endTime: '10:30' }])}>+ Add Slot</Button>
          </div>
          <Input label="Notes" {...register('notes')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Schedule</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
