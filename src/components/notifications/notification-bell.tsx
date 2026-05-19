"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check, Trash2, Briefcase, MessageSquare, Calendar, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

interface Notification {
    id: string
    type: "job" | "message" | "interview" | "system" | "visitor"
    title: string
    message: string
    read: boolean
    createdAt: string
    link?: string
}

const typeIcons = {
    job: Briefcase,
    message: MessageSquare,
    interview: Calendar,
    system: Info,
    visitor: Bell,
}

const typeColors = {
    job: "text-blue-500",
    message: "text-green-500",
    interview: "text-purple-500",
    system: "text-gray-500",
    visitor: "text-orange-500",
}

export function NotificationBell() {
    const { user } = useAuth()
    const router = useRouter()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const fetchNotifications = async () => {
        const userId = user?.id || (user as any)?.id
        if (!userId) return

        try {
            setLoading(true)
            const response = await fetch(`/api/notifications?userId=${userId}&role=${user?.role || ''}`)
            const data = await response.json()

            if (data.success) {
                setNotifications(data.data)
                setUnreadCount(data.unreadCount)
            }
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
    fetchNotifications()

    const interval = setInterval(() => {
        fetchNotifications()
    }, 30000)

    return () => clearInterval(interval)
}, [user?.id])

    const markAsRead = async (notificationId: string) => {
    try {
        const res = await fetch("/api/notifications", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ notificationId, action: "mark_read" }),
        })

        const data = await res.json()

        if (!data.success) {
            throw new Error("Mark read failed")
        }

        // update UI
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        )

        setUnreadCount(prev => prev > 0 ? prev - 1 : 0)

    } catch (error) {
        console.error("Error marking notification as read:", error)
    }
}

    const markAllAsRead = async () => {
        const userId = user?.id || (user as any)?.id
        if (!userId) return

        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action: "mark_all_read", role: user?.role }),
            })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
    }

    const deleteNotification = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications?id=${notificationId}`, {
                method: "DELETE",
            })
            setNotifications(prev => prev.filter(n => n.id !== notificationId))
        } catch (error) {
            console.error("Error deleting notification:", error)
        }
    }

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return "Vừa xong"
        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        if (days < 7) return `${days} ngày trước`
        return date.toLocaleDateString("vi-VN")
    }

    if (!user) return null

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative text-primary hover:bg-primary/10"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-semibold">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-96 overflow-y-auto">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <h3 className="font-semibold text-sm">Thông báo</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-primary hover:text-primary/80"
                            onClick={markAllAsRead}
                        >
                            <Check className="h-3 w-3 mr-1" />
                            Đọc tất cả
                        </Button>
                    )}
                </div>

                {loading && notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        Đang tải...
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        Không có thông báo
                    </div>
                ) : (
                    notifications.slice(0, 10).map((notification) => {
                        const Icon = typeIcons[notification.type] || Bell
                        const colorClass = typeColors[notification.type] || "text-gray-500"

                        return (
                            <DropdownMenuItem
                                key={notification.id}
                                className={`flex items-start gap-3 p-3 cursor-pointer ${!notification.read ? "bg-blue-50" : ""
                                    }`}
                                onClick={async () => {
    try {
        if (!notification.read) {
            await markAsRead(notification.id)
        }

        if (notification.link) {
            if (notification.link.startsWith('http')) {
                window.location.href = notification.link
            } else {
                if (notification.type === 'job' && notification.link === '/dashboard') {
                    router.push('/dashboard/jobs')
                } else {
                    router.push(notification.link)
                }
            }
            setOpen(false)
        }
    } catch (err) {
        console.error(err)
    }
}}
                            >
                                <div className={`mt-0.5 ${colorClass}`}>
                                    <Icon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${!notification.read ? "text-gray-900" : "text-gray-600"}`}>
                                        {notification.title}
                                    </p>
                                    <p className="text-xs text-gray-500 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {formatTime(notification.createdAt)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-gray-400 hover:text-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteNotification(notification.id)
                                    }}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </DropdownMenuItem>
                        )
                    })
                )}

                {notifications.length > 10 && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-center text-primary text-sm py-2 cursor-pointer"
                            onClick={() => {
                                router.push('/dashboard/notifications')
                                setOpen(false)
                            }}
                        >
                            Xem tất cả thông báo
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
