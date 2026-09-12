import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">Page not found</h1>
      <p className="mt-2 text-slate-500">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="mt-8 flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700"
      >
        <Home className="h-4 w-4" />
        Back to Home
      </Link>
    </div>
  )
}
