import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Activity,
  Calendar,
  FileText,
  Shield,
  Stethoscope,
  Users,
} from 'lucide-react'
import { ROLE_DASHBOARD } from '../utils/constants'

const features = [
  {
    icon: Calendar,
    title: 'Appointments',
    desc: 'Book and manage doctor visits with ease',
  },
  {
    icon: FileText,
    title: 'Prescriptions',
    desc: 'Digital prescriptions and medical records',
  },
  {
    icon: Stethoscope,
    title: 'Lab Reports',
    desc: 'Track and download lab test results',
  },
  {
    icon: Shield,
    title: 'Secure Billing',
    desc: 'Invoices, payments, and pharmacy sales',
  },
]

export default function HomePage() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dashboardPath = user ? ROLE_DASHBOARD[user.role] : null

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Activity className="h-7 w-7 text-primary-600" />
            <span className="text-xl font-bold text-slate-800">MediCare HMS</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100">
          <Users className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Complete Hospital
          <span className="text-primary-600"> Management System</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Streamline healthcare operations for admins, doctors, and patients.
          Appointments, prescriptions, lab reports, pharmacy, and analytics —
          all connected.
        </p>
        {!isAuthenticated && (
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-primary-600 px-8 py-3 font-medium text-white transition hover:bg-primary-700"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-slate-300 px-8 py-3 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Sign In
            </Link>
          </div>
        )}
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50">
                <Icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-slate-800">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        &copy; {new Date().getFullYear()} MediCare HMS. All rights reserved.
      </footer>
    </div>
  )
}
