import { useEffect, useState } from 'react'
import { Calendar, ClipboardList, Users } from 'lucide-react'
import { getDashboardAnalytics } from '../../api/analytics.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DoctorDashboard() {
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
  const stats = [
    { label: "Today's Appointments", value: totals.todayAppointments ?? 0, icon: Calendar },
    { label: 'Pending', value: totals.pendingAppointments ?? 0, icon: ClipboardList },
    { label: 'Total Patients', value: totals.completedAppointments ?? 0, icon: Users },
  ]

  return (
    <div>
      <PageHeader title="Doctor Dashboard" description="Your practice at a glance" />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-teal-50 p-3 text-teal-600">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
