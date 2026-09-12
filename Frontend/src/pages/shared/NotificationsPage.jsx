import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Bell, CheckCheck, Trash2 } from 'lucide-react'
import {
  getNotifications,
  markAllRead,
  markRead,
  deleteNotification,
} from '../../api/notifications.api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { Button } from '../../components/ui/FormField'
import usePagination from '../../hooks/usePagination'
import { formatDateTime } from '../../utils/format'

export default function NotificationsPage() {
  const { page, setPage, limit, pagination, setPagination } = usePagination()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data } = await getNotifications({ page, limit })
      setNotifications(data.data || [])
      setUnreadCount(data.unreadCount || 0)
      setPagination(data.pagination)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [page])

  const handleMarkAll = async () => {
    try {
      await markAllRead()
      toast.success('All marked as read')
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleMarkRead = async (id) => {
    try {
      await markRead(id)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id)
      fetchData()
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description={`${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`}
        action={unreadCount > 0 ? <Button variant="secondary" onClick={handleMarkAll}><CheckCheck className="h-4 w-4" /> Mark All Read</Button> : null}
      />

      {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
        <EmptyState message="No notifications" />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-4 rounded-xl border p-4 ${n.isRead ? 'border-slate-200 bg-white' : 'border-primary-200 bg-primary-50'}`}
            >
              <Bell className={`mt-0.5 h-5 w-5 shrink-0 ${n.isRead ? 'text-slate-400' : 'text-primary-600'}`} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800">{n.title}</p>
                <p className="mt-1 text-sm text-slate-600">{n.message}</p>
                <p className="mt-2 text-xs text-slate-400">{formatDateTime(n.createdAt)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                {!n.isRead && (
                  <button type="button" onClick={() => handleMarkRead(n._id)} className="text-primary-600 text-xs">Read</button>
                )}
                <button type="button" onClick={() => handleDelete(n._id)} className="text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
