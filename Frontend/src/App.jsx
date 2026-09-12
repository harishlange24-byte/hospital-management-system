import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCurrentUser } from './store/slices/authSlice'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  const dispatch = useDispatch()
  const { initializing } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(fetchCurrentUser())
  }, [dispatch])

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-sm text-slate-500">Loading MediCare HMS...</p>
        </div>
      </div>
    )
  }

  return <AppRoutes />
}
