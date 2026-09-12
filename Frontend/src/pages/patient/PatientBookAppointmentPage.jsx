import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getDoctors } from '../../api/doctors.api'
import { getSlots } from '../../api/schedules.api'
import { createAppointment } from '../../api/appointments.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Input, Select, Textarea, Button } from '../../components/ui/FormField'
import { getUserName, formatCurrency } from '../../utils/format'

export default function PatientBookAppointmentPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])
  const [scheduleId, setScheduleId] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { doctorId: searchParams.get('doctorId') || '', date: '', slotId: '', reason: '' },
  })

  const doctorId = watch('doctorId')
  const date = watch('date')

  useEffect(() => {
    getDoctors({ limit: 100, isAvailable: 'true' })
      .then(({ data }) => setDoctors(data.data || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([])
      setScheduleId('')
      return
    }
    setLoadingSlots(true)
    getSlots({ doctorId, date })
      .then(({ data }) => {
        setSlots(data.slots?.filter((s) => !s.isBooked) || [])
        setScheduleId(data.scheduleId || '')
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoadingSlots(false))
  }, [doctorId, date])

  const onSubmit = async (formData) => {
    setSubmitting(true)
    try {
      const selectedSlot = slots.find((s) => s._id === formData.slotId)
      const payload = {
        doctorId: formData.doctorId,
        reason: formData.reason,
        scheduleId: scheduleId || undefined,
        slotId: formData.slotId || undefined,
        appointmentDate: formData.date,
        startTime: selectedSlot?.startTime,
        endTime: selectedSlot?.endTime,
      }
      await createAppointment(payload)
      toast.success('Appointment booked successfully!')
      navigate('/patient/appointments')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner />

  const selectedDoctor = doctors.find((d) => d._id === doctorId)

  return (
    <div>
      <PageHeader title="Book Appointment" description="Select a doctor, date, and time slot" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Select label="Doctor" {...register('doctorId', { required: 'Required' })} error={errors.doctorId?.message}>
          <option value="">Select doctor</option>
          {doctors.map((d) => (
            <option key={d._id} value={d._id}>
              {getUserName(d)} — {d.specialization} ({formatCurrency(d.consultationFee)})
            </option>
          ))}
        </Select>

        {selectedDoctor && (
          <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
            Fee: {formatCurrency(selectedDoctor.consultationFee)} | Dept: {selectedDoctor.department || 'General'}
          </div>
        )}

        <Input label="Date" type="date" min={new Date().toISOString().split('T')[0]} {...register('date', { required: 'Required' })} error={errors.date?.message} />

        {loadingSlots ? (
          <LoadingSpinner className="h-6 w-6" />
        ) : date && doctorId ? (
          slots.length > 0 ? (
            <Select label="Time Slot" {...register('slotId', { required: 'Select a slot' })} error={errors.slotId?.message}>
              <option value="">Select slot</option>
              {slots.map((s) => (
                <option key={s._id} value={s._id}>{s.startTime} - {s.endTime}</option>
              ))}
            </Select>
          ) : (
            <p className="text-sm text-amber-600">No available slots for this date. Try another date.</p>
          )
        ) : null}

        <Textarea label="Reason for Visit" {...register('reason')} />

        <Button type="submit" disabled={submitting || (date && slots.length === 0)}>
          {submitting ? 'Booking...' : 'Book Appointment'}
        </Button>
      </form>
    </div>
  )
}
