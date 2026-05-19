import { NextResponse } from "next/server"
import prisma from "@/database/prisma"
import { headers } from "next/headers"

// Helper to detect device type
function getDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return "Mobile"
    if (/tablet/i.test(userAgent)) return "Tablet"
    return "Desktop"
}

// Helper to get browser name
function getBrowserName(userAgent: string): string {
    if (/chrome/i.test(userAgent) && !/edg/i.test(userAgent)) return "Chrome"
    if (/firefox/i.test(userAgent)) return "Firefox"
    if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return "Safari"
    if (/edg/i.test(userAgent)) return "Edge"
    if (/opera|opr/i.test(userAgent)) return "Opera"
    return "Other"
}

// POST - Ghi lại visitor
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { page, userId, userName, referrer } = body

        const headersList = await headers()
        const ip = headersList.get("x-forwarded-for")?.split(",")[0] ||
            headersList.get("x-real-ip") ||
            "unknown"
        const userAgent = headersList.get("user-agent") || "unknown"

        await prisma.visitor.create({
            data: {
                ip,
                userAgent,
                page: page || "/",
                referrer,
                userId,
                userName,
                device: `${getDeviceType(userAgent)} - ${getBrowserName(userAgent)}`
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error logging visitor:", error)
        return NextResponse.json({ success: false, error: "Failed to log visitor" }, { status: 500 })
    }
}

// GET - Admin lấy danh sách visitors
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const pageNum = parseInt(searchParams.get("page") || "1")
        const limit = parseInt(searchParams.get("limit") || "50")
        const days = parseInt(searchParams.get("days") || "7")
        const download = searchParams.get("download") === "true"

        // Filter by date range
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - days)

        const where: any = { visitedAt: { gte: startDate } }

        // Get total count
        const totalCount = await prisma.visitor.count({ where })

        // Get visitors with pagination or full list for download
        const visitors = await prisma.visitor.findMany({
            where,
            orderBy: {
                visitedAt: 'desc'
            },
            ...(download ? {} : { skip: (pageNum - 1) * limit, take: limit })
        })

        // Calculate stats
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todayCount = await prisma.visitor.count({
            where: {
                visitedAt: { gte: today }
            }
        })

        // Unique IPs - Prisma 
        const uniqueIPsResult = await prisma.visitor.groupBy({
            by: ['ip'],
            where: where,
            _count: { ip: true }
        })

        // Unique Users
        const uniqueUsersResult = await prisma.visitor.groupBy({
            by: ['userId'],
            where: {
                ...where,
                userId: { not: null }
            },
            _count: { userId: true }
        })

        // Top pages
        const topPages = await prisma.visitor.groupBy({
            by: ['page'],
            where: where,
            _count: { id: true },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: 10
        })

        return NextResponse.json({
            success: true,
            data: visitors,
            stats: {
                totalVisitors: totalCount,
                todayVisitors: todayCount,
                uniqueVisitors: uniqueIPsResult.length,
                loggedInUsers: uniqueUsersResult.length,
                topPages: topPages.map(p => ({ page: p.page, count: p._count.id }))
            },
            pagination: {
                page: pageNum,
                limit,
                totalPages: Math.ceil(totalCount / limit),
                totalCount
            }
        })
    } catch (error) {
        console.error("Error fetching visitors:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch visitors" }, { status: 500 })
    }
}

// DELETE - Admin dọn dẹp dữ liệu cũ
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get("days") || "30")

        // Delete records older than 'days'
        const beforeDate = new Date()
        beforeDate.setDate(beforeDate.getDate() - days)

        const result = await prisma.visitor.deleteMany({
            where: {
                visitedAt: { lt: beforeDate }
            }
        })

        return NextResponse.json({
            success: true,
            deletedCount: result.count,
            message: `Đã xóa ${result.count} bản ghi cũ hơn ${days} ngày.`
        })
    } catch (error) {
        console.error("Error cleaning visitors:", error)
        return NextResponse.json({ success: false, error: "Failed to clean visitors" }, { status: 500 })
    }
}

