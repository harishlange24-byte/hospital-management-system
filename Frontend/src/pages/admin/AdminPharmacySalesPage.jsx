import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2 } from 'lucide-react'
import { getPharmacySales, createPharmacySale, getMedicines } from '../../api/pharmacy.api'
import { getPatients } from '../../api/patients.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Input, Select, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { getUserName, formatCurrency, formatDateTime } from '../../utils/format'

export default function AdminPharmacySalesPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [sales, setSales] = useState([])
  const [medicines, setMedicines] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [items, setItems] = useState([{ medicineId: '', quantity: 1 }])

  const fetchSales = async () => {
    setLoading(true)
    try {
      const { data } = await getPharmacySales({ page, limit })
      setSales(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSales() }, [page])

  const openCreate = async () => {
    try {
      const [medRes, patRes] = await Promise.all([
        getMedicines({ limit: 100, isActive: 'true' }),
        getPatients({ limit: 100 }),
      ])
      setMedicines(medRes.data.data || [])
      setPatients(patRes.data.data || [])
      setPatientId('')
      setItems([{ medicineId: '', quantity: 1 }])
      setModalOpen(true)
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await createPharmacySale({
        patientId: patientId || undefined,
        items: items.filter((i) => i.medicineId).map((i) => ({ medicineId: i.medicineId, quantity: Number(i.quantity) })),
      })
      toast.success('Sale recorded')
      setModalOpen(false)
      fetchSales()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader title="Pharmacy Sales" description="Record medicine sales" action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> New Sale</Button>} />

      {loading ? <LoadingSpinner /> : sales.length === 0 ? (
        <EmptyState message="No sales recorded" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="px-4 py-3 font-medium text-slate-600">Patient</th>
                <th className="px-4 py-3 font-medium text-slate-600">Items</th>
                <th className="px-4 py-3 font-medium text-slate-600">Total</th>
                <th className="px-4 py-3 font-medium text-slate-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{formatDateTime(sale.createdAt)}</td>
                  <td className="px-4 py-3">{getUserName(sale.patient) || 'Walk-in'}</td>
                  <td className="px-4 py-3">{sale.items?.length || 0}</td>
                  <td className="px-4 py-3">{formatCurrency(sale.totalAmount)}</td>
                  <td className="px-4 py-3 capitalize">{sale.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Pharmacy Sale" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select label="Patient (optional)" value={patientId} onChange={(e) => setPatientId(e.target.value)}>
            <option value="">Walk-in</option>
            {patients.map((p) => <option key={p._id} value={p._id}>{getUserName(p)}</option>)}
          </Select>
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-2 items-end">
              <Select label={idx === 0 ? 'Medicine' : ''} value={item.medicineId} onChange={(e) => {
                const next = [...items]; next[idx].medicineId = e.target.value; setItems(next)
              }} className="flex-1">
                <option value="">Select medicine</option>
                {medicines.map((m) => <option key={m._id} value={m._id}>{m.name} (Stock: {m.stock})</option>)}
              </Select>
              <Input label={idx === 0 ? 'Qty' : ''} type="number" min="1" value={item.quantity} onChange={(e) => {
                const next = [...items]; next[idx].quantity = e.target.value; setItems(next)
              }} className="w-24" />
              {items.length > 1 && (
                <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="pb-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
              )}
            </div>
          ))}
          <Button variant="secondary" onClick={() => setItems([...items, { medicineId: '', quantity: 1 }])}>+ Add Item</Button>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Record Sale</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
