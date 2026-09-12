import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { clearAuthError, login } from '../../store/slices/authSlice'
import { ROLE_DASHBOARD } from '../../utils/constants'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(ROLE_DASHBOARD[user.role], { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearAuthError())
    }
  }, [error, dispatch])

  const onSubmit = async (data) => {
    try {
      const loggedInUser = await dispatch(login(data)).unwrap()
      toast.success('Welcome back!')
      navigate(ROLE_DASHBOARD[loggedInUser.role], { replace: true })
    } catch {
      // error handled via redux + toast
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
      <p className="mt-1 text-sm text-slate-500">
        Sign in to your account to continue
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-500">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:underline">
          Register
        </Link>
      </p>
    </div>
  )
}
