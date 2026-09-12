import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, FileText, FlaskConical, CreditCard } from 'lucide-react'
import { getDashboardAnalytics } from '../../api/analytics.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const quickLinks = [
  { title: 'Book Appointment', path: '/patient/book-appointment', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
  { title: 'Prescriptions', path: '/patient/prescriptions', icon: FileText, color: 'bg-purple-50 text-purple-600' },
  { title: 'Lab Reports', path: '/patient/lab-reports', icon: FlaskConical, color: 'bg-teal-50 text-teal-600' },
  { title: 'Payments', path: '/patient/payments', icon: CreditCard, color: 'bg-amber-50 text-amber-600' },
]

export default function PatientDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardAnalytics()
      .then(({ data: res }) => setData(res.analytics))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const totals = data?.totals || {}

  return (
    <div>
      <PageHeader title="Patient Dashboard" description="Manage your health records" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Appointments', value: totals.appointments ?? 0 },
          { label: 'Upcoming', value: totals.upcomingAppointments ?? 0 },
          { label: 'Payments', value: totals.payments ?? 0 },
          { label: 'Lab Reports', value: totals.labReports ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quickLinks.map(({ title, path, icon: Icon, color }) => (
          <Link
            key={title}
            to={path}
            className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-primary-200 hover:shadow-md"
          >
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
