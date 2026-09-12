import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { getMyPatient, updateMyPatient } from '../../api/patients.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Input, Select, Textarea, Button } from '../../components/ui/FormField'
import { BLOOD_GROUPS, GENDERS } from '../../utils/constants'
import { toInputDate } from '../../utils/format'

export default function PatientProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getMyPatient()
      .then(({ data }) => {
        const p = data.patient
        reset({
          name: p.user?.name || '',
          phone: p.user?.phone || '',
          dateOfBirth: toInputDate(p.dateOfBirth),
          gender: p.gender || '',
          bloodGroup: p.bloodGroup || '',
          address: p.address || '',
          emergencyContactName: p.emergencyContact?.name || '',
          emergencyContactPhone: p.emergencyContact?.phone || '',
          emergencyContactRelation: p.emergencyContact?.relation || '',
          allergies: p.allergies?.join(', ') || '',
          chronicDiseases: p.chronicDiseases?.join(', ') || '',
        })
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false))
  }, [reset])

  const onSubmit = async (formData) => {
    setSaving(true)
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        gender: formData.gender || undefined,
        bloodGroup: formData.bloodGroup || undefined,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyContactName,
          phone: formData.emergencyContactPhone,
          relation: formData.emergencyContactRelation,
        },
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean) : [],
      }
      await updateMyPatient(payload)
      toast.success('Profile updated successfully')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <PageHeader title="My Profile" description="Complete your profile to book appointments" />

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
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
        </div>
        <Textarea label="Address" {...register('address')} />

        <div>
          <p className="mb-3 text-sm font-medium text-slate-700">Emergency Contact</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Name" {...register('emergencyContactName')} />
            <Input label="Phone" {...register('emergencyContactPhone')} />
            <Input label="Relation" {...register('emergencyContactRelation')} />
          </div>
        </div>

        <Input label="Allergies (comma separated)" {...register('allergies')} />
        <Input label="Chronic Diseases (comma separated)" {...register('chronicDiseases')} />

        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</Button>
      </form>
    </div>
  )
}
