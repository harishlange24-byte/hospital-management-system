import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import { clearAuthError, register } from '../../store/slices/authSlice'
import { ROLE_DASHBOARD } from '../../utils/constants'

export default function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  )

  const {
    register: formRegister,
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
      const newUser = await dispatch(register(data)).unwrap()
      toast.success('Account created successfully!')
      navigate(ROLE_DASHBOARD[newUser.role], { replace: true })
    } catch {
      // error handled via redux + toast
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800">Create account</h2>
      <p className="mt-1 text-sm text-slate-500">
        Register as a patient to book appointments
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            type="text"
            {...formRegister('name', { required: 'Name is required' })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            type="email"
            {...formRegister('email', { required: 'Email is required' })}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="you@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Phone <span className="text-slate-400">(optional)</span>
          </label>
          <input
            type="tel"
            {...formRegister('phone')}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            placeholder="+91 9876543210"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            type="password"
            {...formRegister('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 characters' },
            })}
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
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:underline">
          Sign In
        </Link>
      </p>
    </div>
  )
}
