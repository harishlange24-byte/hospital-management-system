import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Calendar, IndianRupee, Stethoscope, Users, AlertTriangle } from 'lucide-react'
import { getDashboardAnalytics } from '../../api/analytics.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { formatCurrency } from '../../utils/format'

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AdminDashboard() {
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
    { label: 'Total Patients', value: totals.patients ?? 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Doctors', value: totals.doctors ?? 0, icon: Stethoscope, color: 'bg-teal-50 text-teal-600' },
    { label: 'Appointments', value: totals.appointments ?? 0, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
    { label: 'Revenue', value: formatCurrency(totals.revenue), icon: IndianRupee, color: 'bg-amber-50 text-amber-600' },
  ]

  const chartData = (data?.revenueByMonth || []).map((item) => ({
    month: MONTHS[item._id?.month] || '?',
    revenue: item.total,
  }))

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Hospital operations overview" />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-800">{value}</p>
              </div>
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {(totals.lowStockMedicines > 0 || totals.pendingLabReports > 0) && (
        <div className="mb-8 flex flex-wrap gap-4">
          {totals.lowStockMedicines > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-700">
              <AlertTriangle className="h-4 w-4" />
              {totals.lowStockMedicines} medicines low on stock
            </div>
          )}
          {totals.pendingLabReports > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">
              <AlertTriangle className="h-4 w-4" />
              {totals.pendingLabReports} pending lab reports
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">Monthly Revenue</h2>
        {chartData.length > 0 ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-400">No revenue data yet</p>
        )}
      </div>
    </div>
  )
}
