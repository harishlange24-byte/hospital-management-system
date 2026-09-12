import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { Activity, LogOut, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { logout } from '../store/slices/authSlice'
import { ROLES } from '../utils/constants'
import { NAV_ITEMS } from '../utils/navigation'

const roleLabels = {
  [ROLES.ADMIN]: 'Admin',
  [ROLES.DOCTOR]: 'Doctor',
  [ROLES.PATIENT]: 'Patient',
}

export default function DashboardLayout({ role }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const items = NAV_ITEMS[role] || []
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch {
      toast.error('Logout failed')
    }
  }

  const NavLinks = ({ onClick }) =>
    items.map(({ label, path, icon: Icon }) => {
      const active = location.pathname === path
      return (
        <Link
          key={path}
          to={path}
          onClick={onClick}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
            active
              ? 'bg-primary-50 text-primary-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-primary-700'
          }`}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      )
    })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-5">
          <Activity className="h-7 w-7 text-primary-600" />
          <span className="text-lg font-bold text-slate-800">MediCare HMS</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLinks />
        </nav>
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500">{roleLabels[role]}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-4 py-4">
              <span className="font-bold text-slate-800">MediCare HMS</span>
              <button type="button" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              <NavLinks onClick={() => setMobileOpen(false)} />
            </nav>
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary-600" />
            <span className="font-bold text-slate-800">MediCare HMS</span>
          </div>
          <button type="button" onClick={handleLogout} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
            <LogOut className="h-5 w-5" />
          </button>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
