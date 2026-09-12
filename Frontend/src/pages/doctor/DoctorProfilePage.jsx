import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getMyDoctor, updateDoctor } from '../../api/doctors.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Input, Textarea, Button } from '../../components/ui/FormField'
import { DAYS } from '../../utils/constants'

export default function DoctorProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [doctorId, setDoctorId] = useState(null)
  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    getMyDoctor()
      .then(({ data }) => {
        const doc = data.doctor
        setDoctorId(doc._id)
        reset({
          name: doc.user?.name || '',
          phone: doc.user?.phone || '',
          specialization: doc.specialization || '',
          qualification: doc.qualification || '',
          experienceYears: doc.experienceYears || '',
          consultationFee: doc.consultationFee || '',
          department: doc.department || '',
          bio: doc.bio || '',
          availableDays: doc.availableDays || [],
        })
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (formData) => {
    setSaving(true)
    try {
      const availableDays = DAYS.filter((d) => formData[`day_${d}`])
      await updateDoctor(doctorId, { ...formData, availableDays, experienceYears: Number(formData.experienceYears), consultationFee: Number(formData.consultationFee) })
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="My Profile" description="Update your professional information" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Name" {...register('name')} />
          <Input label="Phone" {...register('phone')} />
          <Input label="Specialization" {...register('specialization')} />
          <Input label="Qualification" {...register('qualification')} />
          <Input label="Experience (years)" type="number" {...register('experienceYears')} />
          <Input label="Consultation Fee" type="number" {...register('consultationFee')} />
          <Input label="Department" {...register('department')} />
        </div>
        <Textarea label="Bio" {...register('bio')} />
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Available Days</p>
          <div className="flex flex-wrap gap-3">
            {DAYS.map((day) => (
              <label key={day} className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...register(`day_${day}`)} className="rounded" />
                {day}
              </label>
            ))}
          </div>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
      </form>
    </div>
  )
}
