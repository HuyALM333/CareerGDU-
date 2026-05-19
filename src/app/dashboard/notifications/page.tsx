"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Trash2, Briefcase, MessageSquare, AlertCircle, CalendarCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"

interface Notification {
  id: string
  _id?: string
  type: "job" | "message" | "interview" | "system"
  title: string
  message: string
  timestamp: string
  createdAt?: string
  read: boolean
}

const notificationIcons = {
  job: Briefcase,
  message: MessageSquare,
  interview: CalendarCheck,
  system: AlertCircle,
}

const notificationColors = {
  job: "text-blue-600",
  message: "text-green-600",
  interview: "text-yellow-600",
  system: "text-red-600",
}

function formatRelativeTime(isoString: string): string {
  const now = Date.now()
  const timestamp = new Date(isoString).getTime()
  const diff = now - timestamp

  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()

  useEffect(() => {
    const userId = user?.id || (user as any)?._id
    if (userId) {
      fetchNotifications()
    }
  }, [user?.id, (user as any)?._id])

  const fetchNotifications = async () => {
    const userId = user?.id || (user as any)?._id
    if (!userId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/notifications?userId=${userId}&role=${user?.role || ''}`)
      const result = await response.json()

      if (result.success) {
        const formattedData = result.data.map((notif: any) => ({
          ...notif,
          id: notif._id || notif.id,
          timestamp: formatRelativeTime(notif.createdAt || notif.timestamp),
        }))
        setNotifications(formattedData)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("[v0] Failed to fetch notifications:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tải thông báo",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId, action: "mark_read" }),
      })

      if (response.ok) {
        setNotifications(notifications.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
      }
    } catch (error) {
      console.error("[v0] Failed to mark notification as read:", error)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, { method: "DELETE" })
      const result = await response.json()

      if (result.success) {
        setNotifications(notifications.filter((notif) => notif.id !== notificationId))
        toast({
          title: "Đã xóa",
          description: "Đã xóa thông báo",
        })
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa thông báo",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    const userId = user?.id || (user as any)?._id
    if (!userId) return

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "mark_all_read", role: user?.role }),
      })

      if (response.ok) {
        setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
        toast({
          title: "Đã đánh dấu",
          description: "Đã đánh dấu tất cả là đã đọc",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to mark all as read:", error)
    }
  }

  const deleteAllNotifications = async () => {
    const userId = user?.id || (user as any)?._id
    if (!userId) return

    if (!confirm("Bạn có chắc chắn muốn xóa tất cả thông báo không?")) return

    try {
      const response = await fetch(`/api/notifications?action=delete_all&userId=${userId}&role=${user?.role || ''}`, {
        method: "DELETE"
      })
      const result = await response.json()

      if (result.success) {
        setNotifications([])
        toast({
          title: "Đã xóa tất cả",
          description: "Đã xóa tất cả thông báo",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to delete all notifications:", error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa tất cả thông báo",
        variant: "destructive",
      })
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Thông báo</h1>
          <p className="text-muted-foreground mt-1">Theo dõi các thông báo quan trọng</p>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Thông báo</h1>
          <p className="text-muted-foreground mt-1">
            Bạn có <span className="font-semibold text-foreground">{unreadCount}</span> thông báo chưa đọc
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Đọc tất cả
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" onClick={deleteAllNotifications} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tất cả
            </Button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12">
          <Empty>
            <Bell className="h-12 w-12" />
            <EmptyTitle>Không có thông báo</EmptyTitle>
            <EmptyDescription>Bạn sẽ nhận được thông báo khi có cập nhật mới</EmptyDescription>
          </Empty>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type]
            return (
              <Card
                key={notification.id}
                className={cn(
                  "transition-all hover:shadow-md",
                  !notification.read && "bg-blue-50/50 border-l-4 border-l-primary",
                )}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("p-3 rounded-full bg-muted", notificationColors[notification.type])}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{notification.title}</h3>
                        {!notification.read && (
                          <Badge variant="secondary" className="ml-2">
                            Mới
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                    </div>
                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsRead(notification.id)}
                          title="Đánh dấu đã đọc"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteNotification(notification.id)}
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
