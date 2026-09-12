import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES } from '../utils/constants'
import ProtectedRoute from './ProtectedRoute'

import HomePage from '../pages/HomePage'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import NotFoundPage from '../pages/NotFoundPage'

import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminDoctorsPage from '../pages/admin/AdminDoctorsPage'
import AdminPatientsPage from '../pages/admin/AdminPatientsPage'
import AdminMedicinesPage from '../pages/admin/AdminMedicinesPage'
import AdminPharmacySalesPage from '../pages/admin/AdminPharmacySalesPage'

import DoctorDashboard from '../pages/doctor/DoctorDashboard'
import DoctorSchedulePage from '../pages/doctor/DoctorSchedulePage'
import DoctorPatientsPage from '../pages/doctor/DoctorPatientsPage'
import DoctorProfilePage from '../pages/doctor/DoctorProfilePage'

import PatientDashboard from '../pages/patient/PatientDashboard'
import PatientProfilePage from '../pages/patient/PatientProfilePage'
import PatientDoctorsPage from '../pages/patient/PatientDoctorsPage'
import PatientBookAppointmentPage from '../pages/patient/PatientBookAppointmentPage'
import PatientPharmacyPage from '../pages/patient/PatientPharmacyPage'

import AppointmentsPage from '../pages/shared/AppointmentsPage'
import PrescriptionsPage from '../pages/shared/PrescriptionsPage'
import LabReportsPage from '../pages/shared/LabReportsPage'
import MedicalHistoryPage from '../pages/shared/MedicalHistoryPage'
import NotificationsPage from '../pages/shared/NotificationsPage'
import InvoicesPage from '../pages/shared/InvoicesPage'
import PaymentsPage from '../pages/shared/PaymentsPage'

import AuthLayout from '../layouts/AuthLayout'
import DashboardLayout from '../layouts/DashboardLayout'

import AIAssistant from "../pages/AIAssistance";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route element={<DashboardLayout role={ROLES.ADMIN} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<AdminDoctorsPage />} />
          <Route path="/admin/patients" element={<AdminPatientsPage />} />
          <Route path="/admin/appointments" element={<AppointmentsPage role={ROLES.ADMIN} />} />
          <Route path="/admin/prescriptions" element={<PrescriptionsPage role={ROLES.ADMIN} />} />
          <Route path="/admin/lab-reports" element={<LabReportsPage role={ROLES.ADMIN} />} />
          <Route path="/admin/medical-history" element={<MedicalHistoryPage role={ROLES.ADMIN} />} />
          <Route path="/admin/medicines" element={<AdminMedicinesPage />} />
          <Route path="/admin/pharmacy-sales" element={<AdminPharmacySalesPage />} />
          <Route path="/admin/invoices" element={<InvoicesPage role={ROLES.ADMIN} />} />
          <Route path="/admin/payments" element={<PaymentsPage role={ROLES.ADMIN} />} />
          <Route path="/admin/notifications" element={<NotificationsPage />} />
          <Route path="/admin/ai-assistant" element={<AIAssistant />} />
        </Route>
      </Route>

      {/* Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR]} />}>
        <Route element={<DashboardLayout role={ROLES.DOCTOR} />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
          <Route path="/doctor/appointments" element={<AppointmentsPage role={ROLES.DOCTOR} />} />
          <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
          <Route path="/doctor/prescriptions" element={<PrescriptionsPage role={ROLES.DOCTOR} />} />
          <Route path="/doctor/lab-reports" element={<LabReportsPage role={ROLES.DOCTOR} />} />
          <Route path="/doctor/medical-history" element={<MedicalHistoryPage role={ROLES.DOCTOR} />} />
          <Route path="/doctor/profile" element={<DoctorProfilePage />} />
          <Route path="/doctor/notifications" element={<NotificationsPage />} />
          <Route path="/doctor/ai-assistant" element={<AIAssistant />} />
        </Route>
      </Route>

      {/* Patient Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.PATIENT]} />}>
        <Route element={<DashboardLayout role={ROLES.PATIENT} />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/profile" element={<PatientProfilePage />} />
          <Route path="/patient/doctors" element={<PatientDoctorsPage />} />
          <Route path="/patient/book-appointment" element={<PatientBookAppointmentPage />} />
          <Route path="/patient/appointments" element={<AppointmentsPage role={ROLES.PATIENT} />} />
          <Route path="/patient/prescriptions" element={<PrescriptionsPage role={ROLES.PATIENT} />} />
          <Route path="/patient/lab-reports" element={<LabReportsPage role={ROLES.PATIENT} />} />
          <Route path="/patient/medical-history" element={<MedicalHistoryPage role={ROLES.PATIENT} />} />
          <Route path="/patient/pharmacy" element={<PatientPharmacyPage />} />
          <Route path="/patient/payments" element={<PaymentsPage role={ROLES.PATIENT} />} />
          <Route path="/patient/invoices" element={<InvoicesPage role={ROLES.PATIENT} />} />
          <Route path="/patient/notifications" element={<NotificationsPage />} />
         <Route path="/patient/ai-assistant" element={<AIAssistant />} />
        </Route>
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
