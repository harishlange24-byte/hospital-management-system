import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { getMedicines, createMedicine, updateMedicine, deleteMedicine } from '../../api/pharmacy.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import Modal from '../../components/ui/Modal'
import { Input, Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { formatCurrency, formatDate } from '../../utils/format'

export default function AdminMedicinesPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getMedicines({ page, limit, search: search || undefined })
      setMedicines(data.data || [])
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page, search])

  const openCreate = () => {
    setEditing(null)
    reset({ name: '', brand: '', category: '', description: '', unit: 'tablet', price: '', stock: '', lowStockThreshold: 10 })
    setModalOpen(true)
  }

  const openEdit = (med) => {
    setEditing(med)
    reset(med)
    setModalOpen(true)
  }

  const onSubmit = async (formData) => {
    try {
      const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock), lowStockThreshold: Number(formData.lowStockThreshold) }
      if (editing) {
        await updateMedicine(editing._id, payload)
        toast.success('Medicine updated')
      } else {
        await createMedicine(payload)
        toast.success('Medicine created')
      }
      setModalOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this medicine?')) return
    try {
      await deleteMedicine(id)
      toast.success('Medicine deactivated')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader title="Medicines" description="Pharmacy inventory" action={<Button onClick={openCreate}><Plus className="h-4 w-4" /> Add Medicine</Button>} />

      <div className="mb-4">
        <input type="search" placeholder="Search medicines..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm" />
      </div>

      {loading ? <LoadingSpinner /> : medicines.length === 0 ? (
        <EmptyState message="No medicines found" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Brand</th>
                <th className="px-4 py-3 font-medium text-slate-600">Category</th>
                <th className="px-4 py-3 font-medium text-slate-600">Price</th>
                <th className="px-4 py-3 font-medium text-slate-600">Stock</th>
                <th className="px-4 py-3 font-medium text-slate-600">Expiry</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med) => (
                <tr key={med._id} className="border-b border-slate-100">
                  <td className="px-4 py-3">{med.name}</td>
                  <td className="px-4 py-3">{med.brand || '—'}</td>
                  <td className="px-4 py-3">{med.category || '—'}</td>
                  <td className="px-4 py-3">{formatCurrency(med.price)}</td>
                  <td className="px-4 py-3">
                    <span className={med.stock <= med.lowStockThreshold ? 'text-red-600 font-medium' : ''}>{med.stock}</span>
                  </td>
                  <td className="px-4 py-3">{formatDate(med.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => openEdit(med)} className="text-primary-600"><Pencil className="h-4 w-4" /></button>
                      <button type="button" onClick={() => handleDelete(med._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4"><Pagination pagination={pagination} onPageChange={setPage} /></div>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Medicine' : 'Add Medicine'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Name" {...register('name', { required: 'Required' })} error={errors.name?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Brand" {...register('brand')} />
            <Input label="Category" {...register('category')} />
            <Input label="Unit" {...register('unit')} />
            <Input label="Price" type="number" {...register('price', { required: 'Required' })} error={errors.price?.message} />
            <Input label="Stock" type="number" {...register('stock')} />
            <Input label="Low Stock Threshold" type="number" {...register('lowStockThreshold')} />
            <Input label="Expiry Date" type="date" {...register('expiryDate')} />
          </div>
          <Input label="Description" {...register('description')} />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
