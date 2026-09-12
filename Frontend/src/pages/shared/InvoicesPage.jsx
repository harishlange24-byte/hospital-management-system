import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Download } from 'lucide-react'
import { getInvoices, createInvoice, updateInvoiceStatus } from '../../api/invoices.api'
import { getPatients } from '../../api/patients.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { Input, Select, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatCurrency, formatDate } from '../../utils/format'
import { generateInvoicePDF, downloadPDF } from '../../utils/pdf'
import { ROLES, INVOICE_STATUSES } from '../../utils/constants'

export default function InvoicesPage({ role }) {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [patients, setPatients] = useState([])
  const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }])
  const canCreate = role === ROLES.ADMIN
  const { register, handleSubmit, reset } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getInvoices({ page, limit })
      setInvoices(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page])

  const openCreate = async () => {
    const { data } = await getPatients({ limit: 100 })
    setPatients(data.data || [])
    setItems([{ description: '', quantity: 1, unitPrice: 0 }])
    reset({ patientId: '', tax: 0, notes: '' })
    setModalOpen(true)
  }

  const onSubmit = async (formData) => {
    try {
      await createInvoice({ ...formData, tax: Number(formData.tax), items: items.map((i) => ({ ...i, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice), total: Number(i.quantity) * Number(i.unitPrice) })) })
      toast.success('Invoice created')
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDownload = (inv) => {
    const doc = generateInvoicePDF({
      invoiceNumber: inv.invoiceNumber,
      patientName: getUserName(inv.patient),
      items: inv.items,
      subtotal: inv.subtotal,
      tax: inv.tax,
      totalAmount: inv.totalAmount,
      date: inv.issuedAt,
    })
    downloadPDF(doc, `invoice-${inv.invoiceNumber}.pdf`)
  }

  const handleStatusChange = async (id, status) => {
    try {
      await updateInvoiceStatus(id, { status })
      toast.success('Status updated')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader title="Invoices" description="Billing and invoices" action={canCreate ? <Button onClick={openCreate}><Plus className="h-4 w-4" /> New Invoice</Button> : null} />

      {loading ? <LoadingSpinner /> : invoices.length === 0 ? (
        <EmptyState message="No invoices found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Invoice #</th>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                {role !== ROLES.PATIENT && <th className="px-4 py-3 font-medium text-slate-600">Patient</th>}
                <th className="px-4 py-3 font-medium text-slate-600">Amount</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv._id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3">{formatDate(inv.issuedAt)}</td>
                  {role !== ROLES.PATIENT && <td className="px-4 py-3">{getUserName(inv.patient)}</td>}
                  <td className="px-4 py-3">{formatCurrency(inv.totalAmount)}</td>
                  <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 items-center">
                      <button type="button" onClick={() => handleDownload(inv)} className="text-primary-600"><Download className="h-4 w-4" /></button>
                      {canCreate && (
                        <Select value={inv.status} onChange={(e) => handleStatusChange(inv._id, e.target.value)} className="w-28 text-xs py-1">
                          {INVOICE_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </Select>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Invoice" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select label="Patient" {...register('patientId', { required: true })}>
            <option value="">Select patient</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{getUserName(p)}</option>)}
          </Select>
          {items.map((item, idx) => (
            <div key={idx} className="grid gap-2 sm:grid-cols-3">
              <Input placeholder="Description" value={item.description} onChange={(e) => { const n = [...items]; n[idx].description = e.target.value; setItems(n) }} />
              <Input type="number" placeholder="Qty" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = e.target.value; setItems(n) }} />
              <Input type="number" placeholder="Unit Price" value={item.unitPrice} onChange={(e) => { const n = [...items]; n[idx].unitPrice = e.target.value; setItems(n) }} />
            </div>
          ))}
          <Button variant="secondary" size="sm" onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0 }])}>+ Add Item</Button>
          <Input label="Tax" type="number" {...register('tax')} />
          <Input label="Notes" {...register('notes')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
