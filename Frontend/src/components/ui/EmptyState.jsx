export default function EmptyState({ message = 'No data found' }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  )
}
