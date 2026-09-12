export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
}

export const ROLE_DASHBOARD = {
  [ROLES.ADMIN]: '/admin/dashboard',
  [ROLES.DOCTOR]: '/doctor/dashboard',
  [ROLES.PATIENT]: '/patient/dashboard',
}

export const APPOINTMENT_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no-show',
]

export const LAB_STATUSES = ['pending', 'completed', 'cancelled']

export const INVOICE_STATUSES = ['draft', 'issued', 'paid', 'cancelled']

export const PAYMENT_STATUSES = ['created', 'paid', 'failed', 'refunded']

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export const GENDERS = ['male', 'female', 'other']

export const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  'no-show': 'bg-slate-100 text-slate-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  created: 'bg-blue-100 text-blue-700',
  refunded: 'bg-purple-100 text-purple-700',
  draft: 'bg-slate-100 text-slate-700',
  issued: 'bg-blue-100 text-blue-700',
}
