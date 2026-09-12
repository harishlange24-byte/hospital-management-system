import { Outlet, Link } from 'react-router-dom'
import { Activity } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-1/2 bg-gradient-to-br from-primary-700 to-teal-600 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Link to="/" className="flex items-center gap-2 text-white">
          <Activity className="h-8 w-8" />
          <span className="text-2xl font-bold">MediCare HMS</span>
        </Link>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-white">
            Hospital Management
            <br />
            Made Simple
          </h1>
          <p className="mt-4 max-w-md text-primary-100">
            Book appointments, manage prescriptions, track lab reports, and
            handle billing — all in one place.
          </p>
        </div>
        <p className="text-sm text-primary-200">
          &copy; {new Date().getFullYear()} MediCare HMS
        </p>
      </div>

      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <Activity className="h-7 w-7 text-primary-600" />
          <span className="text-xl font-bold text-slate-800">MediCare HMS</span>
        </div>
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
