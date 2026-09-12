import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { CreditCard } from 'lucide-react'
import { getPayments, createPaymentOrder, verifyPayment } from '../../api/payments.api'
import { getAppointments } from '../../api/appointments.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { Select, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatCurrency, formatDateTime } from '../../utils/format'
import { openRazorpayCheckout } from '../../utils/razorpay'
import { ROLES } from '../../utils/constants'

export default function PaymentsPage({ role }) {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [payModal, setPayModal] = useState(false)
  const [appointments, setAppointments] = useState([])
  const [selectedApt, setSelectedApt] = useState('')
  const canPay = role === ROLES.PATIENT

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getPayments({ page, limit })
      setPayments(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page])

  const openPayModal = async () => {
    try {
      const { data } = await getAppointments({ limit: 50, status: 'confirmed' })
      setAppointments(data.data || [])
      setSelectedApt('')
      setPayModal(true)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handlePay = async () => {
    if (!selectedApt) return toast.error('Select an appointment')
    try {
      const { data } = await createPaymentOrder({ appointmentId: selectedApt, purpose: 'appointment' })
      await openRazorpayCheckout({
        key: data.key,
        order: data.order,
        onSuccess: async (response) => {
          await verifyPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            paymentId: data.paymentId,
          })
          toast.success('Payment successful!')
          setPayModal(false)
          fetchData()
        },
      })
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Payment history and transactions"
        action={canPay ? <Button onClick={openPayModal}><CreditCard className="h-4 w-4" /> Pay Appointment</Button> : null}
      />

      {loading ? <LoadingSpinner /> : payments.length === 0 ? (
        <EmptyState message="No payments found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                {role === ROLES.ADMIN && <th className="px-4 py-3 font-medium text-slate-600">Patient</th>}
                <th className="px-4 py-3 font-medium text-slate-600">Purpose</th>
                <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{formatDateTime(p.createdAt)}</td>
                  {role === ROLES.ADMIN && <td className="px-4 py-3">{getUserName(p.patient)}</td>}
                  <td className="px-4 py-3 capitalize">{p.purpose}</td>
                  <td className="px-4 py-3">{formatCurrency(p.amount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={payModal} onClose={() => setPayModal(false)} title="Pay for Appointment">
        <div className="space-y-4">
          <Select label="Select Appointment" value={selectedApt} onChange={(e) => setSelectedApt(e.target.value)}>
            <option value="">Choose appointment</option>
            {appointments.map((a) => (
              <option key={a._id} value={a._id}>
                {getUserName(a.doctor)} — {formatDateTime(a.appointmentDate)} — {formatCurrency(a.fee)}
              </option>
            ))}
          </Select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPayModal(false)}>Cancel</Button>
            <Button onClick={handlePay}>Proceed to Pay</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
