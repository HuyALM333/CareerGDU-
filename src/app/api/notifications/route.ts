import { NextResponse } from "next/server"
import prisma from "@/database/prisma"

// GET - Lấy notifications của user
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get("userId")
        const role = searchParams.get("role")?.toLowerCase()

        if (!userId) {
            return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 })
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { createdAt: true }
        })

        const userCreatedAt = user?.createdAt || new Date(0)

        // Build where clause based on role
        let where: any = {
            OR: [
                { userId: userId },
                {
                    targetRole: role === 'admin' ? 'admin' : (role === 'employer' ? 'employer' : undefined),
                    createdAt: { gte: userCreatedAt }
                }
            ]
        }

        // Clean up undefined in targetRole if needed
        if (!role || (role !== 'admin' && role !== 'employer')) {
            where = { userId: userId }
        }

        const notifications = await prisma.notification.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            take: 50
        })

        const unreadCount = notifications.filter((n) => !n.read).length

        return NextResponse.json({
            success: true,
            data: notifications,
            unreadCount,
        })
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 })
    }
}

// POST - Tạo notification mới
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { userId, targetRole, type, title, message, link } = body

        if ((!userId && !targetRole) || !type || !title || !message) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                targetRole,
                type,
                title,
                message,
                link,
                read: false
            }
        })

        return NextResponse.json({
            success: true,
            data: notification,
        })
    } catch (error) {
        console.error("Error creating notification:", error)
        return NextResponse.json({ success: false, error: "Failed to create notification" }, { status: 500 })
    }
}

// PATCH - Đánh dấu đã đọc
export async function PATCH(request: Request) {
    try {
        const { notificationId, action, userId, role } = await request.json()

        if (action === "mark_read" && notificationId) {
            await prisma.notification.update({
                where: { id: notificationId },
                data: { read: true }
            })
            return NextResponse.json({
                success: true,
                message: "Notification marked as read",
            })
        }

        if (action === "mark_all_read" && userId) {
            let where: any = { userId, read: false }

            if (role === 'admin' || role === 'employer') {
                where = {
                    OR: [
                        { userId, read: false },
                        { targetRole: role, read: false }
                    ]
                }
            }

            await prisma.notification.updateMany({
                where,
                data: { read: true }
            })
            return NextResponse.json({
                success: true,
                message: "All notifications marked as read",
            })
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    } catch (error) {
        console.error("Error updating notification:", error)
        return NextResponse.json({ success: false, error: "Failed to update notification" }, { status: 500 })
    }
}

// DELETE - Xóa notification
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const notificationId = searchParams.get("id")
        const action = searchParams.get("action")
        const userId = searchParams.get("userId")
        const role = searchParams.get("role")?.toLowerCase()

        if (action === "delete_all") {
            if (!userId) {
                return NextResponse.json({ success: false, error: "userId is required for delete_all" }, { status: 400 })
            }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { createdAt: true }
            })
            const userCreatedAt = user?.createdAt || new Date(0)

            let where: any = { userId }
            if (role === 'admin' || role === 'employer') {
                where = {
                    OR: [
                        { userId },
                        {
                            targetRole: role,
                            createdAt: { gte: userCreatedAt }
                        }
                    ]
                }
            }

            const result = await prisma.notification.deleteMany({ where })

            return NextResponse.json({
                success: true,
                message: `Deleted ${result.count} notifications`,
            })
        }

        if (!notificationId) {
            return NextResponse.json({ success: false, error: "Notification ID is required" }, { status: 400 })
        }

        await prisma.notification.delete({
            where: { id: notificationId }
        })

        return NextResponse.json({
            success: true,
            message: "Notification deleted successfully",
        })
    } catch (error) {
        console.error("Error deleting notification:", error)
        return NextResponse.json({ success: false, error: "Failed to delete notification" }, { status: 500 })
    }
}

